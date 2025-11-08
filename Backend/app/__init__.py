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
    # Configure CORS to explicitly allow Authorization header for file uploads
    cors.init_app(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    bcrypt.init_app(app)
    
    # --- Import and Register Blueprints ---
    
    # Import your blueprint files
    from . import auth
    from . import dashboard
    from . import upload
    from . import academic_stats
    from . import administrative_stats
    from . import grievance_stats
    from . import ewd_stats
    from . import iar_stats
    from . import education_stats

    # Register the blueprints
    # All routes from auth.py will be prefixed with /auth
    app.register_blueprint(auth.auth_bp, url_prefix='/auth') 
    
    # All routes from dashboard.py will be prefixed with /api
    app.register_blueprint(dashboard.dashboard_bp, url_prefix='/api')
    
    # Register the upload blueprint
    app.register_blueprint(upload.upload_bp, url_prefix='/api')
    
    # Register the academic stats blueprint
    app.register_blueprint(academic_stats.academic_bp, url_prefix='/api/academic')
    
    # Register the administrative stats blueprint
    app.register_blueprint(administrative_stats.administrative_bp, url_prefix='/api/administrative')

    # Register the grievance stats blueprint
    app.register_blueprint(grievance_stats.grievance_bp, url_prefix='/api/grievance')

    # Register the EWD stats blueprint
    app.register_blueprint(ewd_stats.ewd_bp, url_prefix='/api/ewd')

    # Register International & Alumni Relations blueprint
    app.register_blueprint(iar_stats.iar_bp, url_prefix='/api/iar')

    # Register Education blueprint
    app.register_blueprint(education_stats.education_bp, url_prefix='/api/education')
    
    # A simple test route
    @app.route('/health')
    def health_check():
        return "Server is running!"

    return app