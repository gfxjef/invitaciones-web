from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.order import Order
from models.plan import Plan
from models.template import Template
from marshmallow import Schema, fields, ValidationError
from sqlalchemy.orm import joinedload

cart_bp = Blueprint('cart', __name__)


class AddToCartSchema(Schema):
    """
    Schema for validating add to cart requests.
    WHY: Ensures consistent validation following existing codebase patterns.
    """
    type = fields.Str(required=True, validate=lambda x: x in ['plan', 'template'])
    id = fields.Int(required=True, validate=lambda x: x > 0)
    quantity = fields.Int(load_default=1, validate=lambda x: x > 0)
    
    def validate_quantity_for_template(self, data, **kwargs):
        """WHY: Templates must have quantity of 1"""
        if data.get('type') == 'template' and data.get('quantity', 1) != 1:
            raise ValidationError('Templates can only have quantity of 1', 'quantity')

# In-memory cart storage (in production, use Redis or database)
user_carts = {}

def format_cart_response(user_id, cart_items):
    """
    Format cart response to match frontend expectations.
    WHY: Frontend expects cart as object with items, total_amount, item_count properties.
    """
    total_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in cart_items if item.get('price'))
    item_count = len(cart_items)

    return {
        'id': int(user_id),  # Convert to number to match frontend TypeScript types
        'items': cart_items,
        'total_amount': total_amount,
        'item_count': item_count
    }

@cart_bp.route('/items', methods=['POST'])
@jwt_required()
def add_to_cart():
    """
    Add items to user cart with proper validation.
    WHY: Templates don't have prices directly - they're associated with plans.
    For templates, we only store template info without price.
    For plans, we store plan info with price.
    Templates follow single-selection logic (replace previous template).
    """
    try:
        user_id = int(get_jwt_identity())  # 👈 Ensure int type for consistency
        print(f"🔍 DEBUG POST /cart/items - user_id: {user_id} (type: {type(user_id)})")
        
        # Use schema for validation following codebase patterns
        schema = AddToCartSchema()
        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({'errors': err.messages}), 400
        
        # Apply custom template quantity validation
        try:
            schema.validate_quantity_for_template(data)
        except ValidationError as err:
            return jsonify({'error': str(err)}), 400
            
        item_type = data['type']
        item_id = data['id'] 
        quantity = data['quantity']
            
        # Validate the item exists and get item data
        item_data = None
        if item_type == 'plan':
            item = Plan.query.filter_by(id=item_id, is_active=True).first()
            if not item:
                return jsonify({'error': 'Plan not found or inactive'}), 404
            item_data = {
                'type': item_type,
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'price': float(item.price),
                'quantity': quantity
            }
        elif item_type == 'template':
            # Load template with plan relationship for pricing
            item = Template.query.options(joinedload(Template.plan)).filter_by(id=item_id, is_active=True, is_deleted=False).first()
            if not item:
                return jsonify({'error': 'Template not found or inactive'}), 404
                
            # Get price from associated plan
            price = 0.0
            if item.plan:
                price = float(item.plan.price)
            elif item.is_premium:
                # Fallback pricing if plan is not set
                price = 49.90  # Premium template price
            else:
                price = 29.90  # Standard template price
                
            item_data = {
                'type': item_type,
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'category': item.category,
                'preview_image_url': item.preview_image_url,
                'thumbnail_url': item.thumbnail_url,
                'is_premium': item.is_premium,
                'plan_id': item.plan_id,
                'price': price,  # ✅ AHORA INCLUYE EL PRECIO
                'quantity': 1  # Templates always have quantity 1
            }
        else:
            return jsonify({'error': 'Invalid item type. Must be "plan" or "template"'}), 400
            
        # Initialize user cart if not exists
        if user_id not in user_carts:
            user_carts[user_id] = []
            
        # WHY: For templates, implement single selection (replace previous template)
        if item_type == 'template':
            # Remove any existing template from cart
            user_carts[user_id] = [
                cart_item for cart_item in user_carts[user_id] 
                if cart_item['type'] != 'template'
            ]
            # Add the new template
            user_carts[user_id].append(item_data)
        else:
            # For plans, check if item already in cart
            existing_item = None
            for cart_item in user_carts[user_id]:
                if cart_item['type'] == item_type and cart_item['id'] == item_id:
                    existing_item = cart_item
                    break
                    
            if existing_item:
                existing_item['quantity'] += quantity
            else:
                user_carts[user_id].append(item_data)
            
        # Format cart response to match frontend expectations
        formatted_cart = format_cart_response(user_id, user_carts[user_id])
        print(f"🔍 DEBUG POST /cart/items - SUCCESS - cart items count: {len(user_carts[user_id])}")
        print(f"🔍 DEBUG POST /cart/items - Cart content: {user_carts[user_id]}")

        return jsonify({
            'message': f'{item_type.title()} added to cart successfully',
            'cart': formatted_cart
        }), 200
        
    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    except Exception as e:
        # WHY: Following existing error handling patterns in the codebase
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500

@cart_bp.route('/items', methods=['GET'])
@jwt_required()
def get_cart():
    """
    Get user's cart items with proper data structure.
    WHY: Returns cart items with calculated totals and proper validation.
    """
    try:
        user_id = int(get_jwt_identity())  # 👈 Ensure int type for consistency
        print(f"🔍 DEBUG GET /cart/items - user_id: {user_id} (type: {type(user_id)})")
        cart = user_carts.get(user_id, [])
        print(f"🔍 DEBUG GET /cart/items - cart items count: {len(cart)}")
        print(f"🔍 DEBUG GET /cart/items - user_carts keys: {list(user_carts.keys())}")
        print(f"🔍 DEBUG GET /cart/items - Cart content: {cart}")
        
        # Calculate cart totals
        total_items = len(cart)
        total_price = sum(item.get('price', 0) * item.get('quantity', 1) for item in cart if item.get('price'))
        
        # Format cart response to match frontend expectations
        formatted_cart = format_cart_response(user_id, cart)

        return jsonify({
            'cart': formatted_cart,
            'summary': {
                'total_items': total_items,
                'total_price': total_price,
                'has_template': any(item['type'] == 'template' for item in cart),
                'has_plan': any(item['type'] == 'plan' for item in cart)
            }
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving cart: {str(e)}'}), 500

@cart_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """
    Remove specific item from cart by ID and type.
    WHY: Requires both item_id and type to ensure correct item removal.
    """
    try:
        user_id = int(get_jwt_identity())  # 👈 Ensure int type for consistency
        print(f"🔍 DEBUG DELETE /cart/items/{item_id} - user_id: {user_id} (type: {type(user_id)})")
        item_type = request.args.get('type')
        print(f"🔍 DEBUG DELETE - item_type: {item_type}")
        
        if not item_type:
            return jsonify({'error': 'Item type parameter is required'}), 400
            
        if item_type not in ['plan', 'template']:
            return jsonify({'error': 'Invalid item type. Must be "plan" or "template"'}), 400
        
        if user_id in user_carts:
            print(f"🔍 DEBUG DELETE - user_carts before removal: {user_carts[user_id]}")
            original_count = len(user_carts[user_id])
            user_carts[user_id] = [
                item for item in user_carts[user_id]
                if not (item['id'] == item_id and item['type'] == item_type)
            ]
            print(f"🔍 DEBUG DELETE - user_carts after removal: {user_carts[user_id]}")

            if len(user_carts[user_id]) == original_count:
                print(f"🔍 DEBUG DELETE - ITEM NOT FOUND! Looking for id={item_id}, type={item_type}")
                return jsonify({'error': 'Item not found in cart'}), 404
            
        # Format cart response to match frontend expectations
        cart_items = user_carts.get(user_id, [])
        formatted_cart = format_cart_response(user_id, cart_items)

        return jsonify({
            'message': f'{item_type.title()} removed from cart successfully',
            'cart': formatted_cart
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error removing item from cart: {str(e)}'}), 500

@cart_bp.route('/items/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_cart_item(item_id):
    """
    Update cart item quantity by ID and type.
    WHY: Allows quantity updates while enforcing template quantity = 1 rule.
    Requires query param ?type=template|plan for proper item identification.
    """
    try:
        user_id = int(get_jwt_identity())  # 👈 Ensure int type for consistency
        item_type = request.args.get('type')
        data = request.get_json() or {}
        quantity = int(data.get('quantity', 1))

        print(f"🔍 DEBUG PATCH /cart/items/{item_id} - user_id: {user_id} (type: {type(user_id)})")
        print(f"🔍 DEBUG PATCH - item_type: {item_type}, quantity: {quantity}")

        if not item_type:
            return jsonify({'error': 'Item type parameter is required'}), 400

        if item_type not in ['plan', 'template']:
            return jsonify({'error': 'Invalid item type. Must be "plan" or "template"'}), 400

        if quantity < 1:
            return jsonify({'error': 'Quantity must be greater than 0'}), 400

        if user_id not in user_carts:
            return jsonify({'error': 'Cart not found'}), 404

        # Find and update the item
        item_found = False
        for cart_item in user_carts[user_id]:
            if cart_item['id'] == item_id and cart_item['type'] == item_type:
                if item_type == 'template':
                    # Templates always have quantity 1
                    cart_item['quantity'] = 1
                else:
                    cart_item['quantity'] = quantity
                item_found = True
                break

        if not item_found:
            return jsonify({'error': 'Item not found in cart'}), 404

        # Format cart response to match frontend expectations
        formatted_cart = format_cart_response(user_id, user_carts[user_id])

        return jsonify({
            'message': f'{item_type.title()} quantity updated successfully',
            'cart': formatted_cart
        }), 200

    except ValueError:
        return jsonify({'error': 'Invalid quantity value'}), 400
    except Exception as e:
        return jsonify({'message': f'Error updating cart item: {str(e)}'}), 500

@cart_bp.route('/clear', methods=['POST'])
@jwt_required()
def clear_cart():
    """
    Clear all items from user's cart.
    WHY: Provides complete cart reset functionality.
    """
    try:
        user_id = int(get_jwt_identity())  # 👈 Ensure int type for consistency
        user_carts[user_id] = []

        # Format cart response to match frontend expectations
        formatted_cart = format_cart_response(user_id, [])

        return jsonify({
            'message': 'Cart cleared successfully',
            'cart': formatted_cart
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error clearing cart: {str(e)}'}), 500