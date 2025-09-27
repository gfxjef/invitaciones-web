from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_current_user
)
from flask_dance.contrib.google import make_google_blueprint, google
from models.user import User
from models.oauth import OAuth
from services.google_oauth import GoogleOAuthService
from extensions import db
from marshmallow import Schema, fields, ValidationError
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)


class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 8)
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    phone = fields.Str()


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


@auth_bp.route('/register', methods=['POST'])
def register():
    schema = RegisterSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409
    
    # Create new user
    user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint with enhanced session management.
    
    WHY: Provides access and refresh tokens with user data for frontend state management.
    Returns comprehensive user data to populate frontend session state.
    """
    schema = LoginSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({
            'message': 'Invalid credentials',
            'error': 'invalid_credentials'
        }), 401
    
    if not user.is_active:
        return jsonify({
            'message': 'Account is deactivated',
            'error': 'account_deactivated'
        }), 403
    
    # Update last login timestamp
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer'
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token using refresh token.
    
    WHY: Allows frontend to maintain session without re-login.
    Validates user is still active before issuing new token.
    
    EXPECTS: JSON body with {'refresh_token': '<token>'}
    """
    try:
        data = request.get_json()
        print(f"DEBUG: Refresh endpoint received data: {data}")
        
        if not data or 'refresh_token' not in data:
            print(f"DEBUG: Missing refresh token in data")
            return jsonify({
                'message': 'Refresh token required',
                'error': 'missing_refresh_token'
            }), 400
        
        refresh_token = data['refresh_token']
        print(f"DEBUG: Refresh token received: {refresh_token[:50]}...")
        
        # Use JWT decode to get user identity from refresh token
        try:
            from flask_jwt_extended import decode_token as jwt_decode_token
            decoded_token = jwt_decode_token(refresh_token)
            print(f"DEBUG: Decoded token: {decoded_token}")
            
            # Check if it's a refresh token
            if decoded_token.get('type') != 'refresh':
                print(f"DEBUG: Invalid token type: {decoded_token.get('type')}")
                return jsonify({
                    'message': 'Invalid token type',
                    'error': 'invalid_token_type'
                }), 422
                
            current_user_id = decoded_token.get('sub')
            print(f"DEBUG: User ID from token: {current_user_id}")
        except Exception as e:
            print(f"DEBUG: Error decoding token: {e}")
            return jsonify({
                'message': 'Invalid refresh token',
                'error': 'invalid_refresh_token'
            }), 422
        
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        if not user.is_active:
            return jsonify({
                'message': 'Account is deactivated',
                'error': 'account_deactivated'
            }), 403
        
        # Generate new tokens
        access_token = create_access_token(identity=current_user_id)
        new_refresh_token = create_refresh_token(identity=current_user_id)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': new_refresh_token,
            'token_type': 'Bearer',
            'user': user.to_dict(),
            'expires_in': 900  # 15 minutes
        }), 200
        
    except Exception as e:
        print(f"Refresh token error: {e}")  # For debugging
        return jsonify({
            'message': 'Error refreshing token',
            'error': 'server_error'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout endpoint for frontend session cleanup.
    
    WHY: Provides a clear logout endpoint for frontend to call.
    In the future, this could handle token blacklisting if needed.
    """
    return jsonify({
        'message': 'Logout successful',
        'authenticated': False
    }), 200


@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify if current token is valid and user is active.
    
    WHY: Quick endpoint for frontend to verify session validity
    without returning full user data.
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'valid': False,
                'authenticated': False
            }), 401
        
        return jsonify({
            'valid': True,
            'authenticated': True,
            'user_id': user.id
        }), 200
        
    except Exception:
        return jsonify({
            'valid': False,
            'authenticated': False
        }), 401


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user information.
    
    WHY: Essential for frontend to maintain user session state.
    Returns fresh user data to sync with any backend changes.
    """
    try:
        current_user_id = get_jwt_identity()
        print(f"DEBUG /me: User ID from token: {current_user_id}")
        user = User.query.get(current_user_id)
        
        if not user:
            print(f"DEBUG /me: User not found with ID: {current_user_id}")
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        if not user.is_active:
            print(f"DEBUG /me: User {current_user_id} is not active")
            return jsonify({
                'message': 'Account is deactivated',
                'error': 'account_deactivated'
            }), 403
        
        print(f"DEBUG /me: Successfully returning user data for {user.email}")
        return jsonify({
            'user': user.to_dict(),
            'authenticated': True
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Error retrieving user information',
            'error': 'server_error'
        }), 500


# =============================================================================
# GOOGLE OAUTH ENDPOINTS
# =============================================================================

class GoogleTokenSchema(Schema):
    credential = fields.Str(required=True)


@auth_bp.route('/google/verify', methods=['POST'])
def verify_google_token():
    """Verify Google ID Token from frontend (recommended flow).

    WHY: Secure server-side verification of Google ID tokens.
    Frontend sends Google credential, backend validates and creates session.
    """
    logger.info("📨 ========== ENDPOINT /google/verify LLAMADO ==========")

    # Log request headers for debugging
    logger.info(f"📋 Request headers: Content-Type={request.content_type}")
    logger.info(f"📋 Request origin: {request.headers.get('Origin', 'Unknown')}")

    schema = GoogleTokenSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        logger.error(f"❌ Error de validación del request: {err.messages}")
        return jsonify({'errors': err.messages}), 400

    credential = data.get('credential')

    # Validación explícita del credential
    if not credential:
        logger.error("❌ No se recibió credential en el request")
        return jsonify({
            'error': 'missing_credential',
            'message': 'No se recibió el token de Google'
        }), 400

    logger.info(f"📦 Credential recibido con longitud: {len(credential)} caracteres")
    logger.info(f"📦 Primeros 30 caracteres del credential: {credential[:30]}...")

    try:
        # Use our service to handle the complete Google login flow
        logger.info("🚀 Iniciando proceso de login con Google...")
        login_response = GoogleOAuthService.handle_google_login(credential)

        logger.info(f"✅ Google login EXITOSO para usuario: {login_response['user']['email']}")
        logger.info("📨 ========== FIN ENDPOINT /google/verify (EXITOSO) ==========")
        return jsonify(login_response), 200

    except ValueError as e:
        logger.error(f"❌ Error de validación en Google login: {str(e)}")
        logger.error(f"❌ Detalles del error: {type(e).__name__}")
        logger.error("📨 ========== FIN ENDPOINT /google/verify (ERROR 401) ==========")
        return jsonify({
            'error': 'invalid_token',
            'message': 'Token de Google inválido o expirado',
            'details': str(e),
            'help': 'Verifica que el CLIENT_ID sea correcto y el token no haya expirado'
        }), 401

    except Exception as e:
        # Import here to avoid circular imports
        from sqlalchemy.exc import IntegrityError

        # Handle database-specific errors
        if isinstance(e, IntegrityError):
            logger.error(f"❌ Error de integridad de base de datos: {str(e)}")
            logger.error("❌ Posible causa: Cuenta Google ya vinculada o race condition")
            logger.error("📨 ========== FIN ENDPOINT /google/verify (ERROR 409) ==========")
            return jsonify({
                'error': 'account_conflict',
                'message': 'Esta cuenta de Google ya está vinculada con otro usuario',
                'details': 'La cuenta ya existe en el sistema',
                'help': 'Intenta hacer login en lugar de registrarte'
            }), 409
        else:
            logger.error(f"❌ Error inesperado en Google login: {str(e)}")
            logger.error(f"❌ Tipo de error: {type(e).__name__}")
            logger.error("📨 ========== FIN ENDPOINT /google/verify (ERROR 500) ==========")
            return jsonify({
                'error': 'server_error',
                'message': 'Error interno del servidor al procesar Google login',
                'details': str(e)
            }), 500


@auth_bp.route('/google/login')
def google_login():
    """Initiate Google OAuth flow (redirect-based flow).

    WHY: Alternative flow for server-side OAuth dance.
    Redirects user to Google for authentication.
    """
    try:
        return redirect(url_for("google.login"))
    except Exception as e:
        logger.error(f"Google OAuth redirect failed: {e}")
        return jsonify({
            'message': 'Google login redirect failed',
            'error': 'oauth_error'
        }), 500


@auth_bp.route('/google/callback')
def google_authorized():
    """Handle Google OAuth callback (redirect-based flow).

    WHY: Processes Google OAuth callback and creates user session.
    Called by Google after user grants permission.
    """
    try:
        if not google.authorized:
            logger.warning("Google OAuth authorization failed")
            return jsonify({
                'message': 'Failed to log in with Google',
                'error': 'oauth_denied'
            }), 400

        # Get user info from Google
        resp = google.get("/oauth2/v2/userinfo")
        if not resp.ok:
            logger.error(f"Failed to fetch Google user info: {resp.status_code}")
            return jsonify({
                'message': 'Failed to fetch user info from Google',
                'error': 'google_api_error'
            }), 400

        user_info = resp.json()
        logger.info(f"Google OAuth callback for user: {user_info.get('email')}")

        # Process user with our service
        user, user_created = GoogleOAuthService.process_google_user(user_info)

        # Generate tokens
        token_data = GoogleOAuthService.generate_tokens_for_user(user)

        # Redirect to frontend with token (for redirect flow)
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/callback?token={token_data['access_token']}"

        logger.info(f"Redirecting to frontend after Google OAuth: {user.email}")
        return redirect(redirect_url)

    except Exception as e:
        logger.error(f"Google OAuth callback error: {e}")
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        error_url = f"{frontend_url}/login?error=oauth_failed"
        return redirect(error_url)


@auth_bp.route('/google/revoke', methods=['POST'])
@jwt_required()
def revoke_google_access():
    """Revoke Google OAuth access for current user.

    WHY: Allows users to disconnect their Google account.
    Marks OAuth record as inactive but keeps user account.
    """
    try:
        current_user_id = get_jwt_identity()
        GoogleOAuthService.revoke_google_access(current_user_id)

        return jsonify({
            'message': 'Google access revoked successfully',
            'revoked': True
        }), 200

    except Exception as e:
        logger.error(f"Failed to revoke Google access: {e}")
        return jsonify({
            'message': 'Failed to revoke Google access',
            'error': 'server_error'
        }), 500


@auth_bp.route('/google/status', methods=['GET'])
@jwt_required()
def google_account_status():
    """Get Google account connection status for current user.

    WHY: Frontend can check if user has Google account linked.
    Shows OAuth connection details without sensitive data.
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        oauth_record = OAuth.query.filter_by(
            user_id=current_user_id,
            provider='google',
            is_active=True
        ).first()

        response_data = {
            'google_connected': oauth_record is not None,
            'is_oauth_user': user.is_oauth_user,
            'provider': user.provider,
            'google_id': user.google_id is not None
        }

        if oauth_record:
            response_data.update({
                'google_email': oauth_record.user_email,
                'google_name': oauth_record.user_name,
                'connected_at': oauth_record.created_at.isoformat() if oauth_record.created_at else None
            })

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Failed to get Google status: {e}")
        return jsonify({
            'message': 'Failed to get Google account status',
            'error': 'server_error'
        }), 500