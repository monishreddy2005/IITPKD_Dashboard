from flask import Blueprint, jsonify, request

from .auth import token_required
from .db import get_db_connection

iar_bp = Blueprint('iar', __name__)


def build_filter_query(filters):
    conditions = []
    params = []

    mapping = {
        'year': 'a.yearofgraduation',
        'department': 'a.department',
        'gender': 'a.gender',
        'program': 'a.program',
        'category': 'a.category'
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


def apply_filters_and_fetch(where_clause, params, order_clause='ORDER BY a.yearofgraduation ASC'):
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
                a.yearofgraduation,
                a.program,
                a.department,
                a.homestate,
                a.jobstate,
                a.category,
                a.gender,
                a.outcome,
                a.employer_or_institution,
                a.updated_at
            FROM alumni a
            {where_clause}
            {order_clause}
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


def classify_outcome(row):
    outcome = row.get('outcome')
    if outcome in ('HigherStudies', 'Corporate', 'Entrepreneurship', 'Other'):
        return outcome

    designation = row.get('currentdesignation') or ''
    lower = designation.lower()
    keywords = ('research', 'phd', 'ms', 'msc', 'fellow', 'scholar', 'professor', 'lecturer', 'postdoc')
    if any(keyword in lower for keyword in keywords):
        return 'HigherStudies'
    return 'Corporate'


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
                ARRAY(SELECT DISTINCT yearofgraduation FROM alumni WHERE yearofgraduation IS NOT NULL ORDER BY yearofgraduation DESC) AS years,
                ARRAY(SELECT DISTINCT department FROM alumni WHERE department IS NOT NULL AND department != '' ORDER BY department) AS departments,
                ARRAY(SELECT DISTINCT gender FROM alumni WHERE gender IS NOT NULL ORDER BY gender) AS genders,
                ARRAY(SELECT DISTINCT program FROM alumni WHERE program IS NOT NULL ORDER BY program) AS programs,
                ARRAY(SELECT DISTINCT category FROM alumni WHERE category IS NOT NULL ORDER BY category) AS categories
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
    higher_studies = sum(1 for row in rows if classify_outcome(row) == 'HigherStudies')
    corporate = sum(1 for row in rows if classify_outcome(row) == 'Corporate')

    by_year = {}
    for row in rows:
        year = row['yearofgraduation']
        if year is None:
            continue
        if year not in by_year:
            by_year[year] = {'total': 0, 'higher': 0, 'corporate': 0}
        by_year[year]['total'] += 1
        outcome = classify_outcome(row)
        if outcome == 'HigherStudies':
            by_year[year]['higher'] += 1
        elif outcome == 'Corporate':
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
        state = row['homestate'] or 'Unknown'
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
        outcome = classify_outcome(row)
        if outcome == 'HigherStudies':
            breakdown[dept]['higher'] += 1
        elif outcome == 'Corporate':
            breakdown[dept]['corporate'] += 1

    formatted = sorted(breakdown.values(), key=lambda x: x['department'])
    return jsonify({'data': formatted}), 200

