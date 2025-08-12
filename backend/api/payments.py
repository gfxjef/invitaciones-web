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
    Configuración de Izipay siguiendo documentación oficial.
    Basado en Popin-PaymentForm-Python-Flask/app.py
    """
    
    @staticmethod
    def get_config():
        return {
            'username': os.getenv('IZIPAY_USERNAME'),  # Identificador de tienda
            'password': os.getenv('IZIPAY_PASSWORD'),  # Clave de Test o Producción
            'public_key': os.getenv('IZIPAY_PUBLIC_KEY'),  # Clave Pública
            'hmac_key': os.getenv('IZIPAY_HMACSHA256'),  # Clave HMAC-SHA-256
            'api_url': 'https://api.micuentaweb.pe/api-payment/V4',  # URL oficial V4
            'mode': os.getenv('IZIPAY_MODE', 'SANDBOX')
        }
    
    @staticmethod
    def validate_config():
        """Valida configuración según estructura oficial"""
        config = IzipayConfig.get_config()
        required_keys = ['username', 'password', 'public_key', 'hmac_key']
        
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
        """Autenticación Basic según documentación oficial (app.py línea 25)"""
        auth_string = f"{self.config['username']}:{self.config['password']}"
        return base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
    
    def create_payment_token(self, order_data):
        """
        Crea formToken según estructura oficial (app.py líneas 32-51)
        
        Args:
            order_data: Datos de la orden con estructura oficial
        
        Returns:
            dict: Respuesta de Izipay con el formToken
        """
        # Estructura exacta según documentación oficial
        token_payload = {
            'amount': int(float(order_data['amount']) * 100),  # En centavos
            'currency': order_data.get('currency', 'PEN'),
            'orderId': order_data['order_number'],
            'customer': {
                'email': order_data['customer_email'],
                'billingDetails': {
                    'firstName': order_data.get('first_name', ''),
                    'lastName': order_data.get('last_name', ''),
                    'identityType': order_data.get('identity_type', 'DNI'),
                    'identityCode': order_data.get('identity_code', ''),
                    'phoneNumber': order_data.get('phone_number', ''),
                    'address': order_data.get('address', ''),
                    'country': order_data.get('country', 'PE'),
                    'state': order_data.get('state', ''),
                    'city': order_data.get('city', ''),
                    'zipCode': order_data.get('zip_code', '')
                }
            }
        }
        
        # Headers según documentación oficial (app.py líneas 117-120)
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {self._get_basic_auth()}'
        }
        
        try:
            # URL oficial según documentación
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
            
            # Formato de respuesta según documentación oficial (app.py línea 139-141)
            if result.get('status') == 'SUCCESS':
                form_token = result['answer']['formToken']
                logger.info(f"FormToken created successfully for order {order_data['order_number']}")
            else:
                logger.error(f"Failed to create formToken: {result}")
                form_token = None
            
            if not form_token:
                return {
                    'success': False,
                    'error': f'No formToken received from Izipay. Response: {result}'
                }
            
            return {
                'success': True,
                'data': result,
                'form_token': form_token
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error creating formToken: {str(e)}")
            return {
                'success': False,
                'error': f'FormToken creation failed: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Unexpected error creating formToken: {str(e)}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def verify_webhook_signature(self, payload, signature):
        """
        Verifica la firma del webhook usando HMAC-SHA-256.
        
        WHY: Seguridad crítica - verificar que el webhook viene realmente de Izipay.
        Usa la clave HMAC-SHA-256 oficial para validar kr-hash.
        """
        if not signature:
            return False
            
        # Calcular firma esperada usando clave HMAC-SHA-256 oficial


def checkHash(response, key):
    """
    Función oficial de Izipay para validar kr-hash.
    
    Según documentación repostiroio-izipay/Popin-PaymentForm-Python-Flask/app.py líneas 102-105
    """
    try:
        answer = response['kr-answer'].encode('utf-8')
        calculate_hash = hmac.new(key.encode('utf-8'), answer, hashlib.sha256).hexdigest()
        return calculate_hash == response['kr-hash']
    except Exception as e:
        logger.error(f"Error in checkHash: {str(e)}")
        return False


# Initialize service
izipay_service = IzipayService()


@payments_bp.route('/formtoken', methods=['POST'])
@jwt_required()
def create_formtoken():
    """
    POST /api/payments/formtoken
    
    Crea un formToken para una orden específica según documentación oficial.
    
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
        
        # Preparar datos según estructura oficial (app.py líneas 32-51)
        billing_info = data.get('billing_info', {})
        order_data = {
            'order_number': order.order_number,
            'amount': float(order.total),
            'currency': order.currency,
            'customer_email': billing_info.get('email', order.user.email if hasattr(order, 'user') else ''),
            'first_name': billing_info.get('firstName', ''),
            'last_name': billing_info.get('lastName', ''),
            'identity_type': billing_info.get('documentType', 'DNI').upper(),
            'identity_code': billing_info.get('document', ''),
            'phone_number': billing_info.get('phoneNumber', ''),
            'address': billing_info.get('street', ''),
            'country': billing_info.get('country', 'PE'),
            'state': billing_info.get('state', ''),
            'city': billing_info.get('city', ''),
            'zip_code': billing_info.get('postalCode', '')
        }
        
        # Crear formToken
        result = izipay_service.create_payment_token(order_data)
        
        if not result['success']:
            return jsonify(result), 500
        
        # Actualizar orden
        order.transaction_id = order.order_number
        
        # Update billing information if provided
        billing_info = data.get('billing_info', {})
        if billing_info:
            order.billing_name = f"{billing_info.get('firstName', '')} {billing_info.get('lastName', '')}"
            order.billing_email = billing_info.get('email')
            order.billing_phone = billing_info.get('phoneNumber')
            order.billing_address = billing_info.get('street', '')
        
        # Guardar datos de pago
        order.payment_data = {
            'formtoken_request': result['data'],
            'billing_info': billing_info,
            'created_at': datetime.utcnow().isoformat()
        }
        
        db.session.commit()
        
        # Respuesta según documentación oficial
        return jsonify({
            'success': True,
            'formToken': result['form_token'],
            'publicKey': izipay_service.config['public_key'],
            'order_number': order.order_number
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
    
    Webhook IPN oficial de Izipay según documentación repostiroio-izipay.
    Usa kr-answer + kr-hash con HMAC-SHA-256 y clave IZIPAY_HMACSHA256.
    
    Estructura esperada según app.py líneas 82-99:
    Form data:
    - kr-answer: JSON string con detalles del pago
    - kr-hash: HMAC-SHA-256 signature
    """
    try:
        # Validar que tenemos form data (no JSON)
        if not request.form:
            logger.warning("No form data received in webhook")
            return jsonify({'error': 'No form data received'}), 400
        
        # Obtener kr-answer y kr-hash del form
        kr_answer = request.form.get('kr-answer')
        kr_hash = request.form.get('kr-hash')
        
        logger.info(f"Webhook received - Has kr-answer: {bool(kr_answer)}, Has kr-hash: {bool(kr_hash)}")
        
        if not kr_answer or not kr_hash:
            logger.warning("Missing kr-answer or kr-hash in webhook")
            return jsonify({'error': 'Missing kr-answer or kr-hash'}), 400
        
        # Validar firma usando checkHash según documentación oficial
        if not checkHash(request.form, os.getenv('IZIPAY_HMACSHA256', '')):
            logger.warning("Invalid signature in webhook")
            return jsonify({'error': 'Invalid signature'}), 400
        
        # Parsear kr-answer JSON
        try:
            answer = json.loads(kr_answer)
        except Exception as e:
            logger.error(f"Error parsing kr-answer: {str(e)}")
            return jsonify({'error': 'Invalid kr-answer JSON'}), 400
        
        # Extraer datos según estructura oficial (app.py líneas 91-97)
        transaction = answer.get('transactions', [{}])[0]
        order_status = answer.get('orderStatus')  # PAID / UNPAID
        order_details = answer.get('orderDetails', {})
        order_id = order_details.get('orderId')
        transaction_uuid = transaction.get('uuid')
        
        logger.info(f"Webhook data - OrderId: {order_id}, Status: {order_status}, UUID: {transaction_uuid}")
        
        if not order_id:
            logger.warning("No orderId in webhook kr-answer")
            return jsonify({'ok': True, 'message': 'No orderId found'}), 200
        
        # Buscar la orden en la base de datos
        order = Order.query.filter(
            (Order.order_number == order_id) |
            (Order.transaction_id == transaction_uuid)
        ).first()
        
        if not order:
            logger.warning(f"Order not found for webhook: {order_id}")
            # Retornar 200 para evitar reintentos de Izipay
            return jsonify({'ok': True, 'warning': 'order_not_found'}), 200
        
        # Actualizar el estado del pedido según orderStatus oficial
        # orderStatus puede ser: PAID, UNPAID, CANCELLED, etc.
        
        if order_status == 'PAID':
            if order.status != OrderStatus.PAID:
                order.status = OrderStatus.PAID
                order.paid_at = datetime.utcnow()
                order.payment_method = 'IZIPAY'
                
                # Guardar toda la información del webhook
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_confirmation': answer,
                    'webhook_received_at': datetime.utcnow().isoformat(),
                    'transaction_id': transaction_uuid,
                    'order_status': order_status
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed payment for order {order.order_number}")
        
        elif order_status == 'UNPAID':
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.FAILED
                
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_failure': answer,
                    'webhook_received_at': datetime.utcnow().isoformat(),
                    'order_status': order_status
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed payment failure for order {order.order_number}")
        
        elif order_status == 'CANCELLED':
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.CANCELLED
                
                current_payment_data = order.payment_data or {}
                current_payment_data.update({
                    'webhook_cancellation': answer,
                    'webhook_received_at': datetime.utcnow().isoformat(),
                    'order_status': order_status
                })
                order.payment_data = current_payment_data
                
                logger.info(f"Webhook confirmed cancellation for order {order.order_number}")
        
        else:
            # Estado no reconocido, guardar de todos modos
            current_payment_data = order.payment_data or {}
            current_payment_data.update({
                'webhook_unknown': answer,
                'webhook_received_at': datetime.utcnow().isoformat(),
                'unknown_status': order_status
            })
            order.payment_data = current_payment_data
            
            logger.warning(f"Unknown payment status for order {order.order_number}: {order_status}")
        
        # Guardar cambios
        db.session.commit()
        
        # Retorno según documentación oficial (app.py línea 99)
        return f'OK! OrderStatus is {order_status}', 200
        
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