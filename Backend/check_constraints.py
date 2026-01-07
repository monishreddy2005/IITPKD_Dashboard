import psycopg2
from app.db import get_db_connection

def check_constraints():
    conn = get_db_connection()
    if not conn:
        print("Failed")
        return

    cur = conn.cursor()
    cur.execute("""
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'research_patents';
    """)
    rows = cur.fetchall()
    print(rows)
    conn.close()

if __name__ == "__main__":
    check_constraints()
