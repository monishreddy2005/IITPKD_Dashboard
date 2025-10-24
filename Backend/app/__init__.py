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
    
    # Load config
    app.config['SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['DATABASE_URL'] = os.environ.get('DATABASE_URL')
    
    # Initialize extensions with the app
    cors.init_app(app)
    bcrypt.init_app(app)
    
    # --- Import and Register Blueprints ---
    
    # Import your blueprint files
    from . import auth
    from . import dashboard
    
    # Register the blueprints
    # All routes from auth.py will be prefixed with /auth
    app.register_blueprint(auth.auth_bp, url_prefix='/auth') 
    
    # All routes from dashboard.py will be prefixed with /api
    app.register_blueprint(dashboard.dashboard_bp, url_prefix='/api')
    
    # A simple test route
    @app.route('/health')
    def health_check():
        return "Server is running!"

    return app