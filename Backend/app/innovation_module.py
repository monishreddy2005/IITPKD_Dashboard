"""
Blueprint providing analytics for the Innovation and Entrepreneurship module:
- TECHIN (Technology Innovation Foundation of IIT Palakkad)
- IPTIF (IIT Palakkad Technology IHub Foundation)
- Incubatees, Startups, and Innovation Projects
"""
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

from flask import Blueprint, jsonify, request
from psycopg2 import extras

from .auth import token_required
from .db import get_db_connection


innovation_bp = Blueprint('innovation', __name__)

STARTUPS_TABLE = 'startups'
INNOVATION_PROJECTS_TABLE = 'innovation_projects'


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
    """Check if innovation tables exist."""
    conn = get_db_connection()
    if not conn:
        return False
    try:
        return _table_exists(conn, STARTUPS_TABLE) and _table_exists(conn, INNOVATION_PROJECTS_TABLE)
    finally:
        conn.close()


def build_where_clause(filter_mapping: Dict[str, str], filters: Dict[str, Any]) -> Tuple[str, List]:
    """Build WHERE clause from filters."""
    conditions = []
    params = []
    
    for filter_key, db_column in filter_mapping.items():
        value = filters.get(filter_key)
        if value is not None and value != '' and value != 'All':
            conditions.append(f"{db_column} = %s")
            params.append(value)
    
    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
    return where_clause, params


@innovation_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    """Get summary statistics for innovation and entrepreneurship."""
    if not _data_available():
        return jsonify({'message': 'Innovation tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Total incubatees (all startups)
        cur.execute(f"SELECT COUNT(*) as total FROM {STARTUPS_TABLE};")
        total_incubatees = cur.fetchone()['total'] or 0
        
        # Total startups (same as incubatees, but for clarity)
        total_startups = total_incubatees
        
        # Total innovation projects
        cur.execute(f"SELECT COUNT(*) as total FROM {INNOVATION_PROJECTS_TABLE};")
        total_innovation_projects = cur.fetchone()['total'] or 0
        
        # Startups from IIT Palakkad
        cur.execute(
            f"SELECT COUNT(*) as total FROM {STARTUPS_TABLE} WHERE is_from_iitpkd = TRUE;"
        )
        startups_from_iitpkd = cur.fetchone()['total'] or 0
        
        return jsonify({
            'total_incubatees': total_incubatees,
            'total_startups': total_startups,
            'total_innovation_projects': total_innovation_projects,
            'startups_from_iitpkd': startups_from_iitpkd
        }), 200
        
    except Exception as e:
        print(f"Innovation summary error: {e}")
        return jsonify({'message': 'Failed to fetch summary statistics.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@innovation_bp.route('/yearly-growth', methods=['GET'])
@token_required
def get_yearly_growth(current_user_id):
    """Get year-wise growth of incubatees and startups."""
    if not _data_available():
        return jsonify({'message': 'Innovation tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get year-wise counts for startups/incubatees
        cur.execute(f"""
            SELECT 
                year_of_incubation as year,
                COUNT(*) as incubatees,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_startups,
                COUNT(CASE WHEN is_from_iitpkd = TRUE THEN 1 END) as iitpkd_startups
            FROM {STARTUPS_TABLE}
            GROUP BY year_of_incubation
            ORDER BY year_of_incubation ASC;
        """)
        startup_data = cur.fetchall()
        
        # Get year-wise counts for innovation projects
        cur.execute(f"""
            SELECT 
                year_started as year,
                COUNT(*) as projects
            FROM {INNOVATION_PROJECTS_TABLE}
            GROUP BY year_started
            ORDER BY year_started ASC;
        """)
        project_data = cur.fetchall()
        
        # Combine data by year
        year_data = {}
        for row in startup_data:
            year = row['year']
            year_data[year] = {
                'year': year,
                'incubatees': row['incubatees'] or 0,
                'startups': row['incubatees'] or 0,  # Same as incubatees
                'active_startups': row['active_startups'] or 0,
                'iitpkd_startups': row['iitpkd_startups'] or 0,
                'innovation_projects': 0
            }
        
        for row in project_data:
            year = row['year']
            if year in year_data:
                year_data[year]['innovation_projects'] = row['projects'] or 0
            else:
                year_data[year] = {
                    'year': year,
                    'incubatees': 0,
                    'startups': 0,
                    'active_startups': 0,
                    'iitpkd_startups': 0,
                    'innovation_projects': row['projects'] or 0
                }
        
        # Convert to list and sort
        result = sorted(year_data.values(), key=lambda x: x['year'])
        
        return jsonify({'data': result}), 200
        
    except Exception as e:
        print(f"Innovation yearly growth error: {e}")
        return jsonify({'message': 'Failed to fetch yearly growth data.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@innovation_bp.route('/sector-distribution', methods=['GET'])
@token_required
def get_sector_distribution(current_user_id):
    """Get sector-wise innovation distribution."""
    if not _data_available():
        return jsonify({'message': 'Innovation tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get sector distribution from startups
        cur.execute(f"""
            SELECT 
                COALESCE(sector, 'Unspecified') as sector,
                COUNT(*) as startups,
                COUNT(CASE WHEN is_from_iitpkd = TRUE THEN 1 END) as iitpkd_startups
            FROM {STARTUPS_TABLE}
            GROUP BY sector
            ORDER BY startups DESC;
        """)
        startup_sectors = cur.fetchall()
        
        # Get sector distribution from innovation projects
        cur.execute(f"""
            SELECT 
                COALESCE(sector, 'Unspecified') as sector,
                COUNT(*) as projects
            FROM {INNOVATION_PROJECTS_TABLE}
            GROUP BY sector
            ORDER BY projects DESC;
        """)
        project_sectors = cur.fetchall()
        
        # Combine sectors
        sector_data = {}
        for row in startup_sectors:
            sector = row['sector']
            sector_data[sector] = {
                'sector': sector,
                'startups': row['startups'] or 0,
                'iitpkd_startups': row['iitpkd_startups'] or 0,
                'projects': 0
            }
        
        for row in project_sectors:
            sector = row['sector']
            if sector in sector_data:
                sector_data[sector]['projects'] = row['projects'] or 0
            else:
                sector_data[sector] = {
                    'sector': sector,
                    'startups': 0,
                    'iitpkd_startups': 0,
                    'projects': row['projects'] or 0
                }
        
        result = list(sector_data.values())
        
        return jsonify({'data': result}), 200
        
    except Exception as e:
        print(f"Innovation sector distribution error: {e}")
        return jsonify({'message': 'Failed to fetch sector distribution.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@innovation_bp.route('/startups', methods=['GET'])
@token_required
def get_startups(current_user_id):
    """Get list of startups with search and filter capabilities."""
    if not _data_available():
        return jsonify({'message': 'Innovation tables are missing.'}), 500

    filters = {
        'status': request.args.get('status'),
        'sector': request.args.get('sector'),
        'year': request.args.get('year'),
        'iitpkd_only': request.args.get('iitpkd_only', 'false').lower() == 'true',
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
        
        if filters['status'] and filters['status'] != 'All':
            conditions.append("status = %s")
            params.append(filters['status'])
        
        if filters['sector'] and filters['sector'] != 'All':
            conditions.append("sector = %s")
            params.append(filters['sector'])
        
        if filters['year']:
            conditions.append("year_of_incubation = %s")
            params.append(int(filters['year']))
        
        if filters['iitpkd_only']:
            conditions.append("is_from_iitpkd = TRUE")
        
        if filters['search']:
            conditions.append(
                "(startup_name ILIKE %s OR founder_name ILIKE %s OR innovation_focus_area ILIKE %s)"
            )
            search_pattern = f"%{filters['search']}%"
            params.extend([search_pattern, search_pattern, search_pattern])
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM {STARTUPS_TABLE} {where_clause};"
        cur.execute(count_query, params)
        total = cur.fetchone()['total'] or 0
        
        # Get startups
        query = f"""
            SELECT 
                startup_id,
                startup_name,
                founder_name,
                innovation_focus_area,
                year_of_incubation,
                status,
                sector,
                is_from_iitpkd
            FROM {STARTUPS_TABLE}
            {where_clause}
            ORDER BY year_of_incubation DESC, startup_name ASC
            LIMIT %s OFFSET %s;
        """
        cur.execute(query, params + [per_page, offset])
        startups = cur.fetchall()
        
        result = []
        for row in startups:
            result.append({
                'startup_id': row['startup_id'],
                'startup_name': row['startup_name'],
                'founder_name': row['founder_name'],
                'innovation_focus_area': row['innovation_focus_area'],
                'year_of_incubation': row['year_of_incubation'],
                'status': row['status'],
                'sector': row['sector'],
                'is_from_iitpkd': bool(row['is_from_iitpkd'])
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
        print(f"Innovation startups list error: {e}")
        return jsonify({'message': 'Failed to fetch startups list.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@innovation_bp.route('/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    """Get filter options for startups and projects."""
    if not _data_available():
        return jsonify({'message': 'Innovation tables are missing.'}), 500

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor(cursor_factory=extras.RealDictCursor)
        
        # Get distinct statuses
        cur.execute(f"SELECT DISTINCT status FROM {STARTUPS_TABLE} ORDER BY status;")
        statuses = [row['status'] for row in cur.fetchall() if row['status']]
        
        # Get distinct sectors
        cur.execute(f"""
            SELECT DISTINCT sector 
            FROM {STARTUPS_TABLE} 
            WHERE sector IS NOT NULL AND sector != ''
            ORDER BY sector;
        """)
        sectors = [row['sector'] for row in cur.fetchall() if row['sector']]
        
        # Get distinct years
        cur.execute(f"""
            SELECT DISTINCT year_of_incubation as year
            FROM {STARTUPS_TABLE}
            ORDER BY year DESC;
        """)
        years = [row['year'] for row in cur.fetchall() if row['year']]
        
        return jsonify({
            'statuses': statuses,
            'sectors': sectors,
            'years': years
        }), 200
        
    except Exception as e:
        print(f"Innovation filter options error: {e}")
        return jsonify({'message': 'Failed to fetch filter options.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

