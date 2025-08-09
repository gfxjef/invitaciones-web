/**
 * Order Details Page (/mi-cuenta/pedidos/[orderNumber])
 * 
 * WHY: Shows detailed information about a specific order, including payment status,
 * order items, and allows users to download their purchased templates.
 * 
 * WHAT: Dynamic page that displays order confirmation, payment success/failure,
 * order details, and download links for templates.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  ArrowLeft, 
  Package,
  Calendar,
  CreditCard,
  User,
  Mail,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ordersApi, type Order } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderDetailsPageProps {
  params: {
    orderNumber: string;
  };
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isSuccess = searchParams.get('success') === 'true';
  const isFailed = searchParams.get('failed') === 'true';

  useEffect(() => {
    loadOrderDetails();
  }, [params.orderNumber]);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const orderData = await ordersApi.getOrderByNumber(params.orderNumber);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Error cargando los detalles del pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = (templateId: number, templateName: string) => {
    toast.success(`Descargando ${templateName}...`);
    // TODO: Implement actual download functionality
  };

  const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get total amount for display (handles both old and new API responses)
  const getTotalAmount = (order: Order) => {
    return order.total || order.total_amount || 0;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PAID: { 
        label: 'Completado', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      PENDING: { 
        label: 'Pendiente', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Package,
        iconColor: 'text-yellow-600'
      },
      CANCELLED: { 
        label: 'Cancelado', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
      REFUNDED: { 
        label: 'Reembolsado', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle,
        iconColor: 'text-gray-600'
      },
      // Compatibility with frontend status names
      completed: { 
        label: 'Completado', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      processing: { 
        label: 'Procesando', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Package,
        iconColor: 'text-blue-600'
      },
      failed: { 
        label: 'Fallido', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/mi-cuenta/pedidos')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Detalles del Pedido</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Pedido no encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            No pudimos encontrar el pedido #{params.orderNumber}
          </p>
          <Button onClick={() => router.push('/mi-cuenta/pedidos')}>
            Ver todos los pedidos
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/mi-cuenta/pedidos')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.order_number}
          </h1>
          <p className="text-gray-600">
            Realizado el {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      {/* Success/Failure Message */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                ¡Pago procesado exitosamente!
              </h3>
              <p className="text-green-700">
                Tu pedido ha sido confirmado y podrás descargar tus plantillas a continuación.
              </p>
            </div>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Error en el pago
              </h3>
              <p className="text-red-700">
                Hubo un problema procesando tu pago. Por favor, intenta nuevamente.
              </p>
              <Button className="mt-3" onClick={() => router.push('/checkout')}>
                Intentar nuevamente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Estado del pedido
              </h3>
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(getTotalAmount(order))}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Plantillas compradas
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {item.product_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Subtotal: {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
                
                {(order.status === 'PAID' || order.status === 'completed') && (
                  <Button
                    onClick={() => handleDownloadTemplate(item.id, item.product_name)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/mi-cuenta/pedidos')}
          className="flex-1"
        >
          Ver todos los pedidos
        </Button>
        <Button
          onClick={() => router.push('/plantillas')}
          className="flex-1"
        >
          Explorar más plantillas
        </Button>
      </div>
    </div>
  );
}