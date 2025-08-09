from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError, validates, validates_schema
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import or_

from models import Coupon, CouponUsage, User, Order
from models.coupon import CouponType
from extensions import db

coupons_bp = Blueprint('coupons', __name__)


# WHY: Separate schemas for different contexts ensures appropriate validation
# and prevents data leakage between admin and public endpoints
class CouponCreateSchema(Schema):
    """Schema for creating new coupons (admin only)."""
    
    code = fields.Str(validate=lambda x: len(x) >= 3 and len(x) <= 50, allow_none=True)
    name = fields.Str(required=True, validate=lambda x: len(x) >= 1 and len(x) <= 200)
    description = fields.Str(validate=lambda x: len(x) <= 1000, allow_none=True)
    type = fields.Str(required=True, validate=lambda x: x in ['PERCENTAGE', 'FIXED_AMOUNT'])
    value = fields.Decimal(required=True, validate=lambda x: x > 0)
    start_date = fields.DateTime(allow_none=True)
    end_date = fields.DateTime(required=True)
    usage_limit = fields.Int(validate=lambda x: x > 0, allow_none=True)
    usage_limit_per_user = fields.Int(validate=lambda x: x > 0, default=1)
    minimum_order_amount = fields.Decimal(validate=lambda x: x >= 0, default=0)
    maximum_discount_amount = fields.Decimal(validate=lambda x: x > 0, allow_none=True)
    is_active = fields.Bool(default=True)
    
    @validates('value')
    def validate_value(self, value):
        """Validate coupon value based on type."""
        # Get type from the data being validated
        coupon_type = self.context.get('type') if hasattr(self, 'context') else None
        if coupon_type == 'PERCENTAGE' and value > 100:
            raise ValidationError('Percentage value cannot exceed 100%')
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate date relationships."""
        start_date = data.get('start_date', datetime.utcnow())
        end_date = data.get('end_date')
        
        if end_date and start_date >= end_date:
            raise ValidationError('End date must be after start date')
        
        # End date cannot be in the past
        if end_date and end_date < datetime.utcnow():
            raise ValidationError('End date cannot be in the past')
    
    @validates_schema
    def validate_percentage_max_discount(self, data, **kwargs):
        """Validate maximum discount for percentage coupons."""
        coupon_type = data.get('type')
        max_discount = data.get('maximum_discount_amount')
        
        if coupon_type == 'FIXED_AMOUNT' and max_discount:
            raise ValidationError('Maximum discount amount only applies to percentage coupons')


class CouponUpdateSchema(Schema):
    """Schema for updating existing coupons (admin only)."""
    
    name = fields.Str(validate=lambda x: len(x) >= 1 and len(x) <= 200)
    description = fields.Str(validate=lambda x: len(x) <= 1000, allow_none=True)
    end_date = fields.DateTime()
    usage_limit = fields.Int(validate=lambda x: x > 0, allow_none=True)
    usage_limit_per_user = fields.Int(validate=lambda x: x > 0)
    minimum_order_amount = fields.Decimal(validate=lambda x: x >= 0)
    maximum_discount_amount = fields.Decimal(validate=lambda x: x > 0, allow_none=True)
    is_active = fields.Bool()
    
    @validates_schema
    def validate_end_date(self, data, **kwargs):
        """Validate end date is not in the past."""
        end_date = data.get('end_date')
        if end_date and end_date < datetime.utcnow():
            raise ValidationError('End date cannot be in the past')


class CouponValidationSchema(Schema):
    """Schema for validating coupon codes."""
    
    code = fields.Str(required=True, validate=lambda x: len(x) >= 1 and len(x) <= 50)
    order_amount = fields.Decimal(validate=lambda x: x > 0, allow_none=True)


class CouponApplicationSchema(Schema):
    """Schema for applying coupons to orders."""
    
    code = fields.Str(required=True, validate=lambda x: len(x) >= 1 and len(x) <= 50)


def require_admin():
    """
    Decorator to ensure only admin users can access certain endpoints.
    
    WHY: Centralized admin authorization prevents code duplication
    and ensures consistent security across admin-only endpoints.
    """
    from functools import wraps
    
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(int(user_id) if isinstance(user_id, str) else user_id)
            
            if not user or user.role.value != 'ADMIN':
                return jsonify({'message': 'Admin access required'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# WHY: CRUD endpoints follow RESTful patterns for predictable API design
# and maintainable code structure

@coupons_bp.route('', methods=['POST'])
@require_admin()
def create_coupon():
    """
    Create a new coupon (admin only).
    
    WHY: Centralized coupon creation with validation ensures data integrity
    and provides audit trail for promotional campaign management.
    """
    schema = CouponCreateSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    # Check if code already exists (if provided)
    if data.get('code'):
        existing = Coupon.query.filter_by(code=data['code']).first()
        if existing:
            return jsonify({'message': 'Coupon code already exists'}), 409
    
    try:
        # Convert string type to enum
        coupon_type = CouponType.PERCENTAGE if data['type'] == 'PERCENTAGE' else CouponType.FIXED_AMOUNT
        
        coupon = Coupon(
            code=data.get('code'),  # Auto-generated if None
            name=data['name'],
            description=data.get('description'),
            type=coupon_type,
            value=data['value'],
            start_date=data.get('start_date', datetime.utcnow()),
            end_date=data['end_date'],
            usage_limit=data.get('usage_limit'),
            usage_limit_per_user=data.get('usage_limit_per_user', 1),
            minimum_order_amount=data.get('minimum_order_amount', 0),
            maximum_discount_amount=data.get('maximum_discount_amount'),
            is_active=data.get('is_active', True),
            created_by=int(get_jwt_identity()) if isinstance(get_jwt_identity(), str) else get_jwt_identity()
        )
        
        db.session.add(coupon)
        db.session.commit()
        
        return jsonify({
            'message': 'Coupon created successfully',
            'coupon': coupon.to_dict(include_sensitive=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating coupon: {str(e)}'}), 500


@coupons_bp.route('', methods=['GET'])
@require_admin()
def list_coupons():
    """
    List all coupons with optional filtering (admin only).
    
    WHY: Provides comprehensive coupon management interface with filtering
    capabilities for efficient promotional campaign oversight.
    """
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    search = request.args.get('search', '').strip()
    is_active = request.args.get('is_active', '').lower()
    coupon_type = request.args.get('type', '').upper()
    
    # Build query with filters
    query = Coupon.query
    
    if search:
        query = query.filter(or_(
            Coupon.code.ilike(f'%{search}%'),
            Coupon.name.ilike(f'%{search}%')
        ))
    
    if is_active in ['true', 'false']:
        query = query.filter(Coupon.is_active == (is_active == 'true'))
    
    if coupon_type in ['PERCENTAGE', 'FIXED_AMOUNT']:
        query = query.filter(Coupon.type == CouponType[coupon_type])
    
    # Order by creation date (newest first)
    query = query.order_by(Coupon.created_at.desc())
    
    # Paginate results
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'coupons': [coupon.to_dict(include_sensitive=True) for coupon in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@coupons_bp.route('/<int:coupon_id>', methods=['GET'])
@require_admin()
def get_coupon(coupon_id):
    """
    Get detailed coupon information (admin only).
    
    WHY: Provides complete coupon details including usage statistics
    for informed promotional campaign management decisions.
    """
    coupon = Coupon.query.get_or_404(coupon_id)
    
    # Get usage statistics
    usage_stats = {
        'total_usage': coupon.current_usage,
        'unique_users': CouponUsage.query.filter_by(coupon_id=coupon.id).distinct(CouponUsage.user_id).count(),
        'total_discount_applied': db.session.query(db.func.sum(CouponUsage.discount_amount))\
                                           .filter_by(coupon_id=coupon.id).scalar() or 0
    }
    
    coupon_data = coupon.to_dict(include_sensitive=True)
    coupon_data['usage_stats'] = usage_stats
    
    return jsonify({'coupon': coupon_data}), 200


@coupons_bp.route('/<int:coupon_id>', methods=['PUT'])
@require_admin()
def update_coupon(coupon_id):
    """
    Update an existing coupon (admin only).
    
    WHY: Allows promotional campaign adjustments while preserving
    data integrity and preventing breaking changes to active campaigns.
    """
    coupon = Coupon.query.get_or_404(coupon_id)
    schema = CouponUpdateSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    try:
        # Update allowed fields
        for field in ['name', 'description', 'end_date', 'usage_limit', 
                     'usage_limit_per_user', 'minimum_order_amount', 
                     'maximum_discount_amount', 'is_active']:
            if field in data:
                setattr(coupon, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Coupon updated successfully',
            'coupon': coupon.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating coupon: {str(e)}'}), 500


@coupons_bp.route('/<int:coupon_id>', methods=['DELETE'])
@require_admin()
def delete_coupon(coupon_id):
    """
    Soft delete a coupon (admin only).
    
    WHY: Soft deletion preserves historical order data while preventing
    new usage, maintaining data integrity for reporting and auditing.
    """
    coupon = Coupon.query.get_or_404(coupon_id)
    
    # Check if coupon has been used
    has_usage = CouponUsage.query.filter_by(coupon_id=coupon.id).first() is not None
    
    if has_usage:
        # Soft delete by deactivating
        coupon.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'Coupon deactivated (has usage history)',
            'coupon': coupon.to_dict(include_sensitive=True)
        }), 200
    else:
        # Hard delete if no usage
        db.session.delete(coupon)
        db.session.commit()
        
        return jsonify({'message': 'Coupon deleted successfully'}), 200


@coupons_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_coupon():
    """
    Validate a coupon code and calculate potential discount.
    
    WHY: Provides real-time validation feedback to users during checkout,
    improving user experience and preventing invalid coupon applications.
    """
    schema = CouponValidationSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    user_id = get_jwt_identity()
    user_id = int(user_id) if isinstance(user_id, str) else user_id
    coupon_code = data['code'].upper().strip()
    order_amount = data.get('order_amount')
    
    # Find coupon
    coupon = Coupon.query.filter_by(code=coupon_code).first()
    if not coupon:
        return jsonify({'valid': False, 'message': 'Cupón no encontrado'}), 404
    
    # Validate coupon
    is_valid, error_message = coupon.is_valid(user_id, order_amount)
    
    if not is_valid:
        return jsonify({'valid': False, 'message': error_message}), 400
    
    # Calculate discount if order amount provided
    discount_amount = 0
    if order_amount is not None:
        discount_amount = coupon.calculate_discount(order_amount)
    
    return jsonify({
        'valid': True,
        'coupon': coupon.to_public_dict(),
        'discount_amount': float(discount_amount),
        'message': 'Cupón válido'
    }), 200


@coupons_bp.route('/public/<string:code>', methods=['GET'])
def get_public_coupon_info(code):
    """
    Get public information about a coupon code.
    
    WHY: Allows customers to preview coupon details before applying,
    improving transparency and user experience in promotional campaigns.
    """
    coupon_code = code.upper().strip()
    
    coupon = Coupon.query.filter_by(code=coupon_code, is_active=True).first()
    if not coupon:
        return jsonify({'message': 'Cupón no encontrado'}), 404
    
    # Check if coupon is currently valid (dates only, no user-specific checks)
    now = datetime.utcnow()
    if now < coupon.start_date or now > coupon.end_date:
        return jsonify({'message': 'Cupón no disponible'}), 400
    
    return jsonify({
        'coupon': coupon.to_public_dict(),
        'valid': True
    }), 200


@coupons_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_coupon_to_session():
    """
    Apply coupon to user's current session/cart (temporary application).
    
    WHY: Allows users to preview discount effects before completing order,
    improving checkout experience and reducing cart abandonment.
    """
    schema = CouponApplicationSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    user_id = get_jwt_identity()
    user_id = int(user_id) if isinstance(user_id, str) else user_id
    coupon_code = data['code'].upper().strip()
    
    # This would typically integrate with a session/cart management system
    # For now, we'll just validate and return the coupon information
    
    coupon = Coupon.query.filter_by(code=coupon_code).first()
    if not coupon:
        return jsonify({'message': 'Cupón no encontrado'}), 404
    
    # Validate coupon (without order amount for now)
    is_valid, error_message = coupon.is_valid(user_id)
    
    if not is_valid:
        return jsonify({'message': error_message}), 400
    
    return jsonify({
        'message': 'Cupón aplicado temporalmente',
        'coupon': coupon.to_public_dict()
    }), 200


@coupons_bp.route('/remove', methods=['DELETE'])
@jwt_required()
def remove_coupon_from_session():
    """
    Remove coupon from user's current session/cart.
    
    WHY: Allows users to easily remove applied coupons if they change their mind
    or want to try different promotional offers.
    """
    # This would typically integrate with session/cart management
    # For now, return success message
    
    return jsonify({'message': 'Cupón removido de la sesión'}), 200


# WHY: Usage statistics endpoints provide valuable business intelligence
# for measuring promotional campaign effectiveness

@coupons_bp.route('/<int:coupon_id>/usage', methods=['GET'])
@require_admin()
def get_coupon_usage(coupon_id):
    """
    Get detailed usage statistics for a specific coupon (admin only).
    
    WHY: Provides comprehensive analytics for measuring promotional campaign
    success, user engagement, and revenue impact.
    """
    coupon = Coupon.query.get_or_404(coupon_id)
    
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    # Get usage records with pagination
    usage_query = CouponUsage.query.filter_by(coupon_id=coupon.id)\
                                   .order_by(CouponUsage.used_at.desc())
    
    pagination = usage_query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Calculate summary statistics
    total_discount = db.session.query(db.func.sum(CouponUsage.discount_amount))\
                              .filter_by(coupon_id=coupon.id).scalar() or 0
    
    unique_users = CouponUsage.query.filter_by(coupon_id=coupon.id)\
                                   .distinct(CouponUsage.user_id).count()
    
    return jsonify({
        'coupon': coupon.to_dict(include_sensitive=True),
        'usage_records': [usage.to_dict() for usage in pagination.items],
        'statistics': {
            'total_usage': coupon.current_usage,
            'unique_users': unique_users,
            'total_discount_applied': float(total_discount),
            'average_discount': float(total_discount / coupon.current_usage) if coupon.current_usage > 0 else 0
        },
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@coupons_bp.route('/stats', methods=['GET'])
@require_admin()
def get_coupon_stats():
    """
    Get overall coupon system statistics (admin only).
    
    WHY: Provides high-level metrics for business intelligence and
    promotional strategy optimization across all campaigns.
    """
    # Calculate various statistics
    total_coupons = Coupon.query.count()
    active_coupons = Coupon.query.filter_by(is_active=True).count()
    
    # Recent usage (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_usage = CouponUsage.query.filter(CouponUsage.used_at >= thirty_days_ago).count()
    
    # Total discount applied
    total_discount = db.session.query(db.func.sum(CouponUsage.discount_amount)).scalar() or 0
    
    # Most used coupons
    popular_coupons = db.session.query(
        Coupon.code, Coupon.name, Coupon.current_usage
    ).filter(Coupon.current_usage > 0)\
     .order_by(Coupon.current_usage.desc())\
     .limit(5).all()
    
    return jsonify({
        'statistics': {
            'total_coupons': total_coupons,
            'active_coupons': active_coupons,
            'recent_usage_30d': recent_usage,
            'total_discount_applied': float(total_discount),
            'popular_coupons': [
                {
                    'code': code,
                    'name': name,
                    'usage_count': usage
                } for code, name, usage in popular_coupons
            ]
        }
    }), 200