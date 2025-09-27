from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from datetime import timedelta

# Load environment variables
load_dotenv()

# Import extensions from centralized module to avoid circular imports
from extensions import db, migrate, jwt, ma, configure_jwt


def create_app(config_name=None):
    app = Flask(__name__)
    
    # Build MySQL connection string from individual variables
    db_host = os.getenv('DB_HOST', 'localhost')
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'invitaciones_web')
    db_port = os.getenv('DB_PORT', '3306')
    
    # MySQL connection string
    database_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # MySQL Connection Pool Configuration - WHY: Fix "Lost connection to MySQL server" errors
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,      # Test connections before use
        'pool_recycle': 3600,       # Recycle connections every hour
        'pool_size': 10,            # Base pool size
        'max_overflow': 20,         # Maximum additional connections
        'pool_timeout': 30,         # Timeout to get connection from pool
        'echo': False               # Set to True for SQL query debugging
    }
    
    # File Upload Configuration
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', os.path.join(os.path.dirname(__file__), 'uploads'))
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
    
    # JWT Configuration - WHY: Enhanced JWT config with proper error handling
    jwt_secret = os.getenv('JWT_SECRET')
    if not jwt_secret:
        raise ValueError("JWT_SECRET environment variable is required")
    
    app.config['JWT_SECRET_KEY'] = jwt_secret
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['JWT_IDENTITY_CLAIM'] = 'sub'
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # Google OAuth Configuration
    app.config['GOOGLE_OAUTH_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
    app.config['GOOGLE_OAUTH_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')

    # Environment-aware configuration
    app_environment = os.getenv('APP_ENVIRONMENT', 'development')
    if app_environment == 'production':
        app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL_PROD', 'https://invitaciones-web-ten.vercel.app')
        app.config['GOOGLE_REDIRECT_URI'] = os.getenv('GOOGLE_REDIRECT_URI_PROD')
    else:
        app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL_DEV', 'http://localhost:3000')
        app.config['GOOGLE_REDIRECT_URI'] = os.getenv('GOOGLE_REDIRECT_URI_DEV')

    # CORS Configuration
    cors_origins = os.getenv('CORS_ORIGIN', 'http://localhost:3000').split(',')
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)

    # Google OAuth Blueprint configuration
    from flask_dance.contrib.google import make_google_blueprint
    from flask_dance.consumer.storage.sqla import SQLAlchemyStorage

    # Configure Google OAuth with correct callback URL
    google_bp = make_google_blueprint(
        scope=["openid", "email", "profile"],
        redirect_to="auth.google_authorized",  # Points to our custom endpoint
        authorized_url="/api/auth/google/callback",  # Matches Google Console exactly
        storage=None  # Will configure after models are imported
    )
    app.register_blueprint(google_bp, url_prefix="/api/auth")
    
    # JWT identity loaders and error handlers
    @jwt.user_identity_loader
    def user_identity_lookup(user_id):
        return str(user_id)
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        try:
            user_id = int(identity)
            from models import User
            return User.query.get(user_id)
        except (ValueError, TypeError):
            return None
    
    # Configure JWT with additional settings
    configure_jwt(jwt, app)
    
    # JWT Error handlers - WHY: Better error messages for frontend debugging
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'message': 'Token has expired',
            'error': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'message': 'Invalid token',
            'error': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'message': 'Authorization token is required',
            'error': 'authorization_required'
        }), 401
    
    # Enhanced CORS configuration - WHY: Proper CORS setup for JWT token handling
    CORS(app, 
         origins=cors_origins,
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
         expose_headers=['Content-Length', 'X-Total-Count'])
    
    # Create database tables if they don't exist
    with app.app_context():
        try:
            # Import all models - all exist now after recovery
            from models import User, Plan, Template, Invitation, Order, OrderItem, OrderStatus, Cart, CartItem, Coupon, CouponUsage, InvitationURL, Claim, Testimonial, InvitationData, InvitationMedia, InvitationEvent, InvitationResponse
            from models.oauth import OAuth

            # Configure Google OAuth storage after models are imported
            from flask_dance.consumer.storage.sqla import SQLAlchemyStorage
            google_bp.storage = SQLAlchemyStorage(OAuth, db.session, user=lambda: None)

            # Create all tables if they don't exist
            db.create_all()
            print("[INFO] Database tables created successfully!")
            
            # Create admin user if doesn't exist
            admin_email = os.getenv('ADMIN_EMAIL', 'admin@invitaciones.com')
            admin_user = User.query.filter_by(email=admin_email).first()
            
            if not admin_user:
                from models.user import UserRole
                admin_user = User(
                    email=admin_email,
                    first_name='Admin',
                    last_name='System',
                    role=UserRole.ADMIN,
                    is_active=True,
                    email_verified=True
                )
                admin_user.set_password(os.getenv('ADMIN_PASSWORD', 'admin123'))
                db.session.add(admin_user)
                db.session.commit()
                print(f"[INFO] Admin user created: {admin_email}")
                
        except Exception as e:
            print(f"[WARNING] Database initialization error: {e}")
            print("[INFO] You may need to run 'python init_db.py' manually")

    # Register blueprints - Now all files exist
    from api.auth import auth_bp
    from api.users import users_bp
    from api.plans import plans_bp
    from api.invitations import invitations_bp
    from api.invitation_urls import invitation_urls_bp
    from api.invitation_editor import invitation_editor_bp
    from api.redirect import redirect_bp
    from api.orders import orders_bp
    from api.admin import admin_bp
    from api.templates import templates_bp
    from api.payments import payments_bp
    from api.coupons import coupons_bp
    from api.cart import cart_bp
    from api.modular_templates import modular_templates_bp
    from api.pdf_generation import pdf_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/user')
    app.register_blueprint(plans_bp, url_prefix='/api/plans')
    app.register_blueprint(invitations_bp, url_prefix='/api/invitations')
    app.register_blueprint(invitation_urls_bp, url_prefix='/api/invitation-urls')
    app.register_blueprint(invitation_editor_bp, url_prefix='/api/invitations')  # Editor endpoints under /api/invitations/{id}/...
    app.register_blueprint(redirect_bp)  # No prefix - needs to be at root for /r/{code}
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(templates_bp, url_prefix='/api/templates')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(coupons_bp, url_prefix='/api/coupons')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(modular_templates_bp, url_prefix='/api/modular-templates')
    app.register_blueprint(pdf_bp)  # PDF generation service
    
    # Root endpoint
    @app.route('/')
    def index():
        """Root endpoint - API information"""
        return jsonify({
            'message': 'Invitaciones Web API',
            'version': '1.0',
            'status': 'running',
            'endpoints': {
                'health': '/health',
                'auth': '/api/auth/*',
                'payments': '/api/payments/*',
                'orders': '/api/orders/*',
                'invitations': '/api/invitations/*'
            }
        }), 200

    # Health check endpoint - WHY: Enhanced health check with DB connectivity
    @app.route('/health')
    def health_check():
        try:
            # Test database connectivity
            from sqlalchemy import text
            with db.engine.connect() as connection:
                connection.execute(text('SELECT 1'))
            return {
                'status': 'healthy', 
                'service': 'invitaciones-api',
                'database': 'connected',
                'jwt_configured': bool(app.config.get('JWT_SECRET_KEY'))
            }, 200
        except Exception as e:
            return {
                'status': 'unhealthy',
                'service': 'invitaciones-api', 
                'database': 'disconnected',
                'error': str(e)
            }, 503
    
    return app


if __name__ == '__main__':
    app = create_app()
    # Use PORT from environment (Render uses this) or fallback to FLASK_PORT
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5000)))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    )