"""
Blueprint providing analytics for the Academic module.
Uses `courses_table` (which replaced `industry_courses` and `academic_program_launch`).
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Tuple

from flask import Blueprint, jsonify, request
from psycopg2.errors import UndefinedTable

from .auth import token_required
from .db import get_db_connection

academic_module_bp = Blueprint('academic_module', __name__)

COURSES_TABLE = 'courses_table'


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
    return table_exists(COURSES_TABLE)


# ===================== Filter Options =====================

@academic_module_bp.route('/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        cur.execute(f"""
            SELECT
                ARRAY(SELECT DISTINCT course_category FROM {COURSES_TABLE}
                      WHERE course_category IS NOT NULL ORDER BY course_category) AS categories,
                ARRAY(SELECT DISTINCT target_programme FROM {COURSES_TABLE}
                      WHERE target_programme IS NOT NULL ORDER BY target_programme) AS programmes,
                ARRAY(SELECT DISTINCT offering_status FROM {COURSES_TABLE}
                      WHERE offering_status IS NOT NULL ORDER BY offering_status) AS statuses,
                ARRAY(SELECT DISTINCT proposal_type FROM {COURSES_TABLE}
                      WHERE proposal_type IS NOT NULL ORDER BY proposal_type) AS proposal_types,
                ARRAY(SELECT DISTINCT target_discipline FROM {COURSES_TABLE}
                      WHERE target_discipline IS NOT NULL ORDER BY target_discipline) AS disciplines
        """)
        row = cur.fetchone() or {}
        return jsonify({
            'categories': row.get('categories') or [],
            'programmes': row.get('programmes') or [],
            'statuses': row.get('statuses') or [],
            'proposal_types': row.get('proposal_types') or [],
            'disciplines': row.get('disciplines') or []
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


# ===================== Summary =====================

@academic_module_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    filters = {
        'category': request.args.get('category'),
        'programme': request.args.get('programme'),
        'status': request.args.get('status'),
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
            {
                'category': 'course_category',
                'programme': 'target_programme',
                'status': 'offering_status',
            }
        )
        cur.execute(
            f"""
            SELECT
                COUNT(*) AS total_courses,
                COUNT(DISTINCT course_category) AS distinct_categories,
                COUNT(DISTINCT target_programme) AS distinct_programmes,
                COUNT(DISTINCT target_discipline) AS distinct_disciplines,
                COUNT(CASE WHEN offering_status = 'ACTIVE' THEN 1 END) AS active_courses,
                COUNT(CASE WHEN offering_status = 'INACTIVE' THEN 1 END) AS inactive_courses
            FROM {COURSES_TABLE}
            {where_clause}
            """,
            params
        )
        row = cur.fetchone() or {}

        summary = {
            'total_courses': int(row.get('total_courses') or 0),
            'distinct_categories': int(row.get('distinct_categories') or 0),
            'distinct_programmes': int(row.get('distinct_programmes') or 0),
            'distinct_disciplines': int(row.get('distinct_disciplines') or 0),
            'active_courses': int(row.get('active_courses') or 0),
            'inactive_courses': int(row.get('inactive_courses') or 0),
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


# ===================== Category Breakdown =====================

@academic_module_bp.route('/category-breakdown', methods=['GET'])
@token_required
def get_category_breakdown(current_user_id):
    """Course count by category (CORE, ELECTIVE, MOOC)."""
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        cur.execute(f"""
            SELECT
                COALESCE(course_category, 'Uncategorized') AS category,
                COUNT(*) AS count
            FROM {COURSES_TABLE}
            GROUP BY course_category
            ORDER BY count DESC;
        """)
        rows = cur.fetchall() or []
        data = [
            {'category': row.get('category'), 'count': int(row.get('count') or 0)}
            for row in rows
        ]
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Category breakdown error: {exc}")
        return jsonify({'message': 'Failed to fetch category breakdown.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ===================== Programme Breakdown =====================

@academic_module_bp.route('/programme-breakdown', methods=['GET'])
@token_required
def get_programme_breakdown(current_user_id):
    """Course count by target programme (BTECH, MTECH, MSC, PHD)."""
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        cur.execute(f"""
            SELECT
                COALESCE(target_programme, 'Unspecified') AS programme,
                COUNT(*) AS count
            FROM {COURSES_TABLE}
            GROUP BY target_programme
            ORDER BY count DESC;
        """)
        rows = cur.fetchall() or []
        data = [
            {'programme': row.get('programme'), 'count': int(row.get('count') or 0)}
            for row in rows
        ]
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Programme breakdown error: {exc}")
        return jsonify({'message': 'Failed to fetch programme breakdown.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ===================== Course List =====================

@academic_module_bp.route('/courses', methods=['GET'])
@token_required
def get_courses(current_user_id):
    """Paginated, filterable course list."""
    if not module_tables_available():
        return jsonify({'message': 'Academic module tables are missing.'}), 500

    filters = {
        'category': request.args.get('category'),
        'programme': request.args.get('programme'),
        'status': request.args.get('status'),
        'proposal_type': request.args.get('proposal_type'),
    }
    search = request.args.get('search', '', type=str).strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()

        where_clause, params = build_where_clause(
            filters,
            {
                'category': 'course_category',
                'programme': 'target_programme',
                'status': 'offering_status',
                'proposal_type': 'proposal_type',
            }
        )

        # Add search
        if search:
            search_cond = "(course_code ILIKE %s OR course_name ILIKE %s OR proposing_faculty_name ILIKE %s)"
            pattern = f'%{search}%'
            if where_clause:
                where_clause += f" AND {search_cond}"
            else:
                where_clause = f"WHERE {search_cond}"
            params.extend([pattern, pattern, pattern])

        # Total count
        cur.execute(f"SELECT COUNT(*) AS total FROM {COURSES_TABLE} {where_clause}", params)
        total = (cur.fetchone() or {}).get('total', 0)

        # Paginated data
        offset = (page - 1) * per_page
        cur.execute(
            f"""
            SELECT
                course_code,
                course_name,
                credit_l_t_p_c,
                course_category,
                proposing_faculty_name,
                faculty_affiliation,
                target_programme,
                target_discipline,
                prerequisite,
                date_of_proposal,
                proposal_type,
                offering_status
            FROM {COURSES_TABLE}
            {where_clause}
            ORDER BY course_code ASC
            LIMIT %s OFFSET %s
            """,
            params + [per_page, offset]
        )
        rows = cur.fetchall() or []
        courses = [dict(row) for row in rows]

        return jsonify({
            'data': courses,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': (total + per_page - 1) // per_page if total > 0 else 0
            }
        }), 200
    except UndefinedTable:
        return jsonify({'message': 'Academic module tables are missing.'}), 500
    except Exception as exc:
        print(f"Course list error: {exc}")
        return jsonify({'message': 'Failed to fetch course list.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ===================== Legacy endpoint stubs =====================

@academic_module_bp.route('/industry-course-trend', methods=['GET'])
@token_required
def get_industry_course_trend(current_user_id):
    """Legacy endpoint — industry_courses table has been removed."""
    return jsonify({'message': 'industry_courses table has been removed. Use /courses and /category-breakdown instead.'}), 404


@academic_module_bp.route('/industry-courses', methods=['GET'])
@token_required
def get_industry_courses(current_user_id):
    """Legacy endpoint — industry_courses table has been removed."""
    return jsonify({'message': 'industry_courses table has been removed. Use /courses instead.'}), 404


@academic_module_bp.route('/program-launch-stats', methods=['GET'])
@token_required
def get_program_launch_stats(current_user_id):
    """Legacy endpoint — academic_program_launch table has been removed."""
    return jsonify({'message': 'academic_program_launch table has been removed. Use /programme-breakdown instead.'}), 404


@academic_module_bp.route('/program-list', methods=['GET'])
@token_required
def get_program_list(current_user_id):
    """Legacy endpoint — academic_program_launch table has been removed."""
    return jsonify({'message': 'academic_program_launch table has been removed. Use /courses instead.'}), 404
