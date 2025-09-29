"""
Orders API - Manejo completo de órdenes y carrito de compras

Este módulo maneja la creación de órdenes, gestión del carrito y 
la integración con el sistema de pagos Izipay.

WHY: Las órdenes son el núcleo del e-commerce, necesitan integración completa
con pagos, inventario y facturación.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.order import Order, OrderItem, OrderStatus, Cart, CartItem
from models.plan import Plan
from models.user import User
from models.coupon import Coupon, CouponUsage
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_orders():
    """
    GET /api/orders/
    
    Obtiene todas las órdenes del usuario actual.
    
    Returns:
        {
            "orders": [
                {
                    "id": 1,
                    "order_number": "ORD-1234567890",
                    "total": 99.99,
                    "status": "PAID",
                    "created_at": "2024-01-15T10:30:00",
                    "items": [...]
                }
            ]
        }
    """
    current_user_id = get_jwt_identity()
    
    try:
        orders = Order.query.filter_by(user_id=current_user_id)\
                           .order_by(Order.created_at.desc())\
                           .all()
        
        return jsonify({
            'success': True,
            'orders': [order.to_dict() for order in orders]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user orders: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    """
    POST /api/orders/
    
    Crea una nueva orden desde el carrito del usuario con opción de aplicar cupón y billing info.
    
    Body (optional):
        {
            "coupon_code": "SAVE10",
            "billing_address": {
                "first_name": "Juan",
                "last_name": "Pérez",
                "email": "juan@example.com",
                "phone": "987654321",
                "address": "Av. Lima 123",
                "city": "Lima",
                "state": "Lima",
                "country": "PE",
                "zip_code": "15001",
                "document_type": "DNI",
                "document_number": "12345678",
                "business_name": "Empresa SAC"
            }
        }
    
    Returns:
        {
            "success": true,
            "order": {
                "id": 123,
                "order_number": "ORD-1234567890",
                "subtotal": 100.00,
                "discount_amount": 10.00,
                "total": 90.00,
                "coupon_code": "SAVE10",
                "status": "PENDING"
            }
        }
        
    WHY: Convierte el carrito temporal en una orden persistente para pago,
    integrando el sistema de cupones para aplicar descuentos y billing info.
    """
    current_user_id = int(get_jwt_identity())  # Convert to int for consistency with cart.py
    data = request.get_json() or {}
    
    try:
        logger.info(f"Creating order for user {current_user_id} with data: {data}")
        
        # WHY: Use the new cart API system that stores carts in memory
        # Import the cart system to get user's cart
        from api.cart import user_carts
        
        # Get user's cart from the cart API system
        logger.info(f"DEBUG: current_user_id type: {type(current_user_id)}, value: {current_user_id}")
        logger.info(f"DEBUG: user_carts keys: {list(user_carts.keys()) if user_carts else 'empty'}")
        cart_items = user_carts.get(current_user_id, [])
        logger.info(f"Cart items found: {len(cart_items)} items")
        
        if not cart_items:
            logger.warning(f"Cart is empty for user {current_user_id}")
            return jsonify({
                'success': False,
                'error': 'Cart is empty'
            }), 400
        
        # Calculate subtotal from cart items
        subtotal = sum(item.get('price', 0) * item.get('quantity', 1) for item in cart_items)
        logger.info(f"Calculated subtotal: {subtotal}")
        
        discount_amount = 0
        coupon = None
        coupon_code = None
        
        # Process coupon if provided
        if data.get('coupon_code'):
            logger.info(f"Processing coupon: {data.get('coupon_code')}")
            coupon_code = data['coupon_code'].upper().strip()
            coupon = Coupon.query.filter_by(code=coupon_code).first()
            
            if not coupon:
                return jsonify({
                    'success': False,
                    'error': 'Cupón no encontrado'
                }), 400
            
            # Validate coupon
            is_valid, error_message = coupon.is_valid(current_user_id, subtotal)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': error_message
                }), 400
            
            # Calculate discount
            discount_amount = coupon.calculate_discount(subtotal)
        
        # Calculate final total
        total = subtotal - discount_amount
        
        # Extract billing address from data
        billing_address = data.get('billing_address', {})
        logger.info(f"Creating order with total: {total}, billing: {billing_address.get('first_name', '')} {billing_address.get('last_name', '')}")
        
        # Create new order with billing information
        order = Order(
            user_id=current_user_id,
            subtotal=subtotal,
            discount_amount=discount_amount,
            total=total,
            currency='PEN',
            status=OrderStatus.PENDING,
            coupon_id=coupon.id if coupon else None,
            coupon_code=coupon_code,
            # Store billing information
            billing_name=f"{billing_address.get('first_name', '')} {billing_address.get('last_name', '')}".strip(),
            billing_email=billing_address.get('email'),
            billing_phone=billing_address.get('phone'),
            billing_address=billing_address.get('address', '')
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items from cart items
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                plan_id=cart_item.get('plan_id'),  # May be None for templates
                product_name=cart_item.get('name', ''),
                product_description=cart_item.get('description', ''),
                unit_price=cart_item.get('price', 0),
                quantity=cart_item.get('quantity', 1),
                total_price=cart_item.get('price', 0) * cart_item.get('quantity', 1)
            )
            db.session.add(order_item)
        
        # Apply coupon usage if coupon was used
        if coupon:
            usage_record = coupon.apply_usage(current_user_id, order.id)
            usage_record.discount_amount = discount_amount
            db.session.add(usage_record)
        
        # Clear cart after creating order (use new cart system)
        if current_user_id in user_carts:
            user_carts[current_user_id] = []
        
        db.session.commit()
        
        logger.info(f"Order {order.order_number} created for user {current_user_id} with discount ${discount_amount}")
        
        return jsonify({
            'success': True,
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating order: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error creating order: {str(e)}'
        }), 400


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """
    GET /api/orders/<order_id>
    
    Obtiene los detalles de una orden específica por ID.
    """
    current_user_id = get_jwt_identity()
    
    try:
        order = Order.query.filter_by(
            id=order_id,
            user_id=current_user_id
        ).first()
        
        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        return jsonify({
            'success': True,
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting order: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/number/<string:order_number>', methods=['GET'])
@jwt_required()
def get_order_by_number(order_number):
    """
    GET /api/orders/number/<order_number>
    
    Obtiene los detalles de una orden específica por número de orden.
    """
    current_user_id = get_jwt_identity()
    
    try:
        order = Order.query.filter_by(
            order_number=order_number,
            user_id=current_user_id
        ).first()
        
        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        return jsonify({
            'success': True,
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting order by number: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    """
    GET /api/orders/cart
    
    Obtiene el carrito actual del usuario.
    """
    current_user_id = get_jwt_identity()
    
    try:
        cart = Cart.query.filter_by(user_id=current_user_id).first()
        
        if not cart:
            # Create empty cart if doesn't exist
            cart = Cart(user_id=current_user_id)
            db.session.add(cart)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'cart': cart.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting cart: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """
    POST /api/orders/cart/add
    
    Agrega un item al carrito.
    
    Body:
        {
            "plan_id": 1,
            "quantity": 2
        }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('plan_id'):
        return jsonify({
            'success': False,
            'error': 'plan_id is required'
        }), 400
    
    try:
        # Verify plan exists
        plan = Plan.query.get(data['plan_id'])
        if not plan:
            return jsonify({
                'success': False,
                'error': 'Plan not found'
            }), 404
        
        # Get or create cart
        cart = Cart.query.filter_by(user_id=current_user_id).first()
        if not cart:
            cart = Cart(user_id=current_user_id)
            db.session.add(cart)
            db.session.flush()
        
        # Check if item already in cart
        existing_item = CartItem.query.filter_by(
            cart_id=cart.id,
            plan_id=data['plan_id']
        ).first()
        
        quantity = int(data.get('quantity', 1))
        
        if existing_item:
            # Update quantity
            existing_item.quantity += quantity
            existing_item.updated_at = datetime.utcnow()
        else:
            # Add new item
            cart_item = CartItem(
                cart_id=cart.id,
                plan_id=data['plan_id'],
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        # Refresh cart to get updated data
        db.session.refresh(cart)
        
        return jsonify({
            'success': True,
            'message': 'Item added to cart',
            'cart': cart.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding to cart: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/cart/remove', methods=['POST'])
@jwt_required()
def remove_from_cart():
    """
    POST /api/orders/cart/remove
    
    Remueve un item del carrito.
    
    Body:
        {
            "plan_id": 1
        }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('plan_id'):
        return jsonify({
            'success': False,
            'error': 'plan_id is required'
        }), 400
    
    try:
        cart = Cart.query.filter_by(user_id=current_user_id).first()
        if not cart:
            return jsonify({
                'success': False,
                'error': 'Cart not found'
            }), 404
        
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            plan_id=data['plan_id']
        ).first()
        
        if not cart_item:
            return jsonify({
                'success': False,
                'error': 'Item not found in cart'
            }), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        # Refresh cart to get updated data
        db.session.refresh(cart)
        
        return jsonify({
            'success': True,
            'message': 'Item removed from cart',
            'cart': cart.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error removing from cart: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/cart/update', methods=['POST'])
@jwt_required()
def update_cart_item():
    """
    POST /api/orders/cart/update
    
    Actualiza la cantidad de un item en el carrito.
    
    Body:
        {
            "plan_id": 1,
            "quantity": 3
        }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('plan_id') or not data.get('quantity'):
        return jsonify({
            'success': False,
            'error': 'plan_id and quantity are required'
        }), 400
    
    try:
        quantity = int(data['quantity'])
        if quantity <= 0:
            return jsonify({
                'success': False,
                'error': 'Quantity must be positive'
            }), 400
        
        cart = Cart.query.filter_by(user_id=current_user_id).first()
        if not cart:
            return jsonify({
                'success': False,
                'error': 'Cart not found'
            }), 404
        
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            plan_id=data['plan_id']
        ).first()
        
        if not cart_item:
            return jsonify({
                'success': False,
                'error': 'Item not found in cart'
            }), 404
        
        cart_item.quantity = quantity
        cart_item.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Refresh cart to get updated data
        db.session.refresh(cart)
        
        return jsonify({
            'success': True,
            'message': 'Cart item updated',
            'cart': cart.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating cart item: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/cart/clear', methods=['POST'])
@jwt_required()
def clear_cart():
    """
    POST /api/orders/cart/clear
    
    Vacía completamente el carrito del usuario.
    """
    current_user_id = get_jwt_identity()
    
    try:
        cart = Cart.query.filter_by(user_id=current_user_id).first()
        if not cart:
            return jsonify({
                'success': True,
                'message': 'Cart was already empty'
            }), 200
        
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cart cleared'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error clearing cart: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@orders_bp.route('/cart/calculate', methods=['POST'])
@jwt_required()
def calculate_cart_total():
    """
    POST /api/orders/cart/calculate
    
    Calcula el total del carrito con cupón aplicado (sin crear orden).
    
    Body (optional):
        {
            "coupon_code": "SAVE10"
        }
    
    Returns:
        {
            "success": true,
            "calculation": {
                "subtotal": 100.00,
                "discount_amount": 10.00,
                "total": 90.00,
                "coupon_applied": true,
                "coupon_info": {...}
            }
        }
        
    WHY: Permite mostrar el descuento en tiempo real durante el checkout
    antes de confirmar la compra.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    try:
        # Get user's cart
        cart = Cart.query.filter_by(user_id=current_user_id).first()
        
        if not cart or cart.items.count() == 0:
            return jsonify({
                'success': False,
                'error': 'Cart is empty'
            }), 400
        
        # Calculate subtotal
        subtotal = cart.get_total()
        discount_amount = 0
        coupon_applied = False
        coupon_info = None
        
        # Process coupon if provided
        if data.get('coupon_code'):
            coupon_code = data['coupon_code'].upper().strip()
            coupon = Coupon.query.filter_by(code=coupon_code).first()
            
            if not coupon:
                return jsonify({
                    'success': False,
                    'error': 'Cupón no encontrado'
                }), 400
            
            # Validate coupon
            is_valid, error_message = coupon.is_valid(current_user_id, subtotal)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': error_message
                }), 400
            
            # Calculate discount
            discount_amount = coupon.calculate_discount(subtotal)
            coupon_applied = True
            coupon_info = coupon.to_public_dict()
        
        # Calculate final total
        total = subtotal - discount_amount
        
        return jsonify({
            'success': True,
            'calculation': {
                'subtotal': float(subtotal),
                'discount_amount': float(discount_amount),
                'total': float(total),
                'coupon_applied': coupon_applied,
                'coupon_info': coupon_info,
                'items': [item.to_dict() for item in cart.items]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error calculating cart total: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500