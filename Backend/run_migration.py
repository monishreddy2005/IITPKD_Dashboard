#!/usr/bin/env python3

import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set in .env")
    sys.exit(1)

# ----------------------------
# PATH FIX (IMPORTANT)
# ----------------------------

# Backend/
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# Project root (one level up)
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

# Database_Schema/
SCHEMA_DIR = os.path.join(PROJECT_ROOT, "Database_Schema")
MIGRATIONS_DIR = os.path.join(SCHEMA_DIR, "migrations")

# Debug prints (keep these)
print("Backend Dir     :", BACKEND_DIR)
print("Project Root    :", PROJECT_ROOT)
print("Schema Dir      :", SCHEMA_DIR)
print("Migrations Dir  :", MIGRATIONS_DIR)

if not os.path.isdir(SCHEMA_DIR):
    print("❌ Database_Schema directory not found")
    sys.exit(1)

# ----------------------------
# STRICT EXECUTION ORDER
# ----------------------------

SQL_EXECUTION_ORDER = [
    os.path.join(SCHEMA_DIR, "schema.sql"),
    os.path.join(MIGRATIONS_DIR, "add_transgender_to_emp_gender.sql"),
    os.path.join(SCHEMA_DIR, "users.sql"),
    os.path.join(SCHEMA_DIR, "academic_section.sql"),
    os.path.join(SCHEMA_DIR, "industry_connect.sql"),
    os.path.join(SCHEMA_DIR, "innovation_entrepreneurship.sql"),
    os.path.join(SCHEMA_DIR, "outreach_extension.sql"),
    os.path.join(SCHEMA_DIR, "research.sql"),
    os.path.join(SCHEMA_DIR, "placement.sql"),
    os.path.join(SCHEMA_DIR, "ICC.sql"),
    os.path.join(SCHEMA_DIR, "IGRC.sql"),
    os.path.join(SCHEMA_DIR, "EWD.sql"),
]

def execute_sql_file(cursor, file_path):
    print(f"\n▶ Running: {file_path}")

    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"Missing SQL file: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        sql = f.read().strip()

    if not sql:
        print("⚠ Skipped (empty file)")
        return

    cursor.execute(sql)
    print("✓ Success")

def run_migrations():
    conn = None
    try:
        print("\n🔗 Connecting to PostgreSQL...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        cursor = conn.cursor()

        for sql_file in SQL_EXECUTION_ORDER:
            execute_sql_file(cursor, sql_file)

        conn.commit()
        print("\n✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY")

    except Exception as e:
        if conn:
            conn.rollback()
        print("\n❌ MIGRATION FAILED")
        print("Reason:", e)
        sys.exit(1)

    finally:
        if conn:
            conn.close()
            print("\n🔒 Database connection closed")

if __name__ == "__main__":
    print("=" * 60)
    print(" POSTGRESQL DATABASE MIGRATION ")
    print("=" * 60)
    run_migrations()
