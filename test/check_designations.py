#!/usr/bin/env python3
"""
Quick script to check what designation IDs exist in the database.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from Backend.app.db import get_db_connection
import psycopg2.extras

def check_designations():
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT designationid, designationname, isactive FROM designation ORDER BY designationid")
    designations = cur.fetchall()
    conn.close()
    
    if designations:
        print("\nAvailable Designations in Database:")
        print("=" * 70)
        print(f"{'ID':<6} {'Name':<40} {'Active':<10}")
        print("-" * 70)
        for d in designations:
            print(f"{d['designationid']:<6} {d['designationname']:<40} {d['isactive']}")
        print(f"\nTotal: {len(designations)} designations")
        print("\n✅ Use these IDs in your employee CSV file")
    else:
        print("❌ No designations found in database!")
        print("Please upload designation.csv first")

if __name__ == '__main__':
    check_designations()

