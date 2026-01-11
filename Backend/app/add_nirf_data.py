import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '../.env'))

def get_db_connection():
    try:
        url = os.environ.get('DATABASE_URL')
        if not url:
            # Fallback for development if .env is in a different location or variable missing
            # Assuming typical local postgres url structure
            url = "postgresql://sumitgarad:password@localhost/iitpkd_dashboard"
        
        conn = psycopg2.connect(url)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def add_nirf_data():
    conn = get_db_connection()
    if not conn:
        return

    cur = conn.cursor()

    # Create table if it doesn't exist (in case schema.sql wasn't applied yet)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS nirf_ranking (
        ranking_id SERIAL PRIMARY KEY,
        year INT UNIQUE NOT NULL,
        tlr_score DECIMAL(5, 2),
        rpc_score DECIMAL(5, 2),
        go_score DECIMAL(5, 2),
        oi_score DECIMAL(5, 2),
        pr_score DECIMAL(5, 2)
    );
    """)

    # Dummy data for 2022-2025
    # Scores are approximate/dummy for visualization
    data = [
        (2022, 65.4, 45.2, 55.8, 60.1, 30.5),
        (2023, 68.1, 48.5, 59.2, 62.4, 35.8),
        (2024, 70.5, 52.3, 63.1, 65.7, 40.2),
        (2025, 72.8, 55.6, 66.4, 68.9, 45.1)
    ]

    try:
        for year, tlr, rpc, go, oi, pr in data:
            cur.execute("""
                INSERT INTO nirf_ranking (year, tlr_score, rpc_score, go_score, oi_score, pr_score)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (year) DO UPDATE 
                SET tlr_score = EXCLUDED.tlr_score,
                    rpc_score = EXCLUDED.rpc_score,
                    go_score = EXCLUDED.go_score,
                    oi_score = EXCLUDED.oi_score,
                    pr_score = EXCLUDED.pr_score;
            """, (year, tlr, rpc, go, oi, pr))
        
        conn.commit()
        print("NIRF data added successfully.")
    except Exception as e:
        print(f"Error inserting data: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    add_nirf_data()
