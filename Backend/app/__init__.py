import os
from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
cors = CORS()
bcrypt = Bcrypt()

def create_app():
    """The application factory."""
    app = Flask(__name__)
    
    secret_key = os.environ.get('JWT_SECRET_KEY')
    data_base_url = os.environ.get('DATABASE_URL')
    if not secret_key:
        print("⚠️ WARNING: JWT_SECRET_KEY not found in environment variables!")
        # Generate a temporary key for development
        import secrets
        secret_key = secrets.token_hex(32)
        print(f"⚠️ Using temporary secret key: {secret_key}")

    # Load config
    app.config['SECRET_KEY'] = secret_key
    app.config['DATABASE_URL'] = data_base_url
    
    # Initialize extensions with the app
    cors.init_app(app)
    bcrypt.init_app(app)
    
    # --- Import and Register Blueprints ---
    
    # Import your blueprint files
    from . import auth
    from . import dashboard
    from . import upload  # <--- ADD THIS LINE

    # Register the blueprints
    # All routes from auth.py will be prefixed with /auth
    app.register_blueprint(auth.auth_bp, url_prefix='/auth') 
    
    # All routes from dashboard.py will be prefixed with /api
    app.register_blueprint(dashboard.dashboard_bp, url_prefix='/api')
    
    # Register the new upload blueprint
    app.register_blueprint(upload.upload_bp, url_prefix='/api') # <--- ADD THIS LINE
    
    # A simple test route
    @app.route('/health')
    def health_check():
        return "Server is running!"

    return app