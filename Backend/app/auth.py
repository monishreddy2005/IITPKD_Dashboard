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
            # PyJWT requires 'sub' to be a string, so convert user_id to string
            'sub': str(user_id),
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
    """Decodes the auth token. Returns tuple (user_id, role_id) or error message string."""
    try:
        secret_key = current_app.config.get('SECRET_KEY')
        if not secret_key:
            print("--- CRITICAL ERROR: SECRET_KEY is missing from app config! ---")
            return 'Server configuration error. Please contact administrator.'
        
        print(f"--- DECODING token with key: {secret_key[:5]}...{secret_key[-5:] if len(secret_key) > 10 else 'short'} ---")
        print(f"--- Token preview: {auth_token[:30]}...{auth_token[-30:] if len(auth_token) > 60 else auth_token} ---")
        
        payload = jwt.decode(auth_token, secret_key, algorithms=['HS256'], leeway=10)
        # Convert user_id back to integer since we store it as string in the token
        user_id = int(payload['sub'])
        role_id = payload.get('role', 1)  # Default to role_id 1 if not present
        print(f"--- SUCCESS: Token decoded. User ID: {user_id}, Role: {role_id} ---")
        return (user_id, role_id)  # Return tuple of (user_id, role_id)
    except jwt.ExpiredSignatureError as e:
        print(f"--- ERROR: Token has expired - {str(e)} ---")
        return 'Token expired. Please log in again.'
    except jwt.InvalidTokenError as e:
        print(f"--- ERROR: Invalid token - {str(e)} ---")
        return 'Invalid token. Please log in again.'
    except Exception as e:
        print(f"--- ERROR: Unexpected error decoding token - {type(e).__name__}: {str(e)} ---")
        return 'Error validating token. Please log in again.'

# --- Auth Decorator ---
def token_required(f):
    """A decorator to protect routes that require authentication."""
    @wraps(f) 
    def decorated(*args, **kwargs):
        token = None
        
        # Debug: Print all headers to see what we're receiving
        print(f"--- DEBUG: Request method: {request.method} ---")
        print(f"--- DEBUG: Request headers: {dict(request.headers)} ---")
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            print(f"--- DEBUG: Received Auth Header: {auth_header[:50]}... ---")
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                print(f"--- DEBUG: Token extracted successfully ---")
            else:
                print(f"--- ERROR: Invalid Authorization header format. Expected 'Bearer <token>', got: {auth_header[:50]} ---")
                return jsonify({'message': 'Invalid Authorization header format!'}), 401
        else:
            print("--- ERROR: Authorization header is missing! ---")
            print(f"--- DEBUG: Available headers: {list(request.headers.keys())} ---")
            return jsonify({'message': 'Token is missing! Please log in again.'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        result = decode_auth_token(token)
        if isinstance(result, str): # If it's an error message
            print(f"--- ERROR: Token validation failed: {result} ---")
            return jsonify({'message': result}), 401
        
        user_id, role_id = result
        print(f"--- SUCCESS: Token validated for user_id: {user_id}, role_id: {role_id} ---")
        kwargs['current_user_id'] = user_id
        kwargs['current_user_role_id'] = role_id
        return f(*args, **kwargs)

    return decorated

# --- Role-Based Access Control Decorator ---
def role_required(*allowed_roles):
    """
    A decorator to protect routes that require specific roles.
    Usage: @role_required('admin', 'administration')
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            role_id = kwargs.get('current_user_role_id')
            
            # Get role name from database
            conn = None
            try:
                conn = get_db_connection()
                if conn is None:
                    return jsonify({'message': 'Database connection failed!'}), 500
                
                cur = conn.cursor()
                cur.execute("SELECT name FROM roles WHERE id = %s;", (role_id,))
                role_result = cur.fetchone()
                
                if not role_result:
                    return jsonify({'message': 'User role not found!'}), 403
                
                role_name = role_result['name']
                
                # Check if user's role is in allowed roles
                if role_name not in allowed_roles:
                    return jsonify({
                        'message': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                    }), 403
                
                kwargs['current_user_role'] = role_name
                return f(*args, **kwargs)
                
            except Exception as e:
                print(f"Role check error: {e}")
                return jsonify({'message': 'Error checking user permissions.'}), 500
            finally:
                if conn:
                    cur.close()
                    conn.close()
        
        return decorated
    return decorator

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
    role_id = data.get('role_id', 1)  # Default to role_id 1 (officials) if not provided
    
    # Validate role_id - only allow non-admin roles during signup
    if role_id not in [1, 2]:  # Only allow 'officials' (1) or 'administration' (2)
        role_id = 1  # Default to officials if invalid role provided 
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = None
    try:
        conn = get_db_connection() 
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO users (email, password_hash, display_name, username, role_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, email, display_name, created_at, role_id;
            """,
            (email, hashed_password, display_name, username, role_id)
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

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user_id, current_user_role_id):
    """Get current user information including role."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        cur = conn.cursor()
        # Get user info with role name
        cur.execute("""
            SELECT u.id, u.email, u.username, u.display_name, u.status, u.created_at, 
                   r.id as role_id, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = %s;
        """, (current_user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'message': 'User not found!'}), 404
        
        return jsonify({
            'user': user
        }), 200
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'message': 'An error occurred while fetching user information.'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

@auth_bp.route('/roles', methods=['GET'])
def get_roles():
    """Get all available roles (for admin use)."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM roles ORDER BY id;")
        roles = cur.fetchall()
        
        return jsonify({
            'roles': roles
        }), 200
        
    except Exception as e:
        print(f"Get roles error: {e}")
        return jsonify({'message': 'An error occurred while fetching roles.'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()