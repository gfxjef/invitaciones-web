from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from models.user import UserRole

users_bp = Blueprint('users', __name__)


@users_bp.route('/plan', methods=['GET'])
@jwt_required()
def get_user_plan():
    """
    GET /api/user/plan - Get current user's plan information
    
    WHY: Frontend needs to know user's plan to determine feature limits
    like number of URLs per invitation (Standard: 1, Exclusive: 3)
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get user's plan information
        plan_info = {
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role.value if user.role else 'USER',
            'is_active': user.is_active,
            'plan': {
                'name': 'Standard',  # Default plan
                'max_urls_per_invitation': 1,
                'features': ['basic_templates', 'url_generation', 'basic_analytics']
            }
        }
        
        # If user has a specific plan relationship, use that instead
        if hasattr(user, 'plan') and user.plan:
            plan_info['plan'] = {
                'id': user.plan.id,
                'name': user.plan.name,
                'max_urls_per_invitation': getattr(user.plan, 'max_urls_per_invitation', 1),
                'features': getattr(user.plan, 'features', [])
            }
        elif user.role == UserRole.PREMIUM:
            # Premium users get Exclusive plan benefits
            plan_info['plan'] = {
                'name': 'Exclusive',
                'max_urls_per_invitation': 3,
                'features': ['premium_templates', 'url_generation', 'advanced_analytics', 'custom_branding']
            }
        
        return jsonify(plan_info), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500


@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """
    GET /api/user/profile - Get current user's profile information
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        profile_info = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role.value if user.role else 'USER',
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'updated_at': user.updated_at.isoformat() if user.updated_at else None
        }
        
        return jsonify({'user': profile_info}), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500