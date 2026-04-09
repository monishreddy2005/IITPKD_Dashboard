import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.environ.get('DATABASE_URL')

conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
cur = conn.cursor()
cur.execute("SELECT DISTINCT engagement_type FROM faculty_engagement;")
rows = cur.fetchall()
for row in rows:
    print(row['engagement_type'])
cur.close()
conn.close()
