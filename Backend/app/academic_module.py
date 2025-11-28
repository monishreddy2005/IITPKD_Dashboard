from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Sequence, Tuple

from flask import Blueprint, jsonify, request
from psycopg2.errors import UndefinedTable

from .auth import token_required
from .db import get_db_connection

academic_module_bp = Blueprint('academic_module', __name__)

INDUSTRY_TABLE = 'industry_courses'
PROGRAM_TABLE = 'academic_program_launch'


def build_where_clause(filters: Dict[str, Any], mapping: Dict[str, str]) -> Tuple[str, List[Any]]:
    conditions: List[str] = []
    params: List[Any] = []

    for key, column in mapping.items():
        value = filters.get(key)
        if value in (None, '', 'All'):
            continue
        conditions.append(f"{column} = %s")
        params.append(value)

    clause = ''
    if conditions:
        clause = 'WHERE ' + ' AND '.join(conditions)
    return clause, params


def table_exists(table_name: str) -> bool:
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
            (table_name,)
        )
        row = cur.fetchone()
        return bool(row and row.get('exists_flag'))
    except Exception as exc:
        print(f"Academic module table check failed ({table_name}): {exc}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def module_tables_available() -> bool:
    return table_exists(INDUSTRY_TABLE) and table_exists(PROGRAM_TABLE)


@academic_module_bp.route('/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    if not module_tables_available():
        return jsonify({
            'message': (
                "Academic module tables are missing. Please apply the latest schema migrations before accessing this dashboard."
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
                ARRAY(SELECT DISTINCT department FROM industry_courses ORDER BY department) AS departments,
                ARRAY(SELECT DISTINCT year_offered FROM industry_courses ORDER BY year_offered DESC) AS course_years,
                ARRAY(SELECT DISTINCT program_type FROM academic_program_launch ORDER BY program_type) AS program_types,
                ARRAY(SELECT DISTINCT launch_year FROM academic_program_launch ORDER BY launch_year DESC) AS program_years
            """
        )
        row = cur.fetchone() or {}
        return jsonify({
            'departments': row.get('departments') or [],
            'course_years': row.get('course_years') or [],
            'program_types': row.get('program_types') or [],
            'program_years': row.get('program_years') or []
        }), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Academic module filter error: {exc}")
        return jsonify({'message': 'Failed to fetch filter options.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@academic_module_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    filters = {
        'department': request.args.get('department'),
        'course_year': request.args.get('course_year'),
        'program_type': request.args.get('program_type'),
        'program_year': request.args.get('program_year')
    }

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        course_where, course_params = build_where_clause(
            {'department': filters['department'], 'course_year': filters['course_year']},
            {'department': 'department', 'course_year': 'year_offered'}
        )
        cur.execute(
            f"""
            SELECT COUNT(*) AS total_courses,
                   COUNT(DISTINCT department) AS distinct_departments
            FROM {INDUSTRY_TABLE}
            {course_where}
            """,
            course_params
        )
        course_row = cur.fetchone() or {'total_courses': 0, 'distinct_departments': 0}

        program_where, program_params = build_where_clause(
            {'program_type': filters['program_type'], 'program_year': filters['program_year']},
            {'program_type': 'program_type', 'program_year': 'launch_year'}
        )
        cur.execute(
            f"""
            SELECT COUNT(*) AS total_programs,
                   COUNT(DISTINCT program_type) AS distinct_program_types,
                   COALESCE(SUM(oelp_students), 0) AS total_oelp
            FROM {PROGRAM_TABLE}
            {program_where}
            """,
            program_params
        )
        program_row = cur.fetchone() or {'total_programs': 0, 'distinct_program_types': 0, 'total_oelp': 0}

        summary = {
            'total_courses': int(course_row.get('total_courses') or 0),
            'distinct_departments': int(course_row.get('distinct_departments') or 0),
            'total_programs': int(program_row.get('total_programs') or 0),
            'distinct_program_types': int(program_row.get('distinct_program_types') or 0),
            'total_oelp_students': int(program_row.get('total_oelp') or 0)
        }
        return jsonify({'data': summary}), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Academic module summary error: {exc}")
        return jsonify({'message': 'Failed to compute summary.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@academic_module_bp.route('/industry-course-trend', methods=['GET'])
@token_required
def get_industry_course_trend(current_user_id):
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    filters = {
        'department': request.args.get('department')
    }

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        where_clause, params = build_where_clause(filters, {'department': 'department'})
        cur.execute(
            f"""
            SELECT year_offered AS year, COUNT(*) AS course_count
            FROM {INDUSTRY_TABLE}
            {where_clause}
            GROUP BY year_offered
            ORDER BY year_offered
            """,
            params
        )
        rows = cur.fetchall() or []
        data = [
            {
                'year': row.get('year'),
                'course_count': int(row.get('course_count') or 0)
            }
            for row in rows
        ]
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Industry course trend error: {exc}")
        return jsonify({'message': 'Failed to fetch industry course trend.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@academic_module_bp.route('/industry-courses', methods=['GET'])
@token_required
def get_industry_courses(current_user_id):
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    filters = {
        'department': request.args.get('department'),
        'course_year': request.args.get('course_year')
    }

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        where_clause, params = build_where_clause(
            filters,
            {'department': 'department', 'course_year': 'year_offered'}
        )
        cur.execute(
            f"""
            SELECT course_id, course_title, department, industry_partner, year_offered, is_active
            FROM {INDUSTRY_TABLE}
            {where_clause}
            ORDER BY year_offered DESC, course_title ASC
            """,
            params
        )
        rows = cur.fetchall() or []
        data = [
            {
                'course_id': row.get('course_id'),
                'course_title': row.get('course_title'),
                'department': row.get('department'),
                'industry_partner': row.get('industry_partner'),
                'year_offered': row.get('year_offered'),
                'is_active': bool(row.get('is_active'))
            }
            for row in rows
        ]
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Industry course list error: {exc}")
        return jsonify({'message': 'Failed to fetch industry course list.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@academic_module_bp.route('/program-launch-stats', methods=['GET'])
@token_required
def get_program_launch_stats(current_user_id):
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    filters = {
        'program_type': request.args.get('program_type'),
        'program_year': request.args.get('program_year')
    }

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        where_clause, params = build_where_clause(
            filters,
            {'program_type': 'program_type', 'program_year': 'launch_year'}
        )
        cur.execute(
            f"""
            SELECT launch_year, program_type, COUNT(*) AS total_programs
            FROM {PROGRAM_TABLE}
            {where_clause}
            GROUP BY launch_year, program_type
            ORDER BY launch_year
            """,
            params
        )
        rows = cur.fetchall() or []
        aggregated: Dict[int, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        for row in rows:
            year = row.get('launch_year')
            program_type = row.get('program_type')
            total = int(row.get('total_programs') or 0)
            aggregated[year][program_type] += total
            aggregated[year]['total'] += total

        data = []
        for year in sorted(aggregated.keys()):
            entry = {'year': year, 'total': aggregated[year]['total']}
            for p_type, count in aggregated[year].items():
                if p_type == 'total':
                    continue
                entry[p_type] = count
            data.append(entry)
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Program launch stats error: {exc}")
        return jsonify({'message': 'Failed to fetch program launch statistics.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@academic_module_bp.route('/program-list', methods=['GET'])
@token_required
def get_program_list(current_user_id):
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    filters = {
        'program_type': request.args.get('program_type'),
        'program_year': request.args.get('program_year')
    }

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        where_clause, params = build_where_clause(
            filters,
            {'program_type': 'program_type', 'program_year': 'launch_year'}
        )
        cur.execute(
            f"""
            SELECT program_code, program_name, program_type, department, launch_year, oelp_students
            FROM {PROGRAM_TABLE}
            {where_clause}
            ORDER BY launch_year DESC, program_name ASC
            """,
            params
        )
        rows = cur.fetchall() or []
        data = [
            {
                'program_code': row.get('program_code'),
                'program_name': row.get('program_name'),
                'program_type': row.get('program_type'),
                'department': row.get('department'),
                'launch_year': row.get('launch_year'),
                'oelp_students': int(row.get('oelp_students') or 0)
            }
            for row in rows
        ]
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Program list error: {exc}")
        return jsonify({'message': 'Failed to fetch academic program list.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
