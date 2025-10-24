from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
# ... import your other needs like psycopg2, jwt, etc.

# 1. Create the Blueprint
# 'auth' is the name of this blueprint
auth_bp = Blueprint('auth', __name__)

bcrypt = Bcrypt() # You might initialize this in __init__.py instead

# Note: The route is now @auth_bp.route(...), not @app.route(...)
@auth_bp.route('/signup', methods=['POST'])
def signup():
    # ALL YOUR SIGNUP LOGIC GOES HERE
    return jsonify({"message": "Signup successful"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    # ALL YOUR LOGIN LOGIC GOES HERE
    return jsonify({"message": "Login successful"}), 200

# ... any other auth routes (e.g., /logout, /reset-password) ...\