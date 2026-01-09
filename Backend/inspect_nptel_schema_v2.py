import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Load .env from current directory (Backend/)
load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

def inspect_table(table_name):
    print(f"Connecting to {DATABASE_URL}")
    try:
        conn = psycopg2.connect(
            DATABASE_URL,
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cur = conn.cursor()
        
        # Check if table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = %s
            );
        """, (table_name,))
        result = cur.fetchone()
        exists = result['exists']
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
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    inspect_table('nptel_courses')
