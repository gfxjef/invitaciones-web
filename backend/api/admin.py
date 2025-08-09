from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import User, Order, Invitation
from extensions import db
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id) if isinstance(current_user_id, str) else current_user_id)
        if not user or user.role.value != 'ADMIN':
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    total_users = User.query.count()
    total_orders = Order.query.count() if Order.__table__.exists() else 0
    total_invitations = Invitation.query.count() if hasattr(Invitation, 'query') else 0
    revenue = db.session.query(func.sum(Order.total)).scalar() or 0 if Order.__table__.exists() else 0
    
    return jsonify({
        'stats': {
            'total_users': total_users,
            'total_orders': total_orders,
            'total_invitations': total_invitations,
            'revenue': float(revenue) if revenue else 0
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        'users': [user.to_dict() for user in users]
    }), 200


@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify({
            'orders': [order.to_dict() for order in orders]
        }), 200
    except Exception:
        return jsonify({
            'orders': []
        }), 200