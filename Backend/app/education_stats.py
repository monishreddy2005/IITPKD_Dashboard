from datetime import date

from flask import Blueprint, jsonify, request
from psycopg2.errors import UndefinedTable

from .auth import token_required
from .db import get_db_connection

education_bp = Blueprint('education', __name__)

ENGAGEMENT_TYPES = ['Adjunct', 'Honorary', 'Visiting', 'FacultyFellow', 'PoP']
ENGAGEMENT_TABLE_NAME = 'faculty_engagement'


def build_filter_query(filters):
    conditions = []
    params = []

    mapping = {
        'year': 'year',
        'department': 'department',
        'engagement_type': 'engagement_type'
    }

    for key, column in mapping.items():
        value = filters.get(key)
        if value in (None, '', 'All'):
            continue
        conditions.append(f"{column} = %s")
        params.append(value)

    where_clause = ''
    if conditions:
        where_clause = 'WHERE ' + ' AND '.join(conditions)
    return where_clause, params


def fetch_rows(where_clause, params, extra_columns=''):
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None, 'Database connection failed.'
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT
                engagement_code,
                faculty_name,
                engagement_type,
                department,
                startdate,
                enddate,
                duration_months,
                year,
                remarks
                {extra_columns}
            FROM faculty_engagement
            {where_clause}
            """,
            params
        )
        rows = cur.fetchall()
        return rows, None
    except UndefinedTable:
        return None, f"Faculty engagement table '{ENGAGEMENT_TABLE_NAME}' is missing. Please run the latest schema migrations."
    except Exception as exc:
        print(f"Education stats error: {exc}")
        return None, 'Failed to fetch faculty engagement data.'
def faculty_engagement_table_exists():
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        cur = conn.cursor()
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = %s
            ) AS exists_flag;
            """,
            (ENGAGEMENT_TABLE_NAME,)
        )
        row = cur.fetchone()
        return bool(row and row['exists_flag'])
    except Exception as exc:
        print(f"Education table existence check failed: {exc}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
def compute_summary(rows):
    today = date.today()
    summary_map = {eng_type: {'total': 0, 'active': 0} for eng_type in ENGAGEMENT_TYPES}
    for row in rows:
        engagement_type = row.get('engagement_type')
        if engagement_type not in summary_map:
            summary_map[engagement_type] = {'total': 0, 'active': 0}
        summary_map[engagement_type]['total'] += 1

        enddate = row.get('enddate')
        if enddate is None or (isinstance(enddate, date) and enddate >= today):
            summary_map[engagement_type]['active'] += 1

    overall_total = sum(item['total'] for item in summary_map.values())
    overall_active = sum(item['active'] for item in summary_map.values())

    return summary_map, overall_total, overall_active


@education_bp.route('/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    if not faculty_engagement_table_exists():
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            """
            SELECT
                ARRAY(
                    SELECT DISTINCT year FROM faculty_engagement
                    WHERE year IS NOT NULL ORDER BY year DESC
                ) AS years,
                ARRAY(
                    SELECT DISTINCT department FROM faculty_engagement
                    WHERE department IS NOT NULL AND department <> ''
                    ORDER BY department
                ) AS departments,
                ARRAY(
                    SELECT DISTINCT engagement_type FROM faculty_engagement
                    ORDER BY engagement_type
                ) AS engagement_types
            """
        )
        row = cur.fetchone()
        return jsonify({
            'years': row['years'] if row and row['years'] else [],
            'departments': row['departments'] if row and row['departments'] else [],
            'engagement_types': row['engagement_types'] if row and row['engagement_types'] else ENGAGEMENT_TYPES
        }), 200
    except Exception as exc:
        print(f"Education filter options error: {exc}")
        return jsonify({'message': 'Failed to fetch filter options.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@education_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    if not faculty_engagement_table_exists():
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500

    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'engagement_type': request.args.get('engagement_type')
    }
    where_clause, params = build_filter_query(filters)
    rows, error = fetch_rows(where_clause, params)
    if error:
        return jsonify({'message': error}), 500

    summary_map, overall_total, overall_active = compute_summary(rows)

    summary_list = []
    for eng_type in ENGAGEMENT_TYPES:
        data = summary_map.get(eng_type, {'total': 0, 'active': 0})
        summary_list.append({
            'engagement_type': eng_type,
            'total': data['total'],
            'active': data['active']
        })

    return jsonify({
        'data': {
            'summary': summary_list,
            'overall_total': overall_total,
            'overall_active': overall_active,
            'filters_applied': filters
        }
    }), 200


@education_bp.route('/department-breakdown', methods=['GET'])
@token_required
def get_department_breakdown(current_user_id):
    if not faculty_engagement_table_exists():
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500

    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'engagement_type': request.args.get('engagement_type')
    }
    where_clause, params = build_filter_query(filters)

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT department,
                   engagement_type,
                   COUNT(*) AS total,
                   SUM(
                       CASE
                           WHEN enddate IS NULL OR enddate >= CURRENT_DATE THEN 1
                           ELSE 0
                       END
                   ) AS active
            FROM faculty_engagement
            {where_clause}
            GROUP BY department, engagement_type
            ORDER BY department, engagement_type
            """,
            params
        )
        rows = cur.fetchall()

        breakdown_map = {}
        for row in rows:
            dept = row['department'] or 'Unknown'
            if dept not in breakdown_map:
                breakdown_map[dept] = {
                    'department': dept,
                    'details': {eng_type: {'total': 0, 'active': 0} for eng_type in ENGAGEMENT_TYPES}
                }
            breakdown_map[dept]['details'][row['engagement_type']] = {
                'total': row['total'],
                'active': row['active']
            }

        formatted = []
        for dept, data in sorted(breakdown_map.items()):
            entry = {'department': dept}
            totals = 0
            actives = 0
            for eng_type in ENGAGEMENT_TYPES:
                entry[f"{eng_type}_total"] = data['details'][eng_type]['total']
                entry[f"{eng_type}_active"] = data['details'][eng_type]['active']
                totals += data['details'][eng_type]['total']
                actives += data['details'][eng_type]['active']
            entry['total'] = totals
            entry['active'] = actives
            formatted.append(entry)

        return jsonify({'data': formatted}), 200
    except UndefinedTable:
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500
    except Exception as exc:
        print(f"Education department breakdown error: {exc}")
        return jsonify({'message': 'Failed to fetch department breakdown.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@education_bp.route('/year-trend', methods=['GET'])
@token_required
def get_year_trend(current_user_id):
    if not faculty_engagement_table_exists():
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500

    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'engagement_type': request.args.get('engagement_type')
    }
    where_clause, params = build_filter_query(filters)

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT year,
                   engagement_type,
                   COUNT(*) AS total
            FROM faculty_engagement
            {where_clause}
            GROUP BY year, engagement_type
            ORDER BY year ASC, engagement_type
            """,
            params
        )
        rows = cur.fetchall()

        trend_map = {}
        for row in rows:
            year = row['year']
            if year is None:
                continue
            if year not in trend_map:
                trend_map[year] = {eng_type: 0 for eng_type in ENGAGEMENT_TYPES}
                trend_map[year]['year'] = year
            trend_map[year][row['engagement_type']] = row['total']

        trend_list = [trend_map[year] for year in sorted(trend_map.keys())]
        return jsonify({'data': trend_list}), 200
    except UndefinedTable:
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500
    except Exception as exc:
        print(f"Education year trend error: {exc}")
        return jsonify({'message': 'Failed to fetch year trend.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@education_bp.route('/type-distribution', methods=['GET'])
@token_required
def get_type_distribution(current_user_id):
    if not faculty_engagement_table_exists():
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500

    filters = {
        'year': request.args.get('year'),
        'department': request.args.get('department'),
        'engagement_type': request.args.get('engagement_type')
    }
    where_clause, params = build_filter_query(filters)

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT engagement_type,
                   COUNT(*) AS total
            FROM faculty_engagement
            {where_clause}
            GROUP BY engagement_type
            ORDER BY engagement_type
            """,
            params
        )
        rows = cur.fetchall()
        distribution = [{'engagement_type': row['engagement_type'], 'total': row['total']} for row in rows]
        return jsonify({'data': distribution}), 200
    except UndefinedTable:
        return jsonify({
            'message': (
                "Faculty engagement table not found. Please apply the latest schema.sql "
                "so the education dashboards can load data."
            )
        }), 500
    except Exception as exc:
        print(f"Education type distribution error: {exc}")
        return jsonify({'message': 'Failed to fetch type distribution.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

