from extensions import db
from datetime import datetime
from enum import Enum
from sqlalchemy import Numeric


class OrderStatus(Enum):
    PENDING = 'PENDING'
    PAID = 'PAID'
    CANCELLED = 'CANCELLED'
    REFUNDED = 'REFUNDED'


class OrderType(Enum):
    NEW_PURCHASE = 'NEW_PURCHASE'      # Compra inicial de plan
    PLAN_UPGRADE = 'PLAN_UPGRADE'      # Upgrade de plan existente
    PLAN_RENEWAL = 'PLAN_RENEWAL'      # Renovación (futuro)
    PLAN_DOWNGRADE = 'PLAN_DOWNGRADE'  # Downgrade (futuro)


class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Tipo de orden
    order_type = db.Column(db.Enum(OrderType), default=OrderType.NEW_PURCHASE, nullable=False)

    # Para upgrades: referencia a la invitación que se está upgradeando
    upgraded_invitation_id = db.Column(db.Integer, db.ForeignKey('invitations.id'), nullable=True)

    # Para upgrades: guardar el plan original (auditoría)
    previous_plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=True)

    # Montos
    subtotal = db.Column(Numeric(10, 2), nullable=False)
    discount_amount = db.Column(Numeric(10, 2), default=0)
    total = db.Column(Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='PEN')
    
    # Coupon information
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id'))
    coupon_code = db.Column(db.String(50))  # Snapshot for historical records
    
    # Estado y fechas
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    paid_at = db.Column(db.DateTime)
    
    # Información de pago
    payment_method = db.Column(db.String(50))
    transaction_id = db.Column(db.String(200))
    payment_data = db.Column(db.JSON)
    
    # Información de facturación
    billing_name = db.Column(db.String(200))
    billing_email = db.Column(db.String(120))
    billing_phone = db.Column(db.String(20))
    billing_address = db.Column(db.Text)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic')

    # Invitaciones creadas por esta orden (compra inicial)
    invitations = db.relationship(
        'Invitation',
        foreign_keys='Invitation.order_id',
        backref='order',
        lazy='dynamic'
    )

    # Invitación que fue upgradeada (solo para órdenes tipo PLAN_UPGRADE)
    upgraded_invitation = db.relationship(
        'Invitation',
        foreign_keys=[upgraded_invitation_id],
        backref='upgrade_orders',
        lazy='select'
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.order_number:
            import time
            self.order_number = f"ORD-{int(time.time())}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'order_type': self.order_type.value if self.order_type else 'NEW_PURCHASE',
            'upgraded_invitation_id': self.upgraded_invitation_id,
            'previous_plan_id': self.previous_plan_id,
            'subtotal': float(self.subtotal),
            'discount_amount': float(self.discount_amount),
            'total': float(self.total),
            'currency': self.currency,
            'status': self.status.value,
            'coupon_code': self.coupon_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'items': [item.to_dict() for item in self.items]
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    
    # Snapshot de datos (inmutable)
    product_name = db.Column(db.String(200), nullable=False)
    product_description = db.Column(db.Text)
    unit_price = db.Column(Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    total_price = db.Column(Numeric(10, 2), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    plan = db.relationship('Plan', backref='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_name': self.product_name,
            'unit_price': float(self.unit_price),
            'quantity': self.quantity,
            'total_price': float(self.total_price)
        }


class Cart(db.Model):
    __tablename__ = 'carts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy='dynamic')
    
    def get_total(self):
        total = 0
        for item in self.items:
            total += float(item.plan.price) * item.quantity
        return total
    
    def to_dict(self):
        return {
            'id': self.id,
            'items': [item.to_dict() for item in self.items],
            'total': self.get_total(),
            'item_count': self.items.count(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    plan = db.relationship('Plan', backref='cart_items')
    
    def get_total_price(self):
        return float(self.plan.price) * self.quantity
    
    def to_dict(self):
        return {
            'id': self.id,
            'plan': self.plan.to_dict() if self.plan else None,
            'quantity': self.quantity,
            'total_price': self.get_total_price(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }