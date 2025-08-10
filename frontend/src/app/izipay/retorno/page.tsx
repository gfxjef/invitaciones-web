'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/lib/api';

interface PaymentStatus {
  success: boolean;
  message: string;
  orderNumber?: string;
  amount?: number;
  transactionId?: string;
}

export default function IzipayRetornoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectCounter, setRedirectCounter] = useState(5);

  useEffect(() => {
    const processReturn = async () => {
      try {
        // Obtener parámetros de la URL
        const orderNumber = searchParams.get('orderNumber') || searchParams.get('order_number');
        const paymentStatus = searchParams.get('status') || searchParams.get('payment_status');
        const transactionId = searchParams.get('transactionId') || searchParams.get('transaction_id');
        const amount = searchParams.get('amount');
        const errorMessage = searchParams.get('error') || searchParams.get('message');

        console.log('🔍 [IZIPAY RETORNO] Parámetros recibidos:', {
          orderNumber,
          paymentStatus,
          transactionId,
          amount,
          errorMessage
        });

        // Determinar el estado del pago
        let success = false;
        let message = 'Procesando pago...';

        if (paymentStatus) {
          const statusLower = paymentStatus.toLowerCase();
          if (statusLower === 'paid' || statusLower === 'success' || statusLower === 'authorized') {
            success = true;
            message = '¡Pago realizado con éxito!';
          } else if (statusLower === 'refused' || statusLower === 'error' || statusLower === 'failed') {
            success = false;
            message = errorMessage || 'El pago fue rechazado. Por favor, intenta nuevamente.';
          } else if (statusLower === 'pending' || statusLower === 'processing') {
            success = false;
            message = 'Tu pago está siendo procesado. Te notificaremos cuando se complete.';
          } else if (statusLower === 'canceled' || statusLower === 'cancelled') {
            success = false;
            message = 'El pago fue cancelado.';
          }
        }

        // Si hay un número de orden, intentar obtener los detalles
        if (orderNumber) {
          try {
            const orderDetails = await ordersApi.getOrderByNumber(orderNumber);
            if (orderDetails) {
              setOrder(orderDetails);
              
              // Actualizar el estado basado en la información del pedido
              if (orderDetails.status === 'paid') {
                success = true;
                message = '¡Pago confirmado!';
              }
            }
          } catch (error) {
            console.error('Error obteniendo detalles del pedido:', error);
          }
        }

        setStatus({
          success,
          message,
          orderNumber: orderNumber || undefined,
          amount: amount ? parseFloat(amount) : undefined,
          transactionId: transactionId || undefined
        });

      } catch (error) {
        console.error('Error procesando retorno de Izipay:', error);
        setStatus({
          success: false,
          message: 'Ocurrió un error al procesar tu pago. Por favor, contacta con soporte.'
        });
      } finally {
        setLoading(false);
      }
    };

    processReturn();
  }, [searchParams]);

  // Redirección automática
  useEffect(() => {
    if (!loading && status) {
      const timer = setInterval(() => {
        setRedirectCounter((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (status.success && status.orderNumber) {
              router.push(`/mi-cuenta/pedidos/${status.orderNumber}`);
            } else {
              router.push('/checkout');
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Procesando tu pago...
            </h2>
            <p className="text-gray-600 text-center">
              Por favor espera mientras confirmamos tu transacción con Izipay.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (!status) return null;
    
    if (status.success) {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    } else if (status.message.includes('procesando')) {
      return <Clock className="h-16 w-16 text-yellow-500" />;
    } else if (status.message.includes('cancelado')) {
      return <XCircle className="h-16 w-16 text-gray-500" />;
    } else {
      return <AlertCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'gray';
    
    if (status.success) return 'green';
    if (status.message.includes('procesando')) return 'yellow';
    if (status.message.includes('cancelado')) return 'gray';
    return 'red';
  };

  const color = getStatusColor();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex flex-col items-center text-center">
          {getStatusIcon()}
          
          <h1 className={`text-2xl font-bold mt-4 mb-2 text-${color}-700`}>
            {status?.success ? 'Pago Exitoso' : 'Estado del Pago'}
          </h1>
          
          <p className="text-gray-700 mb-6">
            {status?.message}
          </p>

          {/* Detalles del pedido */}
          {(status?.orderNumber || status?.transactionId || status?.amount) && (
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Detalles de la transacción</h3>
              <div className="space-y-2 text-sm">
                {status.orderNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de orden:</span>
                    <span className="font-medium text-gray-900">{status.orderNumber}</span>
                  </div>
                )}
                {status.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de transacción:</span>
                    <span className="font-medium text-gray-900">{status.transactionId}</span>
                  </div>
                )}
                {status.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-medium text-gray-900">
                      S/ {status.amount.toFixed(2)}
                    </span>
                  </div>
                )}
                {order?.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleString('es-PE')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información del pedido si está disponible */}
          {order && order.items && order.items.length > 0 && (
            <div className="w-full bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen del pedido</h3>
              <div className="space-y-2 text-sm">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.product_name} x{item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      S/ {item.total_price.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>S/ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contador de redirección */}
          <p className="text-sm text-gray-500 mb-4">
            Serás redirigido en {redirectCounter} segundos...
          </p>

          {/* Botones de acción */}
          <div className="flex gap-4">
            {status?.success && status?.orderNumber ? (
              <button
                onClick={() => router.push(`/mi-cuenta/pedidos/${status.orderNumber}`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver mi pedido
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/checkout')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reintentar pago
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Volver al inicio
                </button>
              </>
            )}
          </div>

          {/* Mensaje de ayuda */}
          {!status?.success && (
            <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>¿Necesitas ayuda?</strong> Contacta con nuestro equipo de soporte 
                en <a href="mailto:soporte@invitaciones.com" className="underline">soporte@invitaciones.com</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}