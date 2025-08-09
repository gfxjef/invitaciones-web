"""
Izipay Payment Integration API

Este módulo maneja la integración completa con la pasarela de pagos Izipay.
Incluye tokenización, procesamiento de pagos, webhooks y gestión de transacciones.

WHY: Izipay requiere un flujo específico de tokenización antes del procesamiento de pagos.
Se implementa siguiendo el patrón del ejemplo oficial de Izipay.
"""

from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import json
import os
import time
import hmac
import hashlib
from datetime import datetime
from extensions import db
from models.order import Order, OrderStatus
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

payments_bp = Blueprint('payments', __name__)


class IzipayConfig:
    """
    Centralizada configuración de Izipay con validación de variables de entorno.
    
    WHY: Separar la configuración facilita testing y maintainment.
    """
    
    @staticmethod
    def get_config():
        return {
            'merchant_code': os.getenv('IZIPAY_MERCHANT_CODE'),
            'public_key': os.getenv('IZIPAY_PUBLIC_KEY'),
            'secret_key': os.getenv('IZIPAY_SECRET_KEY'),
            'mode': os.getenv('IZIPAY_MODE', 'SANDBOX'),
            'api_url': os.getenv('IZIPAY_API_URL', 'https://sandbox-checkout.izipay.pe/apidemo/v1'),
            'webhook_url': os.getenv('IZIPAY_WEBHOOK_URL')
        }
    
    @staticmethod
    def validate_config():
        """Valida que todas las configuraciones críticas estén presentes"""
        config = IzipayConfig.get_config()
        required_keys = ['merchant_code', 'public_key', 'secret_key']
        
        missing_keys = [key for key in required_keys if not config.get(key)]
        if missing_keys:
            raise ValueError(f"Missing Izipay configuration: {', '.join(missing_keys)}")
        
        return config


class IzipayService:
    """
    Servicio para manejar todas las operaciones con Izipay.
    
    WHY: Encapsular la lógica de Izipay en una clase facilita testing y reutilización.
    """
    
    def __init__(self):
        self.config = IzipayConfig.validate_config()
    
    def generate_transaction_id(self):
        """
        Genera un transaction_id único basado en timestamp.
        
        WHY: Siguiendo el patrón del ejemplo de Izipay para consistencia.
        """
        current_time_unix = int(time.time() * 1000000)  # microseconds
        return str(current_time_unix)[:14]
    
    def generate_order_number(self):
        """Genera un order_number único"""
        current_time_unix = int(time.time() * 1000000)
        return str(current_time_unix)[:10]
    
    def create_payment_token(self, transaction_id, order_data):
        """
        Crea un token de pago en Izipay.
        
        Args:
            transaction_id: ID único de la transacción
            order_data: Datos de la orden (amount, currency, etc.)
        
        Returns:
            dict: Respuesta de Izipay con el token
            
        WHY: La tokenización es requerida por Izipay antes de mostrar el checkout.
        """
        token_payload = {
            'requestSource': 'ECOMMERCE',
            'merchantCode': self.config['merchant_code'],
            'orderNumber': order_data['order_number'],
            'publicKey': self.config['public_key'],
            'amount': str(int(float(order_data['amount']) * 100))  # Convert to centavos
        }
        
        headers = {
            'Content-Type': 'application/json',
            'transactionId': transaction_id
        }
        
        try:
            url = f"{self.config['api_url']}/Token/Generate"
            logger.info(f"Creating payment token for order {order_data['order_number']}")
            
            response = requests.post(
                url,
                json=token_payload,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Token created successfully for order {order_data['order_number']}")
            return {
                'success': True,
                'data': result,
                'transaction_id': transaction_id
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error creating payment token: {str(e)}")
            return {
                'success': False,
                'error': f'Payment token creation failed: {str(e)}',
                'transaction_id': transaction_id
            }
        except Exception as e:
            logger.error(f"Unexpected error creating payment token: {str(e)}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'transaction_id': transaction_id
            }
    
    def verify_webhook_signature(self, payload, signature):
        """
        Verifica la firma del webhook de Izipay.
        
        WHY: Seguridad crítica - verificar que el webhook viene realmente de Izipay.
        """
        if not signature:
            return False
            
        # Calculate expected signature using secret key
        expected_signature = hmac.new(
            self.config['secret_key'].encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)


# Initialize service
izipay_service = IzipayService()


@payments_bp.route('/create-payment-token', methods=['POST'])
@jwt_required()
def create_payment_token():
    """
    POST /api/payments/create-payment-token
    
    Crea un token de pago para una orden específica.
    
    Body:
        {
            "order_id": 123,
            "billing_info": {
                "firstName": "Juan",
                "lastName": "Pérez",
                "email": "juan@example.com",
                "phoneNumber": "987654321",
                "street": "Av. Lima 123",
                "city": "Lima",
                "state": "Lima",
                "country": "PE",
                "postalCode": "15001",
                "document": "12345678",
                "documentType": "DNI"
            }
        }
    
    Returns:
        {
            "success": true,
            "token": "payment_token_from_izipay",
            "transaction_id": "12345678901234",
            "config": {
                "merchant_code": "4001834",
                "public_key": "VErethUtraQux...",
                "mode": "SANDBOX"
            }
        }
        
    WHY: El frontend necesita el token para inicializar el checkout de Izipay.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('order_id'):
        return jsonify({
            'success': False,
            'error': 'order_id is required'
        }), 400
    
    try:
        # Get order from database
        order = Order.query.filter_by(
            id=data['order_id'],
            user_id=current_user_id
        ).first()
        
        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        if order.status != OrderStatus.PENDING:
            return jsonify({
                'success': False,
                'error': 'Order is not in PENDING status'
            }), 400
        
        # Generate transaction ID
        transaction_id = izipay_service.generate_transaction_id()
        
        # Prepare order data for Izipay
        order_data = {
            'order_number': order.order_number,
            'amount': float(order.total),
            'currency': order.currency
        }
        
        # Create payment token
        result = izipay_service.create_payment_token(transaction_id, order_data)
        
        if not result['success']:
            return jsonify(result), 500
        
        # Update order with transaction_id
        order.transaction_id = transaction_id
        
        # Update billing information if provided
        billing_info = data.get('billing_info', {})
        if billing_info:
            order.billing_name = f"{billing_info.get('firstName', '')} {billing_info.get('lastName', '')}"
            order.billing_email = billing_info.get('email')
            order.billing_phone = billing_info.get('phoneNumber')
            order.billing_address = billing_info.get('street', '')
        
        # Store payment data for reference
        order.payment_data = {
            'izipay_token_request': result['data'],
            'billing_info': billing_info,
            'created_at': datetime.utcnow().isoformat()
        }
        
        db.session.commit()
        
        # Prepare response with frontend configuration
        token_data = result['data'].get('response', {})
        
        return jsonify({
            'success': True,
            'token': token_data.get('token'),
            'transaction_id': transaction_id,
            'order_number': order.order_number,
            'config': {
                'merchant_code': izipay_service.config['merchant_code'],
                'public_key': izipay_service.config['public_key'],
                'mode': izipay_service.config['mode'],
                'amount': str(order.total),
                'currency': order.currency
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating payment token: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@payments_bp.route('/process-payment', methods=['POST'])
@jwt_required()
def process_payment():
    """
    POST /api/payments/process-payment
    
    Procesa el resultado del pago desde el checkout de Izipay.
    
    Body:
        {
            "order_id": 123,
            "payment_result": {
                "status": "SUCCESS",
                "transaction_id": "12345678901234",
                "izipay_data": {...}
            }
        }
    
    WHY: Después del checkout, necesitamos actualizar el estado de la orden.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('order_id') or not data.get('payment_result'):
        return jsonify({
            'success': False,
            'error': 'order_id and payment_result are required'
        }), 400
    
    try:
        order = Order.query.filter_by(
            id=data['order_id'],
            user_id=current_user_id
        ).first()
        
        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        payment_result = data['payment_result']
        
        # Update order based on payment result
        if payment_result.get('status') == 'SUCCESS':
            order.status = OrderStatus.PAID
            order.paid_at = datetime.utcnow()
            order.payment_method = 'IZIPAY'
            
            # Update payment data
            current_payment_data = order.payment_data or {}
            current_payment_data.update({
                'payment_result': payment_result,
                'processed_at': datetime.utcnow().isoformat()
            })
            order.payment_data = current_payment_data
            
            logger.info(f"Payment successful for order {order.order_number}")
            
        else:
            # Payment failed or was cancelled
            current_payment_data = order.payment_data or {}
            current_payment_data.update({
                'payment_result': payment_result,
                'failed_at': datetime.utcnow().isoformat()
            })
            order.payment_data = current_payment_data
            
            logger.warning(f"Payment failed for order {order.order_number}: {payment_result.get('error', 'Unknown error')}")
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'order_status': order.status.value,
            'message': 'Payment processed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error processing payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@payments_bp.route('/notificacion', methods=['POST'])
def payment_notification():
    """
    POST /api/payments/notificacion
    
    Endpoint de notificación instantánea (IPN) para Izipay.
    
    WHY: Izipay enviará notificaciones automáticas a esta URL cuando cambie
    el estado del pago. Este es el endpoint principal para confirmar pagos.
    """
    try:
        # Get raw body for signature verification
        payload = request.get_data(as_text=True)
        signature = request.headers.get('kr-hash')
        
        # Verify webhook signature
        if not izipay_service.verify_webhook_signature(payload, signature):
            logger.warning("Invalid IPN signature received")
            return jsonify({'error': 'Invalid signature'}), 403
        
        # Parse notification data
        notification_data = request.get_json()
        
        if not notification_data:
            return jsonify({'error': 'No data received'}), 400
        
        # Extract relevant information
        order_number = notification_data.get('orderNumber')
        transaction_status = notification_data.get('transactionStatus')
        transaction_id = notification_data.get('transactionId')
        
        if not all([order_number, transaction_status]):
            logger.warning("Incomplete IPN data received")
            return jsonify({'error': 'Incomplete data'}), 400
        
        # Find order by order_number or transaction_id
        order = Order.query.filter(
            (Order.order_number == order_number) |
            (Order.transaction_id == transaction_id)
        ).first()
        
        if not order:
            logger.warning(f"Order not found for IPN: {order_number}")
            return jsonify({'error': 'Order not found'}), 404
        
        # Update order status based on IPN
        if transaction_status in ['CAPTURED', 'PAID']:
            if order.status != OrderStatus.PAID:
                order.status = OrderStatus.PAID
                order.paid_at = datetime.utcnow()
                order.payment_method = 'IZIPAY'
                
                # Update payment data with IPN info
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'ipn_confirmation': notification_data,
                    'ipn_received_at': datetime.utcnow().isoformat()
                })
                order.payment_data = current_payment_data
                
                logger.info(f"IPN confirmed payment for order {order.order_number}")
        
        elif transaction_status in ['CANCELLED', 'FAILED', 'REFUSED']:
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.CANCELLED
                
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'ipn_cancellation': notification_data,
                    'ipn_received_at': datetime.utcnow().isoformat()
                })
                order.payment_data = current_payment_data
                
                logger.info(f"IPN confirmed cancellation for order {order.order_number}")
        
        elif transaction_status == 'REFUNDED':
            order.status = OrderStatus.REFUNDED
            
            current_payment_data = order.payment_data or {}
            current_payment_data.update({
                'ipn_refund': notification_data,
                'ipn_received_at': datetime.utcnow().isoformat()
            })
            order.payment_data = current_payment_data
            
            logger.info(f"IPN confirmed refund for order {order.order_number}")
        
        db.session.commit()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error processing IPN: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@payments_bp.route('/webhook', methods=['POST'])
def payment_webhook():
    """
    POST /api/payments/webhook
    
    Webhook para recibir notificaciones de Izipay sobre el estado de los pagos.
    
    WHY: Izipay enviará notificaciones asíncronas sobre cambios de estado de pago.
    Esto es crítico para confirmar pagos exitosos de forma confiable.
    """
    try:
        # Get raw body for signature verification
        payload = request.get_data(as_text=True)
        signature = request.headers.get('X-Izipay-Signature')
        
        # Verify webhook signature
        if not izipay_service.verify_webhook_signature(payload, signature):
            logger.warning("Invalid webhook signature received")
            return jsonify({'error': 'Invalid signature'}), 403
        
        # Parse webhook data
        webhook_data = request.get_json()
        
        if not webhook_data:
            return jsonify({'error': 'No data received'}), 400
        
        # Extract relevant information
        transaction_id = webhook_data.get('transactionId')
        status = webhook_data.get('status')
        order_number = webhook_data.get('orderNumber')
        
        if not all([transaction_id, status, order_number]):
            logger.warning("Incomplete webhook data received")
            return jsonify({'error': 'Incomplete data'}), 400
        
        # Find order by transaction_id or order_number
        order = Order.query.filter(
            (Order.transaction_id == transaction_id) | 
            (Order.order_number == order_number)
        ).first()
        
        if not order:
            logger.warning(f"Order not found for webhook: {order_number}")
            return jsonify({'error': 'Order not found'}), 404
        
        # Update order status based on webhook
        if status == 'PAID' or status == 'CAPTURED':
            if order.status != OrderStatus.PAID:
                order.status = OrderStatus.PAID
                order.paid_at = datetime.utcnow()
                order.payment_method = 'IZIPAY'
                
                # Update payment data with webhook info
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_confirmation': webhook_data,
                    'webhook_received_at': datetime.utcnow().isoformat()
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed payment for order {order.order_number}")
        
        elif status == 'CANCELLED' or status == 'FAILED':
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.CANCELLED
                
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_cancellation': webhook_data,
                    'webhook_received_at': datetime.utcnow().isoformat()
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed cancellation for order {order.order_number}")
        
        elif status == 'REFUNDED':
            order.status = OrderStatus.REFUNDED
            
            current_payment_data = order.payment_data or {}
            current_payment_data.update({
                'webhook_refund': webhook_data,
                'webhook_received_at': datetime.utcnow().isoformat()
            })
            order.payment_data = current_payment_data
            
            logger.info(f"Webhook confirmed refund for order {order.order_number}")
        
        db.session.commit()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@payments_bp.route('/status/<int:order_id>', methods=['GET'])
@jwt_required()
def get_payment_status(order_id):
    """
    GET /api/payments/status/<order_id>
    
    Obtiene el estado actual del pago de una orden.
    
    Returns:
        {
            "order_id": 123,
            "order_number": "ORD-1234567890",
            "status": "PAID",
            "total": 99.99,
            "currency": "PEN",
            "payment_method": "IZIPAY",
            "paid_at": "2024-01-15T10:30:00",
            "transaction_id": "12345678901234"
        }
        
    WHY: El frontend necesita verificar el estado actual de los pagos.
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
            'order_id': order.id,
            'order_number': order.order_number,
            'status': order.status.value,
            'total': float(order.total),
            'currency': order.currency,
            'payment_method': order.payment_method,
            'paid_at': order.paid_at.isoformat() if order.paid_at else None,
            'transaction_id': order.transaction_id,
            'created_at': order.created_at.isoformat() if order.created_at else None
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


@payments_bp.route('/config', methods=['GET'])
@jwt_required()
def get_payment_config():
    """
    GET /api/payments/config
    
    Obtiene la configuración pública de Izipay para el frontend.
    
    Returns:
        {
            "merchant_code": "4001834",
            "public_key": "VErethUtraQux...",
            "mode": "SANDBOX"
        }
        
    WHY: El frontend necesita la configuración pública para inicializar Izipay.
    """
    try:
        config = izipay_service.config
        
        return jsonify({
            'merchant_code': config['merchant_code'],
            'public_key': config['public_key'],
            'mode': config['mode']
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting payment config: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal error: {str(e)}'
        }), 500


# Health check específico para Izipay
@payments_bp.route('/health', methods=['GET'])
def payment_health():
    """
    GET /api/payments/health
    
    Verifica que la configuración de Izipay esté correcta.
    
    WHY: Permite verificar que la integración esté configurada correctamente.
    """
    try:
        config = IzipayConfig.validate_config()
        
        return jsonify({
            'status': 'healthy',
            'service': 'izipay-integration',
            'mode': config['mode'],
            'api_url': config['api_url']
        }), 200
        
    except ValueError as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'izipay-integration',
            'error': str(e)
        }), 503
    except Exception as e:
        return jsonify({
            'status': 'error',
            'service': 'izipay-integration',
            'error': f'Unexpected error: {str(e)}'
        }), 500