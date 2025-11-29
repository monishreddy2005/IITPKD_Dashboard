#!/usr/bin/env python3
"""
Regenerate employee.csv using only designation IDs that exist in the database.
This fixes foreign key constraint violations.
"""
import os
import sys
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from pathlib import Path

# Add the test/generators directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent / 'test' / 'generators'))

from generate_employee import generate_employees
from _shared import DEFAULT_EMPLOYEE_DEPARTMENTS

load_dotenv()
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables.")
    sys.exit(1)

def get_designation_ids_from_db():
    """Get all designation IDs from the database."""
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("SELECT designationid FROM designation ORDER BY designationid;")
        rows = cur.fetchall()
        ids = [row['designationid'] for row in rows]
        
        return ids
    except Exception as e:
        print(f"Error fetching designation IDs: {e}")
        return []
    finally:
        if conn:
            cur.close()
            conn.close()

def main():
    print("=" * 70)
    print("REGENERATING EMPLOYEE.CSV WITH DATABASE DESIGNATION IDs")
    print("=" * 70)
    
    # Get designation IDs from database
    print("\n1. Fetching designation IDs from database...")
    designation_ids = get_designation_ids_from_db()
    
    if not designation_ids:
        print("✗ No designation IDs found in database!")
        print("  Please upload designation.csv first.")
        sys.exit(1)
    
    print(f"✓ Found {len(designation_ids)} designation IDs: {designation_ids[:10]}...")
    
    # Generate employee CSV
    print("\n2. Generating employee.csv...")
    output_path = Path(__file__).parent.parent / 'employee.csv'
    
    with output_path.open('w', encoding='utf-8') as outfile:
        generate_employees(
            outfile,
            count=100,
            designation_ids=designation_ids,
            departments=DEFAULT_EMPLOYEE_DEPARTMENTS,
        )
    
    print(f"✓ Generated employee.csv: {output_path.resolve()}")
    print(f"  Using {len(designation_ids)} valid designation IDs from database")
    print("\n✓ You can now upload employee.csv without foreign key errors!")

if __name__ == "__main__":
    main()

