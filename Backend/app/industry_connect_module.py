"""
Blueprint providing analytics for the Industry Connect module:
- ICSR Section: Industry Interaction Events
- Industry-Academia Conclave Coordinator
"""
from collections import defaultdict
from typing import Any, Dict, List, Optional

from flask import Blueprint, jsonify, request
from psycopg2 import extras
from psycopg2.errors import UndefinedTable

from .auth import token_required
from .db import get_db_connection


industry_connect_bp = Blueprint('industry_connect', __name__)

INDUSTRY_EVENTS_TABLE = 'industry_events'
INDUSTRY_CONCLAVE_TABLE = 'industry_conclave'


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
    """Check if industry connect tables exist."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        return _table_exists(conn, INDUSTRY_EVENTS_TABLE) and _table_exists(conn, INDUSTRY_CONCLAVE_TABLE)
    finally:
        conn.close()


# ========== ICSR Section Endpoints ==========

@industry_connect_bp.route('/icsr/summary', methods=['GET'])
@token_required
def get_icsr_summary(current_user_id):
    """Get summary statistics for ICSR industry events."""
    if not _data_available():
        return jsonify({'message': 'Industry connect tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Total number of industry events
        cur.execute(f"SELECT COUNT(*) as total FROM {INDUSTRY_EVENTS_TABLE};")
        total_events = cur.fetchone()['total'] or 0
        
        # Number of departments involved
        cur.execute(f"""
            SELECT COUNT(DISTINCT department) as total 
            FROM {INDUSTRY_EVENTS_TABLE} 
            WHERE department IS NOT NULL AND department != '';
        """)
        departments_count = cur.fetchone()['total'] or 0
        
        return jsonify({
            'total_events': total_events,
            'departments_involved': departments_count
        }), 200
        
    except Exception as e:
        print(f"ICSR summary error: {e}")
        return jsonify({'message': 'Failed to fetch ICSR summary statistics.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@industry_connect_bp.route('/icsr/yearly-distribution', methods=['GET'])
@token_required
def get_icsr_yearly_distribution(current_user_id):
    """Get year-wise distribution of industry events."""
    if not _data_available():
        return jsonify({'message': 'Industry connect tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get year-wise event counts
        cur.execute(f"""
            SELECT 
                EXTRACT(YEAR FROM event_date)::INT as year,
                COUNT(*) as event_count,
                COUNT(DISTINCT department) as departments_count
            FROM {INDUSTRY_EVENTS_TABLE}
            GROUP BY EXTRACT(YEAR FROM event_date)
            ORDER BY year ASC;
        """)
        yearly_data = cur.fetchall()
        
        result = []
        for row in yearly_data:
            result.append({
                'year': row['year'],
                'event_count': row['event_count'] or 0,
                'departments_count': row['departments_count'] or 0
            })
        
        return jsonify({'data': result}), 200
        
    except Exception as e:
        print(f"ICSR yearly distribution error: {e}")
        return jsonify({'message': 'Failed to fetch yearly distribution.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@industry_connect_bp.route('/icsr/event-types', methods=['GET'])
@token_required
def get_icsr_event_types(current_user_id):
    """Get event types distribution (frequency by type)."""
    if not _data_available():
        return jsonify({'message': 'Industry connect tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get event type distribution
        cur.execute(f"""
            SELECT 
                event_type,
                COUNT(*) as count
            FROM {INDUSTRY_EVENTS_TABLE}
            GROUP BY event_type
            ORDER BY count DESC;
        """)
        type_data = cur.fetchall()
        
        result = []
        for row in type_data:
            result.append({
                'event_type': row['event_type'],
                'count': row['count'] or 0
            })
        
        return jsonify({'data': result}), 200
        
    except Exception as e:
        print(f"ICSR event types error: {e}")
        return jsonify({'message': 'Failed to fetch event types distribution.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@industry_connect_bp.route('/icsr/events', methods=['GET'])
@token_required
def get_icsr_events(current_user_id):
    """Get list of industry events with filtering and pagination."""
    if not _data_available():
        return jsonify({'message': 'Industry connect tables are missing.'}), 500

    filters = {
        'event_type': request.args.get('event_type'),
        'department': request.args.get('department'),
        'year': request.args.get('year'),
        'search': request.args.get('search', '').strip()
    }
    
    # Pagination
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=50, type=int)
    per_page = max(1, min(per_page, 100))
    offset = (page - 1) * per_page

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Build WHERE clause
        conditions = []
        params = []
        
        if filters['event_type'] and filters['event_type'] != 'All':
            conditions.append("event_type = %s")
            params.append(filters['event_type'])
        
        if filters['department'] and filters['department'] != 'All':
            conditions.append("department = %s")
            params.append(filters['department'])
        
        if filters['year']:
            conditions.append("EXTRACT(YEAR FROM event_date) = %s")
            params.append(int(filters['year']))
        
        if filters['search']:
            conditions.append(
                "(event_title ILIKE %s OR industry_partner ILIKE %s OR description ILIKE %s)"
            )
            search_pattern = f"%{filters['search']}%"
            params.extend([search_pattern, search_pattern, search_pattern])
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM {INDUSTRY_EVENTS_TABLE} {where_clause};"
        cur.execute(count_query, params)
        total = cur.fetchone()['total'] or 0
        
        # Get events
        query = f"""
            SELECT 
                event_id,
                event_title,
                event_type,
                industry_partner,
                event_date,
                duration_hours,
                department,
                description
            FROM {INDUSTRY_EVENTS_TABLE}
            {where_clause}
            ORDER BY event_date DESC, event_title ASC
            LIMIT %s OFFSET %s;
        """
        cur.execute(query, params + [per_page, offset])
        events = cur.fetchall()
        
        result = []
        for row in events:
            result.append({
                'event_id': row['event_id'],
                'event_title': row['event_title'],
                'event_type': row['event_type'],
                'industry_partner': row['industry_partner'],
                'event_date': row['event_date'].isoformat() if row['event_date'] else None,
                'duration_hours': float(row['duration_hours']) if row['duration_hours'] else None,
                'department': row['department'],
                'description': row['description']
            })
        
        return jsonify({
            'data': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': (total + per_page - 1) // per_page
            }
        }), 200
        
    except Exception as e:
        print(f"ICSR events list error: {e}")
        return jsonify({'message': 'Failed to fetch events list.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@industry_connect_bp.route('/icsr/filter-options', methods=['GET'])
@token_required
def get_icsr_filter_options(current_user_id):
    """Get filter options for ICSR events."""
    if not _data_available():
        return jsonify({'message': 'Industry connect tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get distinct event types
        cur.execute(f"SELECT DISTINCT event_type FROM {INDUSTRY_EVENTS_TABLE} ORDER BY event_type;")
        event_types = [row['event_type'] for row in cur.fetchall() if row['event_type']]
        
        # Get distinct departments
        cur.execute(f"""
            SELECT DISTINCT department 
            FROM {INDUSTRY_EVENTS_TABLE} 
            WHERE department IS NOT NULL AND department != ''
            ORDER BY department;
        """)
        departments = [row['department'] for row in cur.fetchall() if row['department']]
        
        # Get distinct years
        cur.execute(f"""
            SELECT DISTINCT EXTRACT(YEAR FROM event_date)::INT as year
            FROM {INDUSTRY_EVENTS_TABLE}
            ORDER BY year DESC;
        """)
        years = [row['year'] for row in cur.fetchall() if row['year']]
        
        return jsonify({
            'event_types': event_types,
            'departments': departments,
            'years': years
        }), 200
        
    except Exception as e:
        print(f"ICSR filter options error: {e}")
        return jsonify({'message': 'Failed to fetch filter options.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ========== Industry-Academia Conclave Endpoints ==========

@industry_connect_bp.route('/conclave/summary', methods=['GET'])
@token_required
def get_conclave_summary(current_user_id):
    """Get summary statistics for Industry-Academia Conclave."""
    if not _data_available():
        return jsonify({'message': 'Industry connect tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Total number of conclaves
        cur.execute(f"SELECT COUNT(*) as total FROM {INDUSTRY_CONCLAVE_TABLE};")
        total_conclaves = cur.fetchone()['total'] or 0
        
        # Total companies across all conclaves
        cur.execute(f"SELECT SUM(number_of_companies) as total FROM {INDUSTRY_CONCLAVE_TABLE};")
        total_companies = cur.fetchone()['total'] or 0
        
        return jsonify({
            'total_conclaves': total_conclaves,
            'total_companies': total_companies or 0
        }), 200
        
    except Exception as e:
        print(f"Conclave summary error: {e}")
        return jsonify({'message': 'Failed to fetch conclave summary.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@industry_connect_bp.route('/conclave/list', methods=['GET'])
@token_required
def get_conclave_list(current_user_id):
    """Get list of all Industry-Academia Conclaves."""
    if not _data_available():
        return jsonify({'message': 'Industry connect tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get all conclaves ordered by year (most recent first)
        cur.execute(f"""
            SELECT 
                conclave_id,
                year,
                theme,
                focus_area,
                number_of_companies,
                sessions_held,
                key_speakers,
                event_photos_url,
                brochure_url,
                description
            FROM {INDUSTRY_CONCLAVE_TABLE}
            ORDER BY year DESC;
        """)
        conclaves = cur.fetchall()
        
        result = []
        for row in conclaves:
            result.append({
                'conclave_id': row['conclave_id'],
                'year': row['year'],
                'theme': row['theme'],
                'focus_area': row['focus_area'],
                'number_of_companies': row['number_of_companies'] or 0,
                'sessions_held': row['sessions_held'],
                'key_speakers': row['key_speakers'],
                'event_photos_url': row['event_photos_url'],
                'brochure_url': row['brochure_url'],
                'description': row['description']
            })
        
        return jsonify({'data': result}), 200
        
    except Exception as e:
        print(f"Conclave list error: {e}")
        return jsonify({'message': 'Failed to fetch conclave list.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

