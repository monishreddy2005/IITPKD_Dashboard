from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Any, Dict, Iterable, List, Sequence, Tuple

from flask import Blueprint, jsonify, request
from psycopg2.errors import UndefinedTable

from .auth import token_required
from .db import get_db_connection

placement_bp = Blueprint('placement', __name__)

PLACEMENT_SUMMARY_TABLE = 'placement_summary'
PLACEMENT_COMPANY_TABLE = 'placement_companies'
PLACEMENT_PACKAGES_TABLE = 'placement_packages'

PROGRAM_CATEGORY_MAP = {
    'BTech': 'UG',
    'MTech': 'PG',
    'MSc': 'PG',
    'MS': 'PG',
    'PhD': 'PhD',
}


def map_program_to_category(program: str) -> str:
    return PROGRAM_CATEGORY_MAP.get(program, 'Other')


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
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f"Placement stats table check failed for {table_name}: {exc}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def placement_data_available() -> bool:
    return table_exists(PLACEMENT_SUMMARY_TABLE)


def build_where_clause(mapping: Dict[str, str], filters: Dict[str, Any]) -> Tuple[str, List[Any]]:
    conditions: List[str] = []
    params: List[Any] = []

    for key, column in mapping.items():
        value = filters.get(key)
        if value in (None, '', 'All'):
            continue
        if isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
            values = [item for item in value if item not in (None, '', 'All')]
            if values:
                placeholders = ', '.join(['%s'] * len(values))
                conditions.append(f"{column} IN ({placeholders})")
                params.extend(values)
        else:
            conditions.append(f"{column} = %s")
            params.append(value)

    clause = ''
    if conditions:
        clause = 'WHERE ' + ' AND '.join(conditions)
    return clause, params


def safe_percentage(numerator: float, denominator: float) -> float:
    if not denominator:
        return 0.0
    return round((numerator / denominator) * 100, 2)


@placement_bp.route('/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    if not placement_data_available():
        return jsonify({
            'message': (
                "Placement tables not found. Please apply the latest schema.sql so the placement dashboard can load data."
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
                ARRAY(SELECT DISTINCT placement_year FROM placement_summary ORDER BY placement_year DESC) AS years,
                ARRAY(SELECT DISTINCT program FROM placement_summary ORDER BY program) AS programs,
                ARRAY(SELECT DISTINCT gender FROM placement_summary ORDER BY gender) AS genders,
                ARRAY(
                    SELECT DISTINCT sector FROM placement_companies
                    WHERE sector IS NOT NULL AND sector <> ''
                    ORDER BY sector
                ) AS sectors
            """
        )
        row = cur.fetchone() or {}
        return jsonify({
            'years': row.get('years') or [],
            'programs': row.get('programs') or [],
            'genders': row.get('genders') or [],
            'sectors': row.get('sectors') or []
        }), 200
    except UndefinedTable:
        return jsonify({
            'message': (
                "Placement tables are missing. Please run the latest database migrations first."
            )
        }), 500
    except Exception as exc:
        print(f"Placement filter options error: {exc}")
        return jsonify({'message': 'Failed to fetch placement filter options.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/summary', methods=['GET'])
@token_required
def get_placement_summary(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'year': request.args.get('year'),
        'program': request.args.get('program'),
        'gender': request.args.get('gender'),
    }

    where_clause, params = build_where_clause(
        {'year': 'placement_year', 'program': 'program', 'gender': 'gender'},
        filters
    )

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT SUM(registered) AS registered, SUM(placed) AS placed
            FROM {PLACEMENT_SUMMARY_TABLE}
            {where_clause}
            """,
            params
        )
        row = cur.fetchone() or {'registered': 0, 'placed': 0}
        total_registered = row.get('registered') or 0
        total_placed = row.get('placed') or 0

        cur.execute(
            f"""
            SELECT
                MAX(highest_package) AS highest_package,
                MIN(lowest_package) AS lowest_package,
                AVG(average_package) AS average_package
            FROM {PLACEMENT_PACKAGES_TABLE}
            {where_clause}
            """,
            params
        )
        package_row = cur.fetchone() or {}
        summary = {
            'registered': int(total_registered),
            'placed': int(total_placed),
            'placement_percentage': safe_percentage(total_placed, total_registered),
            'highest_package': package_row.get('highest_package'),
            'lowest_package': package_row.get('lowest_package'),
            'average_package': package_row.get('average_package'),
        }
        return jsonify({'data': summary}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement summary error: {exc}")
        return jsonify({'message': 'Failed to fetch placement summary data.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/percentage-trend', methods=['GET'])
@token_required
def get_percentage_trend(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'program': request.args.get('program'),
        'gender': request.args.get('gender'),
    }
    where_clause, params = build_where_clause(
        {'program': 'program', 'gender': 'gender'},
        filters
    )

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT placement_year, SUM(registered) AS registered, SUM(placed) AS placed
            FROM {PLACEMENT_SUMMARY_TABLE}
            {where_clause}
            GROUP BY placement_year
            ORDER BY placement_year
            """,
            params
        )
        rows = cur.fetchall() or []
        data = []
        for row in rows:
            registered = row.get('registered') or 0
            placed = row.get('placed') or 0
            data.append({
                'year': row.get('placement_year'),
                'registered': int(registered),
                'placed': int(placed),
                'placement_percentage': safe_percentage(placed, registered)
            })
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement percentage trend error: {exc}")
        return jsonify({'message': 'Failed to fetch placement percentage trend.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/gender-breakdown', methods=['GET'])
@token_required
def get_gender_breakdown(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'year': request.args.get('year'),
        'program': request.args.get('program'),
    }
    where_clause, params = build_where_clause(
        {'year': 'placement_year', 'program': 'program'},
        filters
    )

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT gender, SUM(registered) AS registered, SUM(placed) AS placed
            FROM {PLACEMENT_SUMMARY_TABLE}
            {where_clause}
            GROUP BY gender
            ORDER BY gender
            """,
            params
        )
        rows = cur.fetchall() or []
        data = []
        for row in rows:
            registered = row.get('registered') or 0
            placed = row.get('placed') or 0
            data.append({
                'gender': row.get('gender'),
                'registered': int(registered),
                'placed': int(placed),
                'placement_percentage': safe_percentage(placed, registered)
            })
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement gender breakdown error: {exc}")
        return jsonify({'message': 'Failed to fetch gender breakdown.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/program-status', methods=['GET'])
@token_required
def get_program_status(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'year': request.args.get('year'),
        'gender': request.args.get('gender'),
    }
    where_clause, params = build_where_clause(
        {'year': 'placement_year', 'gender': 'gender'},
        filters
    )

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT program, SUM(registered) AS registered, SUM(placed) AS placed
            FROM {PLACEMENT_SUMMARY_TABLE}
            {where_clause}
            GROUP BY program
            ORDER BY program
            """,
            params
        )
        rows = cur.fetchall() or []
        aggregates: Dict[str, Dict[str, float]] = defaultdict(lambda: {'registered': 0, 'placed': 0})
        for row in rows:
            program = row.get('program')
            category = map_program_to_category(program)
            aggregates[category]['registered'] += row.get('registered') or 0
            aggregates[category]['placed'] += row.get('placed') or 0

        data = []
        for category, values in aggregates.items():
            registered = values['registered']
            placed = values['placed']
            data.append({
                'program_category': category,
                'registered': int(registered),
                'placed': int(placed),
                'placement_percentage': safe_percentage(placed, registered)
            })

        # Preserve deterministic order UG, PG, PhD, Other
        category_order = ['UG', 'PG', 'PhD', 'Other']
        data.sort(key=lambda item: category_order.index(item['program_category']) if item['program_category'] in category_order else len(category_order))
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement program status error: {exc}")
        return jsonify({'message': 'Failed to fetch program-wise placement status.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/recruiters', methods=['GET'])
@token_required
def get_recruiter_counts(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'year': request.args.get('year'),
        'sector': request.args.get('sector'),
    }
    where_clause, params = build_where_clause(
        {'year': 'placement_year', 'sector': 'sector'},
        filters
    )

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT placement_year, COUNT(DISTINCT company_name) AS company_count, SUM(offers) AS offers
            FROM {PLACEMENT_COMPANY_TABLE}
            {where_clause}
            GROUP BY placement_year
            ORDER BY placement_year
            """,
            params
        )
        rows = cur.fetchall() or []
        data = []
        for row in rows:
            data.append({
                'year': row.get('placement_year'),
                'companies': int(row.get('company_count') or 0),
                'offers': int(row.get('offers') or 0)
            })
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement recruiter count error: {exc}")
        return jsonify({'message': 'Failed to fetch recruiter statistics.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/sector-distribution', methods=['GET'])
@token_required
def get_sector_distribution(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'year': request.args.get('year'),
    }
    where_clause, params = build_where_clause(
        {'year': 'placement_year'},
        filters
    )

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT COALESCE(NULLIF(sector, ''), 'Unspecified') AS sector,
                   COUNT(DISTINCT company_name) AS company_count,
                   SUM(offers) AS offers
            FROM {PLACEMENT_COMPANY_TABLE}
            {where_clause}
            GROUP BY COALESCE(NULLIF(sector, ''), 'Unspecified')
            ORDER BY sector
            """,
            params
        )
        rows = cur.fetchall() or []
        data = []
        for row in rows:
            data.append({
                'sector': row.get('sector'),
                'companies': int(row.get('company_count') or 0),
                'offers': int(row.get('offers') or 0)
            })
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement sector distribution error: {exc}")
        return jsonify({'message': 'Failed to fetch sector distribution.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/package-trend', methods=['GET'])
@token_required
def get_package_trend(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'program': request.args.get('program'),
    }
    where_clause, params = build_where_clause(
        {'program': 'program'},
        filters
    )

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT placement_year,
                   MAX(highest_package) AS highest_package,
                   MIN(lowest_package) AS lowest_package,
                   AVG(average_package) AS average_package
            FROM {PLACEMENT_PACKAGES_TABLE}
            {where_clause}
            GROUP BY placement_year
            ORDER BY placement_year
            """,
            params
        )
        rows = cur.fetchall() or []
        data = []
        for row in rows:
            data.append({
                'year': row.get('placement_year'),
                'highest': row.get('highest_package'),
                'lowest': row.get('lowest_package'),
                'average': row.get('average_package'),
            })
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement package trend error: {exc}")
        return jsonify({'message': 'Failed to fetch placement package trend.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@placement_bp.route('/top-recruiters', methods=['GET'])
@token_required
def get_top_recruiters(current_user_id):
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'year': request.args.get('year'),
        'sector': request.args.get('sector'),
    }
    where_clause, params = build_where_clause(
        {'year': 'placement_year', 'sector': 'sector'},
        filters
    )

    limit = request.args.get('limit', default=5, type=int)
    limit = max(1, min(limit, 20))

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT placement_year, company_name, sector, offers, hires, is_top_recruiter
            FROM {PLACEMENT_COMPANY_TABLE}
            {where_clause}
            ORDER BY offers DESC, hires DESC, company_name ASC
            LIMIT %s
            """,
            params + [limit]
        )
        rows = cur.fetchall() or []
        data = []
        for row in rows:
            data.append({
                'year': row.get('placement_year'),
                'company_name': row.get('company_name'),
                'sector': row.get('sector'),
                'offers': int(row.get('offers') or 0),
                'hires': int(row.get('hires') or 0),
                'is_top_recruiter': bool(row.get('is_top_recruiter')),
            })
        return jsonify({'data': data}), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement top recruiters error: {exc}")
        return jsonify({'message': 'Failed to fetch top recruiters.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@placement_bp.route('/details/companies', methods=['GET'])
@token_required
def get_companies_details(current_user_id):
    """Get detailed list of companies with filters for detail page."""
    if not placement_data_available():
        return jsonify({'message': 'Placement tables are missing.'}), 500

    filters = {
        'year': request.args.get('year'),
        'sector': request.args.get('sector'),
        'is_top_recruiter': request.args.get('is_top_recruiter'),
    }
    
    where_clause, params = build_where_clause(
        {'year': 'placement_year', 'sector': 'sector'},
        filters
    )
    
    # Add is_top_recruiter filter if provided
    if filters.get('is_top_recruiter') is not None:
        is_top = filters['is_top_recruiter'].lower() == 'true'
        if where_clause:
            where_clause += f" AND is_top_recruiter = %s"
        else:
            where_clause = "WHERE is_top_recruiter = %s"
        params.append(is_top)

    # Pagination
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=50, type=int)
    per_page = max(1, min(per_page, 100))  # Limit to 100 per page
    offset = (page - 1) * per_page

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        cur = conn.cursor()
        
        # Get total count
        cur.execute(
            f"""
            SELECT COUNT(*) as total
            FROM {PLACEMENT_COMPANY_TABLE}
            {where_clause}
            """,
            params
        )
        total = cur.fetchone()['total']
        
        # Get companies
        cur.execute(
            f"""
            SELECT company_id, placement_year, company_name, sector, offers, hires, is_top_recruiter, created_at
            FROM {PLACEMENT_COMPANY_TABLE}
            {where_clause}
            ORDER BY offers DESC, hires DESC, company_name ASC
            LIMIT %s OFFSET %s
            """,
            params + [per_page, offset]
        )
        rows = cur.fetchall() or []
        
        data = []
        for row in rows:
            data.append({
                'company_id': row.get('company_id'),
                'year': row.get('placement_year'),
                'company_name': row.get('company_name'),
                'sector': row.get('sector'),
                'offers': int(row.get('offers') or 0),
                'hires': int(row.get('hires') or 0),
                'is_top_recruiter': bool(row.get('is_top_recruiter')),
                'created_at': row.get('created_at').isoformat() if row.get('created_at') else None,
            })
        
        return jsonify({
            'data': data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': (total + per_page - 1) // per_page
            }
        }), 200
    except UndefinedTable:
        return jsonify({'message': 'Placement tables are missing.'}), 500
    except Exception as exc:
        print(f"Placement companies details error: {exc}")
        return jsonify({'message': 'Failed to fetch company details.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
