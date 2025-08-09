/**
 * User Profile Page (/mi-cuenta)
 * 
 * WHY: Main dashboard page for user account management. Provides
 * overview of account status, recent orders, and profile management.
 * 
 * WHAT: Dashboard with user profile form, account statistics, and
 * quick access to recent activity.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package,
  FileText,
  Star,
  Users,
  Eye,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight,
  Plus,
  BarChart3,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatsCard, StatsGrid } from '@/components/ui/stats-card';
import { dashboardApi, ordersApi, invitationsApi, type DashboardStats } from '@/lib/api';
import toast from 'react-hot-toast';

// Mock dashboard data - will be replaced with real API calls
const mockDashboardStats: DashboardStats = {
  user: {
    total_orders: 8,
    total_spent: 2840,
    member_since: '2024-01-15',
    favorite_templates: 12,
  },
  invitations: {
    total_invitations: 5,
    active_invitations: 3,
    total_views: 1247,
    total_confirmations: 156,
  },
  recent_activity: {
    orders: [
      {
        id: 1,
        order_number: 'ORD-2024-001',
        status: 'completed',
        total: 690,
        total_amount: 690,
        subtotal: 690,
        discount_amount: 0,
        currency: 'PEN',
        created_at: '2024-07-20T10:30:00Z',
        items: [{
          id: 1,
          product_name: 'Elegancia Rosa',
          quantity: 1,
          unit_price: 690,
          total_price: 690,
        }],
      },
      {
        id: 2,
        order_number: 'ORD-2024-002',
        status: 'processing',
        total: 290,
        total_amount: 290,
        subtotal: 290,
        discount_amount: 0,
        currency: 'PEN',
        created_at: '2024-07-15T16:45:00Z',
        items: [{
          id: 2,
          product_name: 'Clásico Dorado',
          quantity: 1,
          unit_price: 290,
          total_price: 290,
        }],
      }
    ],
    invitations: [
      {
        id: 1,
        name: 'Boda María & Carlos',
        event_type: 'boda',
        event_date: '2024-09-15T18:00:00Z',
        url_slug: 'maria-carlos-2024',
        full_url: 'https://graphica.pe/invitacion/maria-carlos-2024',
        status: 'active',
        template_name: 'Elegancia Rosa',
        created_at: '2024-07-20T10:30:00Z',
        updated_at: '2024-07-25T14:20:00Z',
        stats: {
          total_views: 234,
          unique_visitors: 189,
          rsvp_responses: 45,
          rsvp_confirmed: 38,
          rsvp_declined: 7,
          shares: 12,
        },
        settings: {
          rsvp_enabled: true,
          is_public: true,
          password_protected: false,
        },
      }
    ],
  },
};

export default function MiCuentaPage() {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API calls
      // const stats = await dashboardApi.getDashboardStats();
      // setDashboardStats(stats);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardStats(mockDashboardStats);
    } catch (error) {
      toast.error('Error cargando los datos del dashboard');
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      completed: { label: 'Completado', color: 'bg-green-100 text-green-800' },
      processing: { label: 'En proceso', color: 'bg-blue-100 text-blue-800' },
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      active: { label: 'Activa', color: 'bg-green-100 text-green-800' },
    };
    return configs[status as keyof typeof configs] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border animate-pulse"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white rounded-xl border animate-pulse"></div>
          <div className="h-96 bg-white rounded-xl border animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se pudieron cargar los datos del dashboard.</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                ¡Bienvenida de vuelta!
              </h1>
              <p className="text-purple-100 text-lg">
                Aquí tienes un resumen de tu actividad reciente
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => router.push('/plantillas')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva invitación
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Stats Overview */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total de pedidos"
          value={dashboardStats.user.total_orders}
          description={`Total gastado: ${formatCurrency(dashboardStats.user.total_spent)}`}
          icon={Package}
          iconColor="purple"
          trend={{
            value: 12,
            label: "vs. mes anterior",
            positive: true,
          }}
        />
        
        <StatsCard
          title="Invitaciones activas"
          value={dashboardStats.invitations.active_invitations}
          description={`${dashboardStats.invitations.total_invitations} invitaciones totales`}
          icon={FileText}
          iconColor="green"
          action={
            <Button size="sm" variant="outline" onClick={() => router.push('/mi-cuenta/invitaciones')}>
              <ArrowRight className="w-3 h-3 mr-1" />
              Ver todas
            </Button>
          }
        />
        
        <StatsCard
          title="Vistas totales"
          value={dashboardStats.invitations.total_views.toLocaleString()}
          description="En todas las invitaciones"
          icon={Eye}
          iconColor="blue"
          trend={{
            value: 8,
            label: "esta semana",
            positive: true,
          }}
        />
        
        <StatsCard
          title="Confirmaciones"
          value={dashboardStats.invitations.total_confirmations}
          description={`${Math.round((dashboardStats.invitations.total_confirmations / dashboardStats.invitations.total_views) * 100)}% tasa de respuesta`}
          icon={Users}
          iconColor="orange"
          trend={{
            value: 15,
            label: "nuevas confirmaciones",
            positive: true,
          }}
        />
      </StatsGrid>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/plantillas')}
          >
            <Plus className="w-6 h-6 text-purple-600" />
            <div className="text-center">
              <div className="font-medium">Nueva invitación</div>
              <div className="text-xs text-gray-500">Crear desde plantilla</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/mi-cuenta/invitaciones')}
          >
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div className="text-center">
              <div className="font-medium">Ver estadísticas</div>
              <div className="text-xs text-gray-500">Analizar rendimiento</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/mi-cuenta/pedidos')}
          >
            <Package className="w-6 h-6 text-green-600" />
            <div className="text-center">
              <div className="font-medium">Mis compras</div>
              <div className="text-xs text-gray-500">Historial de pedidos</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos recientes</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/mi-cuenta/pedidos')}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-6">
            {dashboardStats.recent_activity.orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No tienes pedidos recientes</p>
                <Button size="sm" onClick={() => router.push('/plantillas')}>
                  Explorar plantillas
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardStats.recent_activity.orders.slice(0, 3).map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {order.items[0]?.product_name} • {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Invitations */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Invitaciones activas</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/mi-cuenta/invitaciones')}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-6">
            {dashboardStats.recent_activity.invitations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No tienes invitaciones activas</p>
                <Button size="sm" onClick={() => router.push('/plantillas')}>
                  Crear invitación
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardStats.recent_activity.invitations.map((invitation) => {
                  const statusConfig = getStatusConfig(invitation.status);
                  return (
                    <div key={invitation.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invitation.name}</p>
                            <p className="text-sm text-gray-600">
                              {invitation.template_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{invitation.stats.total_views}</p>
                          <p className="text-gray-500">Vistas</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{invitation.stats.rsvp_confirmed}</p>
                          <p className="text-gray-500">Confirmados</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{invitation.stats.shares}</p>
                          <p className="text-gray-500">Compartidas</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}