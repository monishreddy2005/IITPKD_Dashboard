import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Load .env file to get the DATABASE_URL
load_dotenv() 

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    """
    Establishes a new connection to the PostgreSQL database.
    The caller is responsible for closing the connection.
    """
    try:
        conn = psycopg2.connect(
            DATABASE_URL,
            cursor_factory=psycopg2.extras.RealDictCursor  # Returns rows as dictionaries
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None
