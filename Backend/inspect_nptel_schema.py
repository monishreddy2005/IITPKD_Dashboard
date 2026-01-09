from app.db import get_db_connection
import psycopg2.extras

def inspect_table(table_name):
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to DB")
        return

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = %s
            );
        """, (table_name,))
        exists = cur.fetchone()['exists']
        print(f"Table '{table_name}' exists: {exists}")
        
        if exists:
            # Get columns
            cur.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = %s
                ORDER BY ordinal_position;
            """, (table_name,))
            columns = cur.fetchall()
            print(f"Columns for {table_name}:")
            for col in columns:
                print(f"- {col['column_name']} ({col['data_type']}) Nullable: {col['is_nullable']} Default: {col['column_default']}")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    inspect_table('nptel_courses')
