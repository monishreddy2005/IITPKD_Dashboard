from flask import Blueprint, jsonify, request

from .auth import token_required
from .db import get_db_connection

iar_bp = Blueprint('iar', __name__)


HIGHER_STUDIES_KEYWORDS = (
    'research',
    'phd',
    'ms',
    'msc',
    'm.s',
    'm.sc',
    'fellow',
    'scholar',
    'professor',
    'lecturer',
    'postdoc',
    'post doctoral',
    'graduate',
    'student'
)


def build_filter_query(filters):
    conditions = []
    params = []

    mapping = {
        'year': 's.yearofadmission',
        'department': 's.department',
        'gender': 's.gender',
        'program': 's.program',
        'category': 's.category'
    }

    for key, column in mapping.items():
        value = filters.get(key)
        if value is None or value == '' or value == 'All':
            continue
        conditions.append(f"{column} = %s")
        params.append(value)

    where_clause = ''
    if conditions:
        where_clause = 'WHERE ' + ' AND '.join(conditions)
    return where_clause, params


def apply_filters_and_fetch(where_clause, params, extra_select='', extra_group_by=''):
    """
    Helper that returns joined alumni + student dataset per filters.
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None, 'Database connection failed.'

        cur = conn.cursor()
        query = f"""
            SELECT
                a.rollno,
                a.name,
                a.alumniidno,
                a.currentdesignation,
                a.jobcountry,
                a.jobplace,
                s.yearofadmission,
                s.program,
                s.department,
                s.state,
                s.category,
                s.gender
                {extra_select}
            FROM alumni a
            JOIN student s ON s.rollno = a.rollno
            {where_clause}
            {extra_group_by}
        """
        cur.execute(query, params)
        rows = cur.fetchall()
        return rows, None
    except Exception as exc:
        print(f"IAR stats error: {exc}")
        return None, 'Failed to fetch alumni data.'
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def detect_higher_studies(designation: str) -> bool:
    if not designation:
        return False
    lower = designation.lower()
    return any(keyword in lower for keyword in HIGHER_STUDIES_KEYWORDS)


@iar_bp.route('/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500

        cur = conn.cursor()
        cur.execute("""
            SELECT
                ARRAY(SELECT DISTINCT yearofadmission FROM student ORDER BY yearofadmission DESC) AS years,
                ARRAY(SELECT DISTINCT department FROM student WHERE department IS NOT NULL AND department != '' ORDER BY department) AS departments,
                ARRAY(SELECT DISTINCT gender FROM student WHERE gender IS NOT NULL ORDER BY gender) AS genders,
                ARRAY(SELECT DISTINCT program FROM student ORDER BY program) AS programs,
                ARRAY(SELECT DISTINCT category FROM student WHERE category IS NOT NULL ORDER BY category) AS categories
        """)
        row = cur.fetchone()
        return jsonify({
            'years': row['years'] if row and row['years'] else [],
            'departments': row['departments'] if row and row['departments'] else [],
            'genders': row['genders'] if row and row['genders'] else [],
            'programs': row['programs'] if row and row['programs'] else [],
            'categories': row['categories'] if row and row['categories'] else []
        }), 200
    except Exception as exc:
        print(f"IAR filter options error: {exc}")
        return jsonify({'message': 'Failed to fetch filter options.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@iar_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'gender': request.args.get('gender'),
        'program': request.args.get('program'),
        'category': request.args.get('category')
    }

    where_clause, params = build_filter_query(filters)
    rows, error = apply_filters_and_fetch(where_clause, params)
    if error:
        return jsonify({'message': error}), 500

    total_alumni = len(rows)
    higher_studies = sum(1 for row in rows if detect_higher_studies(row['currentdesignation']))
    corporate = total_alumni - higher_studies

    by_year = {}
    for row in rows:
        year = row['yearofadmission']
        if year not in by_year:
            by_year[year] = {'total': 0, 'higher': 0, 'corporate': 0}
        by_year[year]['total'] += 1
        if detect_higher_studies(row['currentdesignation']):
            by_year[year]['higher'] += 1
        else:
            by_year[year]['corporate'] += 1

    trend = [
        {
            'year': year,
            'total': counts['total'],
            'higher': counts['higher'],
            'corporate': counts['corporate']
        }
        for year, counts in sorted(by_year.items())
    ]

    return jsonify({
        'data': {
            'total_alumni': total_alumni,
            'higher_studies': higher_studies,
            'corporate': corporate,
            'trend': trend
        }
    }), 200


@iar_bp.route('/state-distribution', methods=['GET'])
@token_required
def get_state_distribution(current_user_id):
    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'gender': request.args.get('gender'),
        'program': request.args.get('program'),
        'category': request.args.get('category')
    }

    where_clause, params = build_filter_query(filters)
    rows, error = apply_filters_and_fetch(where_clause, params)
    if error:
        return jsonify({'message': error}), 500

    distribution = {}
    for row in rows:
        state = row['state'] or 'Unknown'
        distribution[state] = distribution.get(state, 0) + 1

    formatted = [{'state': state, 'count': count} for state, count in sorted(distribution.items(), key=lambda x: x[0])]
    return jsonify({'data': formatted}), 200


@iar_bp.route('/country-distribution', methods=['GET'])
@token_required
def get_country_distribution(current_user_id):
    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'gender': request.args.get('gender'),
        'program': request.args.get('program'),
        'category': request.args.get('category')
    }

    where_clause, params = build_filter_query(filters)
    rows, error = apply_filters_and_fetch(where_clause, params)
    if error:
        return jsonify({'message': error}), 500

    distribution = {}
    for row in rows:
        country = row['jobcountry'] or 'Unknown'
        distribution[country] = distribution.get(country, 0) + 1

    formatted = [{'country': country, 'count': count} for country, count in sorted(distribution.items(), key=lambda x: (-x[1], x[0]))]
    return jsonify({'data': formatted}), 200


@iar_bp.route('/outcome-breakdown', methods=['GET'])
@token_required
def get_outcome_breakdown(current_user_id):
    """
    Returns per-department counts for higher studies vs corporate.
    """
    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'gender': request.args.get('gender'),
        'program': request.args.get('program'),
        'category': request.args.get('category')
    }

    where_clause, params = build_filter_query(filters)
    rows, error = apply_filters_and_fetch(where_clause, params)
    if error:
        return jsonify({'message': error}), 500

    breakdown = {}
    for row in rows:
        dept = row['department'] or 'Unknown'
        if dept not in breakdown:
            breakdown[dept] = {'department': dept, 'higher': 0, 'corporate': 0, 'total': 0}
        breakdown[dept]['total'] += 1
        if detect_higher_studies(row['currentdesignation']):
            breakdown[dept]['higher'] += 1
        else:
            breakdown[dept]['corporate'] += 1

    formatted = sorted(breakdown.values(), key=lambda x: x['department'])
    return jsonify({'data': formatted}), 200

