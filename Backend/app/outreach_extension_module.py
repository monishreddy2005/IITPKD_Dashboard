"""
Blueprint providing analytics for the Outreach and Extension module:
- Open House – Faculty Coordinator
- NPTEL – CCE
- UBA (Unnat Bharat Abhiyan) – Faculty Coordinator
"""
from collections import defaultdict
from typing import Any, Dict, List, Optional

from flask import Blueprint, jsonify, request
from psycopg2 import extras
from psycopg2.errors import UndefinedTable

from .auth import token_required
from .db import get_db_connection


outreach_extension_bp = Blueprint('outreach_extension', __name__)

OPEN_HOUSE_TABLE = 'open_house'
NPTEL_COURSES_TABLE = 'nptel_courses'
NPTEL_ENROLLMENTS_TABLE = 'nptel_enrollments'
NPTEL_CHAPTERS_TABLE = 'nptel_local_chapters'
UBA_PROJECTS_TABLE = 'uba_projects'
UBA_EVENTS_TABLE = 'uba_events'


def _table_exists(conn, table_name: str) -> bool:
    """Check if a table exists in the database."""
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND LOWER(table_name) = LOWER(%s)
            )
            """,
            (table_name,),
        )
        result = cur.fetchone()
        if isinstance(result, dict):
            return bool(result.get('exists', False))
        return bool(result[0] if result else False)
    except Exception:
        return False
    finally:
        cur.close()


def _data_available() -> bool:
    """Check if outreach extension tables exist."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        return (
            _table_exists(conn, OPEN_HOUSE_TABLE) and
            _table_exists(conn, NPTEL_COURSES_TABLE) and
            _table_exists(conn, NPTEL_ENROLLMENTS_TABLE) and
            _table_exists(conn, NPTEL_CHAPTERS_TABLE) and
            _table_exists(conn, UBA_PROJECTS_TABLE) and
            _table_exists(conn, UBA_EVENTS_TABLE)
        )
    finally:
        conn.close()


# ========== Open House Endpoints ==========

@outreach_extension_bp.route('/open-house/summary', methods=['GET'])
@token_required
def get_open_house_summary(current_user_id):
    """Get summary statistics for Open House events."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Total Open House Events
        cur.execute(f"SELECT COUNT(*) as total FROM {OPEN_HOUSE_TABLE};")
        total_events = cur.fetchone()['total'] or 0
        
        # Total Visitors
        cur.execute(f"SELECT COALESCE(SUM(total_visitors), 0) as total FROM {OPEN_HOUSE_TABLE};")
        total_visitors = cur.fetchone()['total'] or 0
        
        # Number of Participating Departments (count unique departments from all events)
        # We'll count the maximum number of unique departments across all events
        cur.execute(f"""
            SELECT COUNT(DISTINCT TRIM(unnest(string_to_array(departments_participated, ',')))) as total
            FROM {OPEN_HOUSE_TABLE}
            WHERE departments_participated IS NOT NULL AND departments_participated != '';
        """)
        result = cur.fetchone()
        departments_count = result['total'] or 0 if result else 0
        
        return jsonify({
            'total_events': total_events,
            'total_visitors': total_visitors,
            'departments_participated': departments_count
        }), 200
        
    except Exception as e:
        print(f"Open House summary error: {e}")
        return jsonify({'message': 'Failed to fetch Open House summary statistics.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@outreach_extension_bp.route('/open-house/list', methods=['GET'])
@token_required
def get_open_house_list(current_user_id):
    """Get paginated list of Open House events with search and filter."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str).strip()
        year_filter = request.args.get('year', type=int)
        
        # Build WHERE clause
        where_conditions = []
        params = []
        
        if search:
            where_conditions.append("(theme ILIKE %s OR target_audience ILIKE %s OR departments_participated ILIKE %s)")
            search_pattern = f'%{search}%'
            params.extend([search_pattern, search_pattern, search_pattern])
        
        if year_filter:
            where_conditions.append("event_year = %s")
            params.append(year_filter)
        
        where_clause = f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM {OPEN_HOUSE_TABLE} {where_clause};"
        cur.execute(count_query, params)
        total = cur.fetchone()['total'] or 0
        
        # Get paginated data
        offset = (page - 1) * per_page
        query = f"""
            SELECT 
                event_id,
                event_year,
                event_date,
                theme,
                target_audience,
                departments_participated,
                num_departments,
                total_visitors,
                key_highlights,
                photos_url,
                poster_url,
                brochure_url
            FROM {OPEN_HOUSE_TABLE}
            {where_clause}
            ORDER BY event_year DESC, event_date DESC
            LIMIT %s OFFSET %s;
        """
        params.extend([per_page, offset])
        cur.execute(query, params)
        events = cur.fetchall()
        
        return jsonify({
            'events': [dict(event) for event in events],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200
        
    except Exception as e:
        print(f"Open House list error: {e}")
        return jsonify({'message': 'Failed to fetch Open House events.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@outreach_extension_bp.route('/open-house/timeline', methods=['GET'])
@token_required
def get_open_house_timeline(current_user_id):
    """Get year-wise timeline data for Open House events."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        cur.execute(f"""
            SELECT 
                event_year,
                COUNT(*) as event_count,
                COALESCE(SUM(total_visitors), 0) as total_visitors,
                COALESCE(AVG(num_departments), 0) as avg_departments
            FROM {OPEN_HOUSE_TABLE}
            GROUP BY event_year
            ORDER BY event_year ASC;
        """)
        timeline = cur.fetchall()
        
        return jsonify({
            'timeline': [dict(row) for row in timeline]
        }), 200
        
    except Exception as e:
        print(f"Open House timeline error: {e}")
        return jsonify({'message': 'Failed to fetch Open House timeline.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ========== NPTEL Endpoints ==========

@outreach_extension_bp.route('/nptel/summary', methods=['GET'])
@token_required
def get_nptel_summary(current_user_id):
    """Get summary statistics for NPTEL."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Total Courses Offered
        cur.execute(f"SELECT COUNT(DISTINCT course_id) as total FROM {NPTEL_COURSES_TABLE};")
        total_courses = cur.fetchone()['total'] or 0
        
        # Total Enrollments
        cur.execute(f"SELECT COUNT(*) as total FROM {NPTEL_ENROLLMENTS_TABLE};")
        total_enrollments = cur.fetchone()['total'] or 0
        
        # Certifications Completed
        cur.execute(f"SELECT COUNT(*) as total FROM {NPTEL_ENROLLMENTS_TABLE} WHERE certification_earned = TRUE;")
        certifications = cur.fetchone()['total'] or 0
        
        # Number of Local Chapters
        cur.execute(f"SELECT COUNT(*) as total FROM {NPTEL_CHAPTERS_TABLE} WHERE is_active = TRUE;")
        local_chapters = cur.fetchone()['total'] or 0
        
        return jsonify({
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'certifications_completed': certifications,
            'local_chapters': local_chapters
        }), 200
        
    except Exception as e:
        print(f"NPTEL summary error: {e}")
        return jsonify({'message': 'Failed to fetch NPTEL summary statistics.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@outreach_extension_bp.route('/nptel/enrollments-over-time', methods=['GET'])
@token_required
def get_nptel_enrollments_over_time(current_user_id):
    """Get enrollments over time (year-wise)."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        cur.execute(f"""
            SELECT 
                enrollment_year,
                COUNT(*) as total_enrollments,
                COUNT(CASE WHEN certification_earned = TRUE THEN 1 END) as certifications
            FROM {NPTEL_ENROLLMENTS_TABLE}
            GROUP BY enrollment_year
            ORDER BY enrollment_year ASC;
        """)
        data = cur.fetchall()
        
        return jsonify({
            'enrollments_over_time': [dict(row) for row in data]
        }), 200
        
    except Exception as e:
        print(f"NPTEL enrollments over time error: {e}")
        return jsonify({'message': 'Failed to fetch NPTEL enrollments over time.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@outreach_extension_bp.route('/nptel/course-categories', methods=['GET'])
@token_required
def get_nptel_course_categories(current_user_id):
    """Get course category breakdown."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        cur.execute(f"""
            SELECT 
                COALESCE(course_category, 'Uncategorized') as category,
                COUNT(*) as count
            FROM {NPTEL_COURSES_TABLE}
            GROUP BY course_category
            ORDER BY count DESC;
        """)
        data = cur.fetchall()
        
        return jsonify({
            'categories': [dict(row) for row in data]
        }), 200
        
    except Exception as e:
        print(f"NPTEL course categories error: {e}")
        return jsonify({'message': 'Failed to fetch NPTEL course categories.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@outreach_extension_bp.route('/nptel/certification-ratio', methods=['GET'])
@token_required
def get_nptel_certification_ratio(current_user_id):
    """Get certification ratio (certified vs enrolled)."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        cur.execute(f"""
            SELECT 
                COUNT(*) as total_enrollments,
                COUNT(CASE WHEN certification_earned = TRUE THEN 1 END) as certified
            FROM {NPTEL_ENROLLMENTS_TABLE};
        """)
        result = cur.fetchone()
        
        total = result['total_enrollments'] or 0
        certified = result['certified'] or 0
        ratio = (certified / total * 100) if total > 0 else 0
        
        return jsonify({
            'total_enrollments': total,
            'certified': certified,
            'not_certified': total - certified,
            'certification_rate': round(ratio, 2)
        }), 200
        
    except Exception as e:
        print(f"NPTEL certification ratio error: {e}")
        return jsonify({'message': 'Failed to fetch NPTEL certification ratio.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ========== UBA Endpoints ==========

@outreach_extension_bp.route('/uba/summary', methods=['GET'])
@token_required
def get_uba_summary(current_user_id):
    """Get summary statistics for UBA."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Total Projects
        cur.execute(f"SELECT COUNT(*) as total FROM {UBA_PROJECTS_TABLE};")
        total_projects = cur.fetchone()['total'] or 0
        
        # Number of Events
        cur.execute(f"SELECT COUNT(*) as total FROM {UBA_EVENTS_TABLE};")
        total_events = cur.fetchone()['total'] or 0
        
        return jsonify({
            'total_projects': total_projects,
            'total_events': total_events
        }), 200
        
    except Exception as e:
        print(f"UBA summary error: {e}")
        return jsonify({'message': 'Failed to fetch UBA summary statistics.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@outreach_extension_bp.route('/uba/projects', methods=['GET'])
@token_required
def get_uba_projects(current_user_id):
    """Get list of UBA projects with events."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        cur.execute(f"""
            SELECT 
                p.project_id,
                p.project_title,
                p.coordinator_name,
                p.intervention_description,
                p.project_status,
                p.start_date,
                p.end_date,
                p.collaboration_partners,
                COUNT(e.event_id) as event_count
            FROM {UBA_PROJECTS_TABLE} p
            LEFT JOIN {UBA_EVENTS_TABLE} e ON p.project_id = e.project_id
            GROUP BY p.project_id
            ORDER BY p.start_date DESC NULLS LAST, p.project_id DESC;
        """)
        projects = cur.fetchall()
        
        return jsonify({
            'projects': [dict(project) for project in projects]
        }), 200
        
    except Exception as e:
        print(f"UBA projects error: {e}")
        return jsonify({'message': 'Failed to fetch UBA projects.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@outreach_extension_bp.route('/uba/events/<int:project_id>', methods=['GET'])
@token_required
def get_uba_project_events(current_user_id, project_id):
    """Get events for a specific UBA project."""
    if not _data_available():
        return jsonify({'message': 'Outreach extension tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        cur.execute(f"""
            SELECT 
                event_id,
                event_title,
                event_type,
                event_date,
                location,
                description,
                photos_url,
                brochure_url
            FROM {UBA_EVENTS_TABLE}
            WHERE project_id = %s
            ORDER BY event_date DESC;
        """, (project_id,))
        events = cur.fetchall()
        
        return jsonify({
            'events': [dict(event) for event in events]
        }), 200
        
    except Exception as e:
        print(f"UBA project events error: {e}")
        return jsonify({'message': 'Failed to fetch UBA project events.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

