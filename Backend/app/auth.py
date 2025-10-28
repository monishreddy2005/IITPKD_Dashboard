import os
import psycopg2.errors
import jwt
import datetime
from datetime import timezone  # <-- IMPORT timezone
from functools import wraps
from flask import Blueprint, request, jsonify, current_app

# --- Import extensions from the app factory ---
from .db import get_db_connection 
from . import bcrypt 

# --- Blueprint Setup ---
auth_bp = Blueprint('auth', __name__)

# --- Token Helper Functions ---

def encode_auth_token(user_id, role_id):
    """
    Generates the Auth Token.
    Returns a token string on success, or None on failure.
    """
    try:
        payload = {
            # USE timezone.utc (not datetime.UTC)
            'exp': int((datetime.datetime.now(timezone.utc) + datetime.timedelta(days=1)).timestamp()),
            'iat': int(datetime.datetime.now(timezone.utc).timestamp()),
            'sub': user_id,
            'role': role_id
        }
        secret_key = current_app.config.get('SECRET_KEY')
        
        # Add check for missing secret key
        if not secret_key:
            print("--- CRITICAL ERROR: JWT_SECRET_KEY is not set! ---")
            return None 

        print(f"--- ENCODING with key: {secret_key[:5]}...{secret_key[-5:]}") 
        
        # PyJWT returns a string, not bytes (in this version)
        token = jwt.encode(
            payload,
            secret_key,
            algorithm='HS256'
        )
        return token
        
    except Exception as e:
        print(f"Error encoding token: {e}")
        return None # <-- Return None on any error


def decode_auth_token(auth_token):
    """Decodes the auth token."""
    try:
        secret_key = current_app.config.get('SECRET_KEY')
        print(f"--- DECODING with key: {secret_key[:5]}...{secret_key[-5:]}") 
        payload = jwt.decode(auth_token, secret_key, algorithms=['HS256'],leeway=10)
        return payload['sub'] # Return the user ID
    except jwt.ExpiredSignatureError:
        return 'Token expired. Please log in again.'
    except jwt.InvalidTokenError:
        return 'Invalid token. Please log in again.'

# --- Auth Decorator ---
def token_required(f):
    """A decorator to protect routes that require authentication."""
    @wraps(f) 
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            print("--- DEBUG: Received Auth Header ---", auth_header)
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
            else:
                return jsonify({'message': 'Invalid Authorization header format!'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        user_id = decode_auth_token(token)
        if isinstance(user_id, str): # If it's an error message
            return jsonify({'message': user_id}), 401
        
        kwargs['current_user_id'] = user_id
        return f(*args, **kwargs)

    return decorated

# --- Routes ---

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User Signup Route."""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required!'}), 400

    email = data.get('email')
    password = data.get('password')
    display_name = data.get('display_name', None) 
    username = data.get('username', None) 
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = None
    try:
        conn = get_db_connection() 
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO users (email, password_hash, display_name, username)
            VALUES (%s, %s, %s, %s)
            RETURNING id, email, display_name, created_at, role_id;
            """,
            (email, hashed_password, display_name, username)
        )
        new_user = cur.fetchone()
        conn.commit()
        
        auth_token = encode_auth_token(new_user['id'], new_user['role_id'])
        
        # --- ROBUSTNESS CHECK ---
        if not auth_token:
            return jsonify({'message': 'Error generating authentication token.'}), 500
        
        return jsonify({
            'message': 'User created successfully!',
            'token': auth_token, # This is now guaranteed to be a valid token or an error
            'user': new_user
        }), 201

    except psycopg2.errors.UniqueViolation as e:
        conn.rollback()
        if 'users_email_key' in str(e):
            return jsonify({'message': 'This email is already registered.'}), 409
        if 'users_username_key' in str(e):
            return jsonify({'message': 'This username is already taken.'}), 409
        return jsonify({'message': 'A unique constraint was violated.'}), 409
    
    except Exception as e:
        if conn: conn.rollback()
        print(f"Signup error: {e}") 
        return jsonify({'message': 'An error occurred during signup.'}), 500
    
    finally:
        if conn:
            cur.close()
            conn.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    """User Login Route."""
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required!'}), 400

    email = data.get('email')
    password = data.get('password')
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
            
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = %s;", (email,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'message': 'Email not found.'}), 404

        if bcrypt.check_password_hash(user['password_hash'], password):
            cur.execute(
                "UPDATE users SET last_login_at = NOW(), failed_login_attempts = 0 WHERE id = %s;", 
                (user['id'],)
            )
            conn.commit()

            auth_token = encode_auth_token(user['id'], user['role_id'])

            # --- ROBUSTNESS CHECK ---
            if not auth_token:
                return jsonify({'message': 'Error generating authentication token.'}), 500

            del user['password_hash'] 
            
            return jsonify({
                'message': 'Login successful!',
                'token': auth_token, # This is now guaranteed to be a valid token or an error
                'user': user
            }), 200
        else:
            cur.execute(
                "UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = %s;",
                (user['id'],)
            )
            conn.commit()
            return jsonify({'message': 'Incorrect password.'}), 401

    except Exception as e:
        if conn: conn.rollback()
        print(f"Login error: {e}")
        return jsonify({'message': 'An error occurred during login.'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()