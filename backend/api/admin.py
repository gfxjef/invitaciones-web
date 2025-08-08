from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import User

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role.value != 'ADMIN':
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    return jsonify({
        'stats': {
            'total_users': 0,
            'total_orders': 0,
            'total_invitations': 0,
            'revenue': 0
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    return jsonify({
        'users': []
    }), 200


@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    return jsonify({
        'orders': []
    }), 200