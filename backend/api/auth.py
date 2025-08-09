from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity,
    get_current_user
)
from models import User
from extensions import db
from marshmallow import Schema, fields, ValidationError
from datetime import datetime

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