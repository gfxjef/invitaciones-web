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
import base64
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
            'hash_key': os.getenv('IZIPAY_HASH_KEY'),  # Para validar webhooks
            'username': os.getenv('IZIPAY_USERNAME', os.getenv('IZIPAY_MERCHANT_CODE')),  # Fallback al merchant_code
            'password': os.getenv('IZIPAY_PASSWORD', os.getenv('IZIPAY_SECRET_KEY')),  # Fallback al secret_key
            'mode': os.getenv('IZIPAY_MODE', 'SANDBOX'),
            'api_url': os.getenv('IZIPAY_API_BASE', 'https://api.micuentaweb.pe/api-payment/V4'),
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
    
    def _get_basic_auth(self):
        """Genera la autenticación Basic para Izipay usando username:password"""
        auth_string = f"{self.config['username']}:{self.config['password']}"
        return base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
    
    def create_payment_token(self, transaction_id, order_data):
        """
        Crea un token de pago en Izipay según la documentación oficial.
        
        Args:
            transaction_id: ID único de la transacción
            order_data: Datos de la orden (amount, currency, etc.)
        
        Returns:
            dict: Respuesta de Izipay con el token
            
        WHY: La tokenización es requerida por Izipay antes de mostrar el checkout.
        """
        # Estructura para generar form token según documentación Izipay
        token_payload = {
            'amount': int(float(order_data['amount']) * 100),  # En centavos (soles a centavos)
            'currency': 'PEN',  # Código de moneda
            'orderId': order_data['order_number'],
            'customer': {
                'email': order_data.get('customer_email', 'test@example.com'),
                'reference': order_data.get('customer_id', '')
            },
            'ctxMode': 'TEST',  # TEST para sandbox, PRODUCTION para producción
            'formAction': 'PAYMENT'  # Flujo estándar de pago
        }
        
        # Headers según documentación Izipay
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {self._get_basic_auth()}',
        }
        
        try:
            # Endpoint correcto para generar form token en Izipay
            url = f"{self.config['api_url']}/Charge/CreatePayment"
            logger.info(f"Creating payment token for order {order_data['order_number']}")
            logger.info(f"Request URL: {url}")
            logger.info(f"Request payload: {token_payload}")
            logger.info(f"Request headers: {headers}")
            
            response = requests.post(
                url,
                json=token_payload,
                headers=headers,
                timeout=30
            )
            
            logger.info(f"Response status: {response.status_code}")
            logger.info(f"Response body: {response.text[:500]}")
            
            if response.status_code != 200:
                return {
                    'success': False,
                    'error': f'Izipay API error: {response.status_code} - {response.text}',
                    'transaction_id': transaction_id
                }
            
            result = response.json()
            
            # Extraer el formToken de la respuesta
            answer = result.get('answer', {})
            form_token = answer.get('formToken')
            if not form_token:
                logger.error(f"No formToken in response. Full response: {result}")
                return {
                    'success': False,
                    'error': f'No formToken received from Izipay. Response: {result}',
                    'transaction_id': transaction_id
                }
            
            logger.info(f"Token created successfully for order {order_data['order_number']}")
            return {
                'success': True,
                'data': result,
                'token': form_token,
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
        billing_info = data.get('billing_info', {})
        order_data = {
            'order_number': order.order_number,
            'amount': float(order.total),
            'currency': order.currency,
            'customer_email': billing_info.get('email', order.user.email if hasattr(order, 'user') else ''),
            'customer_id': str(order.user_id) if order.user_id else ''
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
        return jsonify({
            'success': True,
            'token': result['token'],  # formToken desde Izipay
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
    
    Webhook actualizado para recibir notificaciones de Izipay con estructura actual.
    Usa payloadHttp + signature (Base64 HMAC-SHA-256).
    
    Estructura esperada:
    {
        "payloadHttp": "{\"response\":{\"order\":[{...}]}}",
        "signature": "Base64SignatureHMAC"
    }
    """
    try:
        # Obtener el body completo
        body = request.get_json(force=True, silent=True) or {}
        
        # IPN trae 'payloadHttp' y 'signature' en el body (y a veces 'Signature' en header)
        payload_http = body.get('payloadHttp', '')
        signature = body.get('signature') or request.headers.get('Signature', '')
        
        logger.info(f"Webhook received - Has payloadHttp: {bool(payload_http)}, Has signature: {bool(signature)}")
        
        if not payload_http or not signature:
            logger.warning("Missing payloadHttp or signature in webhook")
            return jsonify({'ok': False, 'error': 'missing_fields'}), 400
        
        # Verificar la firma usando HMAC-SHA-256 con la hash_key
        hash_key = os.getenv('IZIPAY_HASH_KEY', '').encode('utf-8')
        if not hash_key:
            logger.error("IZIPAY_HASH_KEY not configured")
            return jsonify({'ok': False, 'error': 'server_config_error'}), 500
        
        # Calcular la firma esperada
        mac = hmac.new(hash_key, payload_http.encode('utf-8'), hashlib.sha256).digest()
        expected_signature = base64.b64encode(mac).decode('utf-8')
        
        # Comparar firmas de forma segura
        if not hmac.compare_digest(expected_signature, signature):
            logger.warning(f"Invalid signature: expected={expected_signature[:20]}... got={signature[:20]}...")
            return jsonify({'ok': False, 'error': 'invalid_signature'}), 400
        
        # Parsear el payload original (texto JSON dentro de payloadHttp)
        try:
            original = json.loads(payload_http)
        except Exception as e:
            logger.error(f"Error parsing payloadHttp: {str(e)}")
            return jsonify({'ok': False, 'error': 'invalid_payload'}), 400
        
        # Extraer información del pedido según estructura de Izipay
        # La estructura puede variar, aquí los campos más comunes
        response = original.get('response', {})
        orders = response.get('order', [])
        
        if orders and len(orders) > 0:
            order_data = orders[0]
        else:
            # Fallback para otras estructuras posibles
            order_data = response
        
        # Extraer campos relevantes
        order_number = order_data.get('orderNumber') or order_data.get('orderId')
        state_message = order_data.get('stateMessage') or order_data.get('status')
        transaction_id = order_data.get('transactionId') or order_data.get('uuid')
        amount = order_data.get('amount')
        currency = order_data.get('currency')
        
        logger.info(f"Webhook data - Order: {order_number}, Status: {state_message}, Transaction: {transaction_id}")
        
        if not order_number:
            logger.warning("No order number in webhook data")
            return jsonify({'ok': True, 'warning': 'no_order_number'}), 200
        
        # Buscar la orden en la base de datos
        order = Order.query.filter(
            (Order.order_number == order_number) |
            (Order.transaction_id == transaction_id)
        ).first()
        
        if not order:
            logger.warning(f"Order not found for webhook: {order_number}")
            # Retornar 200 para evitar reintentos de Izipay
            return jsonify({'ok': True, 'warning': 'order_not_found'}), 200
        
        # Actualizar el estado del pedido según el mensaje de estado
        state_lower = (state_message or '').lower()
        
        if 'paid' in state_lower or 'authorized' in state_lower or 'captured' in state_lower:
            if order.status != OrderStatus.PAID:
                order.status = OrderStatus.PAID
                order.paid_at = datetime.utcnow()
                order.payment_method = 'IZIPAY'
                
                # Guardar toda la información del webhook
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_confirmation': original,
                    'webhook_received_at': datetime.utcnow().isoformat(),
                    'transaction_id': transaction_id,
                    'state_message': state_message
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed payment for order {order.order_number}")
        
        elif 'refused' in state_lower or 'failed' in state_lower or 'error' in state_lower:
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.FAILED
                
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_failure': original,
                    'webhook_received_at': datetime.utcnow().isoformat(),
                    'failure_reason': state_message
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed payment failure for order {order.order_number}")
        
        elif 'cancelled' in state_lower or 'canceled' in state_lower:
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.CANCELLED
                
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_cancellation': original,
                    'webhook_received_at': datetime.utcnow().isoformat()
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed cancellation for order {order.order_number}")
        
        elif 'refunded' in state_lower:
            order.status = OrderStatus.REFUNDED
            
            current_payment_data = order.payment_data or {}
            current_payment_data.update({
                'webhook_refund': original,
                'webhook_received_at': datetime.utcnow().isoformat()
            })
            order.payment_data = current_payment_data
            
            logger.info(f"Webhook confirmed refund for order {order.order_number}")
        
        else:
            # Estado no reconocido, guardar de todos modos
            current_payment_data = order.payment_data or {}
            current_payment_data.update({
                'webhook_unknown': original,
                'webhook_received_at': datetime.utcnow().isoformat(),
                'unknown_state': state_message
            })
            order.payment_data = current_payment_data
            
            logger.warning(f"Unknown payment state for order {order.order_number}: {state_message}")
        
        # Guardar cambios
        db.session.commit()
        
        return jsonify({'ok': True}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
        # Retornar 200 para evitar reintentos innecesarios
        return jsonify({'ok': True, 'error': 'internal_error'}), 200


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


@payments_bp.route('/izipay/status/<order_number>', methods=['GET'])
def get_izipay_payment_status(order_number):
    """
    GET /api/payments/izipay/status/<order_number>
    
    Endpoint público para consultar el estado de un pago por número de orden.
    Usado por la página de retorno de Izipay para verificar el estado actualizado.
    
    Returns:
        {
            "success": true,
            "order": {
                "order_number": "ORD-20240109-001",
                "status": "paid",
                "payment_method": "IZIPAY",
                "total": 150.00,
                "transaction_id": "abc123",
                "paid_at": "2024-01-09T10:30:00Z"
            }
        }
    """
    try:
        # Buscar la orden por número
        order = Order.query.filter_by(order_number=order_number).first()
        
        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        # Extraer información relevante del payment_data si existe
        payment_info = {}
        if order.payment_data:
            if 'webhook_confirmation' in order.payment_data:
                webhook_data = order.payment_data['webhook_confirmation']
                if 'response' in webhook_data:
                    response = webhook_data['response']
                    if 'order' in response and len(response['order']) > 0:
                        izipay_order = response['order'][0]
                        payment_info['state_message'] = izipay_order.get('stateMessage')
                        payment_info['transaction_uuid'] = izipay_order.get('uuid')
        
        return jsonify({
            'success': True,
            'order': {
                'order_number': order.order_number,
                'status': order.status.value,
                'payment_method': order.payment_method,
                'total': float(order.total),
                'transaction_id': order.transaction_id,
                'paid_at': order.paid_at.isoformat() if order.paid_at else None,
                'created_at': order.created_at.isoformat() if order.created_at else None,
                'payment_info': payment_info
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting Izipay payment status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
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