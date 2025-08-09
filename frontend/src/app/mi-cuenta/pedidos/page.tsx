/**
 * Orders History Page (/mi-cuenta/pedidos)
 * 
 * WHY: Allows users to view their complete order history with detailed
 * information about each purchase, including status tracking, order items,
 * and download links for completed orders.
 * 
 * WHAT: Comprehensive orders list with filtering, pagination, status badges,
 * and order detail modals. Integrates with backend orders API.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Calendar, 
  DollarSign,
  Download,
  Eye,
  Filter,
  Search,
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ordersApi, type Order } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderFilters {
  status?: string;
  dateRange?: string;
  search?: string;
}

const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  processing: {
    label: 'Procesando',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package,
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  shipped: {
    label: 'Enviado',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
  },
};

// Mock data for development - will be replaced with real API calls
const mockOrders: Order[] = [
  {
    id: 1,
    order_number: 'ORD-2024-001',
    status: 'completed',
    total: 690.00,
    total_amount: 690.00,
    subtotal: 690.00,
    discount_amount: 0,
    currency: 'PEN',
    created_at: '2024-07-20T10:30:00Z',
    items: [
      {
        id: 1,
        product_name: 'Elegancia Rosa - Boda Premium',
        quantity: 1,
        unit_price: 690.00,
        total_price: 690.00,
      },
    ],
  },
  {
    id: 2,
    order_number: 'ORD-2024-002',
    status: 'processing',
    total: 290.00,
    total_amount: 290.00,
    subtotal: 290.00,
    discount_amount: 0,
    currency: 'PEN',
    created_at: '2024-07-15T16:45:00Z',
    items: [
      {
        id: 2,
        product_name: 'Clásico Dorado - XV Años',
        quantity: 1,
        unit_price: 290.00,
        total_price: 290.00,
      },
    ],
  },
  {
    id: 3,
    order_number: 'ORD-2024-003',
    status: 'cancelled',
    total: 190.00,
    total_amount: 190.00,
    subtotal: 190.00,
    discount_amount: 0,
    currency: 'PEN',
    created_at: '2024-07-10T12:00:00Z',
    items: [
      {
        id: 3,
        product_name: 'Moderno Minimalista - Cumpleaños',
        quantity: 1,
        unit_price: 190.00,
        total_price: 190.00,
      },
    ],
  },
  {
    id: 4,
    order_number: 'ORD-2024-004',
    status: 'pending',
    total: 480.00,
    total_amount: 480.00,
    subtotal: 480.00,
    discount_amount: 0,
    currency: 'PEN',
    created_at: '2024-07-08T14:20:00Z',
    items: [
      {
        id: 4,
        product_name: 'Vintage Floral - Baby Shower',
        quantity: 2,
        unit_price: 240.00,
        total_price: 480.00,
      },
    ],
  },
];

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [orders, filters, sortBy, sortOrder]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await ordersApi.getOrders();
      // setOrders(response.items);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setOrders(mockOrders);
    } catch (error) {
      toast.error('Error cargando pedidos');
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...orders];

    // Apply filters
    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(order => 
        order.order_number.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.product_name.toLowerCase().includes(searchLower))
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'last_week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last_month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'last_3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'last_year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (filters.dateRange !== 'all') {
        result = result.filter(order => new Date(order.created_at) >= filterDate);
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'amount':
          comparison = a.total_amount - b.total_amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredOrders(result);
  };

  const handleDownloadInvitation = (orderId: number) => {
    toast.success('Descargando invitación...');
    // TODO: Implement download functionality
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  const getStatusConfig = (status: string) => {
    return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || {
      label: status,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Package,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
            <p className="text-gray-600">Historial completo de tus pedidos</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} realizados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="shipped">Enviado</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.dateRange || 'all'}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="all">Todas las fechas</option>
              <option value="last_week">Última semana</option>
              <option value="last_month">Último mes</option>
              <option value="last_3months">Últimos 3 meses</option>
              <option value="last_year">Último año</option>
            </select>

            {/* Sort Options */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="date">Fecha</option>
                <option value="amount">Monto</option>
                <option value="status">Estado</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12 text-gray-400" />}
          title="No hay pedidos"
          description={
            orders.length === 0 
              ? "Aún no has realizado ningún pedido. ¡Explora nuestras plantillas!" 
              : "No se encontraron pedidos con los filtros aplicados."
          }
          action={
            orders.length === 0 ? (
              <Button onClick={() => router.push('/plantillas')}>
                Ver plantillas
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={() => setFilters({})}
              >
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const IconComponent = statusConfig.icon;

            return (
              <div key={order.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {order.order_number}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(order.total_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`px-3 py-1 border ${statusConfig.color}`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.total_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                    </Button>
                    
                    {order.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvitation(order.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/invitacion/${order.id}`)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver invitación
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/checkout?order=${order.id}`)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar ahora
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Detalles del Pedido
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Número de pedido</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedOrder.order_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <Badge className={`inline-flex items-center px-2 py-1 border ${getStatusConfig(selectedOrder.status).color}`}>
                      {getStatusConfig(selectedOrder.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de pedido</p>
                    <p className="text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedOrder.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Artículos del pedido</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}