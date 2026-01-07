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

# =====================================================
# EXISTING TOKEN HELPERS (UNCHANGED)
# =====================================================

def encode_auth_token(user_id, role_id):
    """
    Generates the Auth Token.
    Returns a token string on success, or None on failure.
    """
    try:
        payload = {
            'exp': int((datetime.datetime.now(timezone.utc) + datetime.timedelta(days=1)).timestamp()),
            'iat': int(datetime.datetime.now(timezone.utc).timestamp()),
            'sub': str(user_id),
            'role': role_id
        }
        secret_key = current_app.config.get('SECRET_KEY')

        if not secret_key:
            print("--- CRITICAL ERROR: JWT_SECRET_KEY is not set! ---")
            return None 

        token = jwt.encode(payload, secret_key, algorithm='HS256')
        return token
        
    except Exception as e:
        print(f"Error encoding token: {e}")
        return None


def decode_auth_token(auth_token):
    """Decodes the auth token."""
    try:
        secret_key = current_app.config.get('SECRET_KEY')
        payload = jwt.decode(auth_token, secret_key, algorithms=['HS256'], leeway=10)
        return int(payload['sub'])
    except jwt.ExpiredSignatureError:
        return 'Token expired. Please log in again.'
    except jwt.InvalidTokenError:
        return 'Invalid token. Please log in again.'
    except Exception as e:
        return 'Error validating token. Please log in again.'


# =====================================================
# EXISTING AUTH DECORATOR (UNCHANGED)
# =====================================================

def token_required(f):
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
        else:
            return jsonify({'message': 'Token is missing! Please log in again.'}), 401

        user_id = decode_auth_token(token)
        if isinstance(user_id, str):
            return jsonify({'message': user_id}), 401
        
        kwargs['current_user_id'] = user_id
        return f(*args, **kwargs)

    return decorated


# =====================================================
# EXISTING ROUTES (UNCHANGED)
# =====================================================

@auth_bp.route('/signup', methods=['POST'])
def signup():
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

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({'message': 'Email or username already exists.'}), 409
    
    finally:
        if conn:
            cur.close()
            conn.close()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required!'}), 400

    email = data.get('email')
    password = data.get('password')
    
    conn = None
    try:
        conn = get_db_connection()
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
            del user['password_hash'] 
            
            return jsonify({
                'message': 'Login successful!',
                'token': auth_token,
                'user': user
            }), 200
        else:
            return jsonify({'message': 'Incorrect password.'}), 401

    finally:
        if conn:
            cur.close()
            conn.close()


# =====================================================
# 🔥 NEW CODE — ADMIN ONLY FEATURES (ADDED)
# =====================================================

@auth_bp.route('/roles', methods=['GET'])
@token_required
def get_roles(current_user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT role_id FROM users WHERE id = %s;", (current_user_id,))
        user = cur.fetchone()

        if not user or user['role_id'] != 3:
            return jsonify({'message': 'Admin access required'}), 403

        cur.execute("SELECT id, name FROM roles ORDER BY id;")
        roles = cur.fetchall()

        return jsonify(roles), 200

    finally:
        cur.close()
        conn.close()


@auth_bp.route('/create-user', methods=['POST'])
@token_required
def create_user(current_user_id):
    data = request.get_json()

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT role_id FROM users WHERE id = %s;", (current_user_id,))
        admin = cur.fetchone()

        if not admin or admin['role_id'] != 3:
            return jsonify({'message': 'Admin access required'}), 403

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        cur.execute(
            """
            INSERT INTO users (email, password_hash, username, display_name, role_id, status)
            VALUES (%s, %s, %s, %s, %s, 'pending_verification')
            RETURNING id, email, username, display_name, role_id;
            """,
            (
                data['email'],
                hashed_password,
                data['username'],
                data.get('display_name'),
                data['role_id']
            )
        )

        new_user = cur.fetchone()
        conn.commit()

        return jsonify({
            'message': 'User created successfully',
            'user': new_user
        }), 201

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({'message': 'Email or username already exists'}), 409

    finally:
        cur.close()
        conn.close()