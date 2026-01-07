import psycopg2
from app.db import get_db_connection

def check_schema():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to DB")
        return

    cur = conn.cursor()
    
    print("Checking research_patents columns:")
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'research_patents'
        ORDER BY ordinal_position;
    """)
    rows = cur.fetchall()
    for row in rows:
        print(row)

    print("\nChecking patent_status_type enum:")
    cur.execute("""
        SELECT e.enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'patent_status_type';
    """)
    enums = cur.fetchall()
    print(enums)

    conn.close()

if __name__ == "__main__":
    check_schema()
