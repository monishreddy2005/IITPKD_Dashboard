#!/usr/bin/env python3
"""
Quick script to check what designation IDs exist in the database.
This helps fix foreign key constraint issues when uploading employee data.
"""
import os
import sys
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables.")
    sys.exit(1)

def check_designation_ids():
    """Check what designation IDs exist in the database."""
    conn = None
    try:
        print("=" * 70)
        print("CHECKING DESIGNATION IDs IN DATABASE")
        print("=" * 70)
        
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get all designation IDs
        cur.execute("SELECT designationid, designationname FROM designation ORDER BY designationid;")
        designations = cur.fetchall()
        
        if not designations:
            print("\n⚠️  No designations found in the database!")
            print("   You need to upload designation.csv first.")
            return []
        
        print(f"\n✓ Found {len(designations)} designations in database:")
        print("\nDesignation IDs:")
        ids = []
        for row in designations:
            ids.append(row['designationid'])
            print(f"   ID {row['designationid']}: {row['designationname']}")
        
        print(f"\nAvailable IDs: {ids}")
        print(f"ID Range: {min(ids)} to {max(ids)}")
        
        return ids
        
    except Exception as e:
        print(f"Error: {e}")
        return []
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    ids = check_designation_ids()
    if ids:
        print(f"\n✓ Use these IDs when generating employee data: {ids}")
    else:
        print("\n✗ No designation IDs found. Upload designation.csv first.")

