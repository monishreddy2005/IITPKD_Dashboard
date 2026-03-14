"""Database connection helper."""
import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')


def get_db_connection():
    """
    Opens a new PostgreSQL connection. Returns a RealDictCursor-backed connection,
    or None if the connection fails. Caller is responsible for closing it.
    """
    try:
        return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    except Exception as e:
        print(f"DB connection error: {e}")
        return None
