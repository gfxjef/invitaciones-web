"""
Flask Extensions Module

This module initializes all Flask extensions in a centralized location
to avoid circular imports and ensure proper configuration.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
ma = Marshmallow()


def configure_jwt(jwt, app):
    """
    Configure JWT callbacks and error handlers.
    
    WHY: Centralized JWT configuration for better organization
    and to avoid circular imports.
    """
    
    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        from flask import jsonify
        return jsonify({
            'message': 'Fresh token required',
            'error': 'fresh_token_required'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        from flask import jsonify
        return jsonify({
            'message': 'Token has been revoked',
            'error': 'token_revoked'
        }), 401
    
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        # Implement token revocation check if needed
        return False