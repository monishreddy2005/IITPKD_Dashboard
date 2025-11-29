"""
Generate dummy data for the Employee table.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import List, Optional

try:
    import psycopg2
    import psycopg2.extras
    from dotenv import load_dotenv
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False

from _shared import DEFAULT_EMPLOYEE_DEPARTMENTS, generate_employees
from utils import (
    ensure_parent_dir,
    load_column_from_csv,
    parse_comma_separated,
    parse_comma_separated_ints,
    save_and_report,
)

DEFAULT_DESIGNATION_COLUMN = "designationId"


def get_designation_ids_from_db() -> Optional[List[int]]:
    """Get all designation IDs from the database."""
    if not DB_AVAILABLE:
        return None
    
    # Load environment variables - try multiple locations
    # Try current directory, then Backend, then root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    backend_dir = project_root / 'Backend'
    
    env_loaded = False
    for env_path in [
        script_dir / '.env',
        backend_dir / '.env',
        project_root / '.env',
    ]:
        if env_path.exists():
            load_dotenv(env_path)
            env_loaded = True
            break
    
    # If no .env found, try default load_dotenv() which searches upward
    if not env_loaded:
        load_dotenv()
    
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        return None
    
    conn = None
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("SELECT designationid FROM designation ORDER BY designationid;")
        rows = cur.fetchall()
        ids = [row['designationid'] for row in rows]
        
        return ids if ids else None
    except Exception as e:
        print(f"Warning: Could not fetch designation IDs from database: {e}", file=sys.stderr)
        return None
    finally:
        if conn:
            cur.close()
            conn.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Employee data.")
    parser.add_argument(
        "--count",
        type=int,
        default=50,
        help="Number of employee records to generate (default: 50).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("employee.csv"),
        help="Output CSV path (default: employee.csv).",
    )
    parser.add_argument(
        "--designation-csv",
        type=Path,
        help="Optional path to designation CSV to source designation IDs.",
    )
    parser.add_argument(
        "--designation-column",
        type=str,
        default=DEFAULT_DESIGNATION_COLUMN,
        help=f"Column name in designation CSV containing IDs (default: {DEFAULT_DESIGNATION_COLUMN}).",
    )
    parser.add_argument(
        "--designation-ids",
        type=str,
        help="Comma separated designation IDs to sample from when no CSV is provided.",
    )
    parser.add_argument(
        "--departments",
        type=str,
        default=",".join(DEFAULT_EMPLOYEE_DEPARTMENTS),
        help="Comma separated list of department names to sample from.",
    )
    parser.add_argument(
        "--use-db",
        action="store_true",
        help="Fetch designation IDs from database (default: auto-detect if no other source provided).",
    )
    parser.add_argument(
        "--no-db-fallback",
        action="store_true",
        help="Disable automatic database fallback for designation IDs.",
    )
    return parser


def resolve_designation_ids(args) -> List[int]:
    """Resolve designation IDs from various sources with database as fallback."""
    # Priority 1: Use designation CSV if provided
    if args.designation_csv:
        values = load_column_from_csv(Path(args.designation_csv), args.designation_column)
        ids = [int(value) for value in values if value]
        if ids:
            return ids
    
    # Priority 2: Use explicit designation IDs if provided
    if args.designation_ids:
        ids = parse_comma_separated_ints(args.designation_ids)
        if ids:
            return ids
    
    # Priority 3: Try database if enabled or auto-detect (unless disabled)
    if args.use_db or (not args.no_db_fallback and DB_AVAILABLE):
        db_ids = get_designation_ids_from_db()
        if db_ids:
            print(f"✓ Using {len(db_ids)} designation IDs from database", file=sys.stderr)
            return db_ids
    
    # Priority 4: Fallback to simple sequential IDs (may cause foreign key errors)
    print(
        "Warning: Using sequential designation IDs (1 to count). "
        "This may cause foreign key constraint errors if these IDs don't exist in the database.",
        file=sys.stderr
    )
    return list(range(1, args.count + 1))


def main():
    parser = build_parser()
    args = parser.parse_args()

    designation_ids = resolve_designation_ids(args)
    if not designation_ids:
        raise SystemExit(
            "No designation IDs available. "
            "Provide --designation-ids, --designation-csv, or ensure database connection is available."
        )

    departments = parse_comma_separated(args.departments) or DEFAULT_EMPLOYEE_DEPARTMENTS

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_employees(
            outfile,
            args.count,
            designation_ids=designation_ids,
            departments=departments,
        )

    save_and_report(output_path, "✓ Generated Employee data")


if __name__ == "__main__":
    main()

