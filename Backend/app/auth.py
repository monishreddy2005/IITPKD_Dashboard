import os
import psycopg2.errors
# DO NOT import bcrypt here (it's imported from __init__)
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, current_app

# --- Import extensions from the app factory ---
from .db import get_db_connection 
from . import bcrypt # <-- THE FIX: Import the shared bcrypt object

# --- Blueprint Setup ---
auth_bp = Blueprint('auth', __name__)
# (We no longer create a new Bcrypt object here)

# --- Token Helper Functions ---

def encode_auth_token(user_id, role_id):
    """Generates the Auth Token."""
    try:
        payload = {
            # 'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=1),
            # 'iat': datetime.datetime.now(datetime.UTC),
            'exp': int((datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=1)).timestamp()),
            'iat': int(datetime.datetime.now(datetime.UTC).timestamp()),
            'sub': user_id,
            'role': role_id
        }
        secret_key = current_app.config.get('SECRET_KEY')
        # DEBUG: Let's see the key being used
        print(f"--- ENCODING with key: {secret_key[:5]}...{secret_key[-5:]}") 
        return jwt.encode(
            payload,
            secret_key,
            algorithm='HS256'
        )
    except Exception as e:
        print(f"Error encoding token: {e}")
        return e


def decode_auth_token(auth_token):
    """Decodes the auth token."""
    try:
        secret_key = current_app.config.get('SECRET_KEY')
        # DEBUG: Let's see the key being used
        print(f"--- DECODING with key: {secret_key[:5]}...{secret_key[-5:]}") 
        payload = jwt.decode(auth_token, secret_key, algorithms=['HS256'])
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
    
    # Use the correctly imported bcrypt object
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
        
        return jsonify({
            'message': 'User created successfully!',
            'token': auth_token,
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

        # Use the correctly imported bcrypt object
        if bcrypt.check_password_hash(user['password_hash'], password):
            cur.execute(
                "UPDATE users SET last_login_at = NOW(), failed_login_attempts = 0 WHERE id = %s;", 
                (user['id'],)
            )
            conn.commit()

            auth_token = encode_auth_token(user['id'], user['role_id'])
            del user['password_hash'] 
            
            return jsonify({
                'message': 'Login successful!',
                'token': auth_token,
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

