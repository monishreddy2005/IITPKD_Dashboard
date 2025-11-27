#!/usr/bin/env python3
"""
Migration script to add 'Transgender' to emp_gender enum.
This script uses the same database connection as the Flask app.
"""
import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load .env file
load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables.")
    print("Please ensure your .env file contains DATABASE_URL.")
    sys.exit(1)

def run_migration():
    """Run the migration to add 'Transgender' to emp_gender enum."""
    conn = None
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("Checking if 'Transgender' already exists in emp_gender enum...")
        # Check if 'Transgender' already exists
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 
                FROM pg_enum 
                WHERE enumlabel = 'Transgender' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'emp_gender')
            ) AS exists;
        """)
        result = cur.fetchone()
        already_exists = result[0] if result else False
        
        if already_exists:
            print("✓ 'Transgender' already exists in emp_gender enum. No migration needed.")
            return True
        
        print("Adding 'Transgender' to emp_gender enum...")
        # Add 'Transgender' to the enum
        cur.execute("ALTER TYPE emp_gender ADD VALUE 'Transgender';")
        conn.commit()
        
        print("✓ Successfully added 'Transgender' to emp_gender enum!")
        return True
        
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        print(f"✗ Database error: {e}")
        return False
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"✗ Unexpected error: {e}")
        return False
    finally:
        if conn:
            cur.close()
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    print("=" * 60)
    print("Migration: Add 'Transgender' to emp_gender enum")
    print("=" * 60)
    success = run_migration()
    if success:
        print("\n✓ Migration completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Migration failed. Please check the error messages above.")
        sys.exit(1)

