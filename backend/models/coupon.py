from extensions import db
from datetime import datetime
from enum import Enum
from sqlalchemy import Numeric
import string
import random


class CouponType(Enum):
    """
    Enumeration for coupon discount types.
    
    WHY: Provides type safety and clear validation for coupon types,
    ensuring only valid discount types are used in the system.
    """
    PERCENTAGE = 'PERCENTAGE'  # Percentage discount (e.g., 10% off)
    FIXED_AMOUNT = 'FIXED_AMOUNT'  # Fixed amount discount (e.g., $50 off)


class Coupon(db.Model):
    """
    Coupon model for managing discount codes and promotional offers.
    
    WHY: Centralized coupon management with comprehensive validation rules,
    usage tracking, and flexible discount options for business growth.
    
    HOW: Uses enums for type safety, validates date ranges and usage limits,
    integrates with Order model for discount application tracking.
    """
    __tablename__ = 'coupons'
    
    # Primary identifiers
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    
    # Basic coupon information
    name = db.Column(db.String(200), nullable=False)  # Display name for admin
    description = db.Column(db.Text)  # Description for customers
    
    # Discount configuration
    type = db.Column(db.Enum(CouponType), nullable=False)
    value = db.Column(Numeric(10, 2), nullable=False)  # Percentage (0-100) or fixed amount
    
    # Validity period
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=False)
    
    # Usage limitations
    usage_limit = db.Column(db.Integer)  # Total usage limit (NULL = unlimited)
    usage_limit_per_user = db.Column(db.Integer, default=1)  # Per-user usage limit
    current_usage = db.Column(db.Integer, default=0, nullable=False)  # Current usage count
    
    # Order restrictions
    minimum_order_amount = db.Column(Numeric(10, 2), default=0)  # Minimum order value required
    maximum_discount_amount = db.Column(Numeric(10, 2))  # Maximum discount cap (for percentage types)
    
    # Status and metadata
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Admin who created it
    
    # Relationships
    orders = db.relationship('Order', backref='coupon', lazy='dynamic')
    usage_records = db.relationship('CouponUsage', backref='coupon', lazy='dynamic', cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        """
        Initialize coupon with auto-generated code if not provided.
        
        WHY: Ensures unique codes are generated automatically while allowing
        manual code specification for custom promotional campaigns.
        """
        super().__init__(**kwargs)
        if not self.code:
            self.code = self._generate_unique_code()
    
    @staticmethod
    def _generate_unique_code(length=8):
        """
        Generate a unique coupon code.
        
        WHY: Creates user-friendly alphanumeric codes that are easy to share
        while avoiding confusion with similar-looking characters.
        
        HOW: Uses uppercase letters and numbers, excludes ambiguous characters
        like 0, O, I, 1 to reduce user input errors.
        """
        # Exclude ambiguous characters: 0, O, I, 1
        characters = string.ascii_uppercase.replace('O', '').replace('I', '') + '23456789'
        
        # Generate code and ensure uniqueness
        while True:
            code = ''.join(random.choices(characters, k=length))
            if not Coupon.query.filter_by(code=code).first():
                return code
    
    def is_valid(self, user_id=None, order_amount=None):
        """
        Check if coupon is valid for use.
        
        Args:
            user_id (int): ID of user attempting to use coupon
            order_amount (float): Total order amount to validate against
            
        Returns:
            tuple: (is_valid: bool, error_message: str or None)
            
        WHY: Centralized validation logic ensures consistent coupon rules
        across all endpoints and prevents invalid discount applications.
        """
        now = datetime.utcnow()
        
        # Check if coupon is active
        if not self.is_active:
            return False, "Este cupón no está disponible"
        
        # Check date validity
        if now < self.start_date:
            return False, "Este cupón aún no está disponible"
        
        if now > self.end_date:
            return False, "Este cupón ha expirado"
        
        # Check total usage limit
        if self.usage_limit and self.current_usage >= self.usage_limit:
            return False, "Este cupón ha alcanzado su límite de uso"
        
        # Check per-user usage limit if user_id provided
        if user_id and self.usage_limit_per_user:
            user_usage = CouponUsage.query.filter_by(
                coupon_id=self.id, 
                user_id=user_id
            ).count()
            
            if user_usage >= self.usage_limit_per_user:
                return False, "Ya has utilizado este cupón el máximo número de veces"
        
        # Check minimum order amount if order_amount provided
        if order_amount is not None and order_amount < float(self.minimum_order_amount):
            return False, f"El monto mínimo de pedido para este cupón es ${self.minimum_order_amount:.2f}"
        
        return True, None
    
    def calculate_discount(self, order_amount):
        """
        Calculate discount amount for given order total.
        
        Args:
            order_amount (float): Order subtotal amount
            
        Returns:
            float: Discount amount to apply
            
        WHY: Centralized discount calculation ensures consistent logic
        and handles percentage vs fixed amount types properly.
        """
        order_amount = float(order_amount)
        
        if self.type == CouponType.PERCENTAGE:
            # Calculate percentage discount
            discount = order_amount * (float(self.value) / 100)
            
            # Apply maximum discount cap if specified
            if self.maximum_discount_amount:
                discount = min(discount, float(self.maximum_discount_amount))
                
            return discount
        
        elif self.type == CouponType.FIXED_AMOUNT:
            # Fixed amount discount (cannot exceed order total)
            return min(float(self.value), order_amount)
        
        return 0.0
    
    def apply_usage(self, user_id, order_id):
        """
        Record coupon usage and increment counters.
        
        Args:
            user_id (int): ID of user who used the coupon
            order_id (int): ID of order where coupon was applied
            
        WHY: Tracks coupon usage for analytics, fraud prevention,
        and enforcing usage limits per user and globally.
        """
        # Increment usage counter
        self.current_usage += 1
        
        # Create usage record
        usage = CouponUsage(
            coupon_id=self.id,
            user_id=user_id,
            order_id=order_id,
            discount_amount=0  # This will be set by the caller
        )
        
        db.session.add(usage)
        return usage
    
    def to_dict(self, include_sensitive=False):
        """
        Convert coupon to dictionary representation.
        
        Args:
            include_sensitive (bool): Whether to include sensitive admin fields
            
        WHY: Flexible serialization for different contexts - public endpoints
        show limited info while admin endpoints show full details.
        """
        base_dict = {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'type': self.type.value,
            'value': float(self.value),
            'minimum_order_amount': float(self.minimum_order_amount),
            'is_active': self.is_active
        }
        
        if include_sensitive:
            base_dict.update({
                'start_date': self.start_date.isoformat() if self.start_date else None,
                'end_date': self.end_date.isoformat() if self.end_date else None,
                'usage_limit': self.usage_limit,
                'usage_limit_per_user': self.usage_limit_per_user,
                'current_usage': self.current_usage,
                'maximum_discount_amount': float(self.maximum_discount_amount) if self.maximum_discount_amount else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            })
        
        return base_dict
    
    def to_public_dict(self):
        """
        Get public-safe dictionary representation for customer-facing endpoints.
        
        WHY: Prevents exposure of sensitive business data like usage limits
        and creation dates while providing necessary validation info.
        """
        return {
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'type': self.type.value,
            'value': float(self.value),
            'minimum_order_amount': float(self.minimum_order_amount),
            'maximum_discount_amount': float(self.maximum_discount_amount) if self.maximum_discount_amount else None
        }


class CouponUsage(db.Model):
    """
    Tracks individual coupon usage instances for analytics and limits enforcement.
    
    WHY: Enables per-user usage limits, fraud detection, analytics reporting,
    and audit trails for coupon system.
    
    HOW: Records each coupon application with user, order, timestamp, and
    discount amount for comprehensive tracking.
    """
    __tablename__ = 'coupon_usage'
    
    id = db.Column(db.Integer, primary_key=True)
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    
    # Usage details
    discount_amount = db.Column(Numeric(10, 2), nullable=False)
    used_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User')
    order = db.relationship('Order')
    
    def to_dict(self):
        """Convert usage record to dictionary representation."""
        return {
            'id': self.id,
            'coupon_code': self.coupon.code if self.coupon else None,
            'user_id': self.user_id,
            'order_id': self.order_id,
            'discount_amount': float(self.discount_amount),
            'used_at': self.used_at.isoformat() if self.used_at else None
        }