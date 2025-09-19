/**
 * Enhanced Account Dashboard Component
 * 
 * WHY: Main dashboard for user account management with comprehensive
 * invitation overview, analytics, and quick actions.
 * 
 * WHAT: Dashboard with invitation statistics, performance metrics,
 * recent activity, notifications, and quick access to management features.
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
  Clock,
  Bell,
  Share2,
  Heart,
  Settings,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatsCard, StatsGrid } from '@/components/ui/stats-card';
import { dashboardApi, type DashboardStats, type Invitation } from '@/lib/api';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  href: string;
  count?: number;
}

export default function MyAccountDashboard() {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Mock notifications for demo
  const mockNotifications: NotificationItem[] = [
    {
      id: 1,
      type: 'info',
      title: 'Nueva confirmación RSVP',
      message: 'Ana García confirmó su asistencia a "Boda María & Carlos"',
      timestamp: '2024-08-19T10:30:00Z',
      read: false,
      action: {
        label: 'Ver invitación',
        href: '/mi-cuenta/invitaciones/1'
      }
    },
    {
      id: 2,
      type: 'warning',
      title: 'Recordatorio RSVP',
      message: 'El plazo de confirmación para "XV Años Isabella" vence en 3 días',
      timestamp: '2024-08-19T08:15:00Z',
      read: false,
      action: {
        label: 'Gestionar RSVP',
        href: '/mi-cuenta/invitaciones/2'
      }
    },
    {
      id: 3,
      type: 'success',
      title: 'Invitación publicada',
      message: 'Tu invitación "Cumpleaños Ana" está ahora activa',
      timestamp: '2024-08-18T16:45:00Z',
      read: true
    }
  ];

  useEffect(() => {
    loadDashboardData();
    setNotifications(mockNotifications);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const stats = await dashboardApi.getDashboardStats();
      // setDashboardStats(stats);
      
      // Using enhanced mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: DashboardStats = {
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
          orders: [],
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
            },
            {
              id: 2,
              name: 'XV Años Isabella',
              event_type: 'quince',
              event_date: '2024-08-20T19:00:00Z',
              url_slug: 'isabella-xv',
              full_url: 'https://graphica.pe/invitacion/isabella-xv',
              status: 'active',
              template_name: 'Clásico Dorado',
              created_at: '2024-07-15T16:45:00Z',
              updated_at: '2024-07-22T09:15:00Z',
              stats: {
                total_views: 89,
                unique_visitors: 67,
                rsvp_responses: 23,
                rsvp_confirmed: 20,
                rsvp_declined: 3,
                shares: 5,
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
      
      setDashboardStats(mockStats);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'boda': return Heart;
      case 'quince': return Star;
      case 'bautizo': return Users;
      case 'cumpleanos': return Calendar;
      case 'baby_shower': return Users;
      default: return Calendar;
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      active: { label: 'Activa', color: 'bg-green-100 text-green-800 border-green-200' },
      expired: { label: 'Expirada', color: 'bg-red-100 text-red-800 border-red-200' },
      completed: { label: 'Completada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  const quickActions: QuickActionItem[] = [
    {
      id: 'new-invitation',
      title: 'Nueva invitación',
      description: 'Crear desde plantilla',
      icon: Plus,
      iconColor: 'text-purple-600',
      href: '/plantillas'
    },
    {
      id: 'manage-invitations',
      title: 'Gestionar invitaciones',
      description: 'Ver todas las invitaciones',
      icon: FileText,
      iconColor: 'text-blue-600',
      href: '/mi-cuenta/invitaciones',
      count: dashboardStats?.invitations.active_invitations || 0
    },
    {
      id: 'analytics',
      title: 'Ver analíticas',
      description: 'Estadísticas detalladas',
      icon: BarChart3,
      iconColor: 'text-green-600',
      href: '/mi-cuenta/invitaciones'
    },
    {
      id: 'templates',
      title: 'Mis plantillas',
      description: 'Plantillas guardadas',
      icon: Star,
      iconColor: 'text-yellow-600',
      href: '/mi-cuenta/plantillas',
      count: dashboardStats?.user.favorite_templates || 0
    },
    {
      id: 'orders',
      title: 'Historial de compras',
      description: 'Ver pedidos realizados',
      icon: Package,
      iconColor: 'text-orange-600',
      href: '/mi-cuenta/pedidos',
      count: dashboardStats?.user.total_orders || 0
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Ajustes de cuenta',
      icon: Settings,
      iconColor: 'text-gray-600',
      href: '/mi-cuenta/perfil'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border animate-pulse"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="h-96 bg-white rounded-xl border animate-pulse"></div>
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
      {/* Welcome Section with Performance Insights */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                ¡Bienvenida de vuelta!
              </h1>
              <p className="text-purple-100 text-lg mb-4">
                Tus invitaciones han recibido {dashboardStats.invitations.total_views.toLocaleString()} vistas este mes
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{dashboardStats.invitations.total_confirmations} confirmaciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>{dashboardStats.invitations.active_invitations} invitaciones activas</span>
                </div>
              </div>
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
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => router.push('/mi-cuenta/invitaciones')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver analíticas
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Enhanced Stats Overview */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Invitaciones creadas"
          value={dashboardStats.invitations.total_invitations}
          description={`${dashboardStats.invitations.active_invitations} activas`}
          icon={FileText}
          iconColor="purple"
          trend={{
            value: 12,
            label: "vs. mes anterior",
            positive: true,
          }}
          action={
            <Button size="sm" variant="outline" onClick={() => router.push('/mi-cuenta/invitaciones')}>
              <ArrowRight className="w-3 h-3 mr-1" />
              Gestionar
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
          title="Confirmaciones RSVP"
          value={dashboardStats.invitations.total_confirmations}
          description={`${Math.round((dashboardStats.invitations.total_confirmations / dashboardStats.invitations.total_views) * 100)}% tasa de respuesta`}
          icon={Users}
          iconColor="green"
          trend={{
            value: 15,
            label: "nuevas esta semana",
            positive: true,
          }}
        />
        
        <StatsCard
          title="Total invertido"
          value={formatCurrency(dashboardStats.user.total_spent)}
          description={`${dashboardStats.user.total_orders} pedidos realizados`}
          icon={DollarSign}
          iconColor="orange"
          action={
            <Button size="sm" variant="outline" onClick={() => router.push('/mi-cuenta/pedidos')}>
              <Package className="w-3 h-3 mr-1" />
              Ver pedidos
            </Button>
          }
        />
      </StatsGrid>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
                  onClick={() => router.push(action.href)}
                >
                  <div className="relative">
                    <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                    {action.count !== undefined && action.count > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Invitations */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Invitaciones recientes</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/mi-cuenta/invitaciones')}
              >
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="p-6">
              {dashboardStats.recent_activity.invitations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No tienes invitaciones recientes</p>
                  <Button size="sm" onClick={() => router.push('/plantillas')}>
                    Crear invitación
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardStats.recent_activity.invitations.slice(0, 3).map((invitation) => {
                    const statusConfig = getStatusConfig(invitation.status);
                    const EventIcon = getEventTypeIcon(invitation.event_type);
                    const responseRate = Math.round((invitation.stats.rsvp_confirmed / invitation.stats.rsvp_responses) * 100) || 0;

                    return (
                      <div key={invitation.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                           onClick={() => router.push(`/mi-cuenta/invitaciones/${invitation.id}`)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <EventIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{invitation.name}</p>
                              <p className="text-sm text-gray-600">
                                {invitation.template_name} • {formatDate(invitation.event_date)}
                              </p>
                            </div>
                          </div>
                          <Badge className={`border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">{invitation.stats.total_views}</p>
                            <p className="text-gray-500 text-xs">Vistas</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">{invitation.stats.unique_visitors}</p>
                            <p className="text-gray-500 text-xs">Únicos</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">{invitation.stats.rsvp_confirmed}</p>
                            <p className="text-gray-500 text-xs">Confirmados</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">{responseRate}%</p>
                            <p className="text-gray-500 text-xs">Respuesta</p>
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

        {/* Notifications Panel */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                {unreadNotifications.length > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay notificaciones nuevas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(showAllNotifications ? notifications : notifications.slice(0, 3)).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          <p className="text-gray-400 text-xs mt-2">
                            {formatDate(notification.timestamp)}
                          </p>
                          {notification.action && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-800"
                              onClick={() => router.push(notification.action!.href)}
                            >
                              {notification.action.label} →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                    >
                      {showAllNotifications ? 'Ver menos' : `Ver ${notifications.length - 3} más`}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Insights de rendimiento</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Excelente engagement</p>
                  <p className="text-xs text-gray-600">Tus invitaciones tienen 15% más vistas que el promedio</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Alta tasa de respuesta</p>
                  <p className="text-xs text-gray-600">85% de tus invitados confirman asistencia</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Recordatorio pendiente</p>
                  <p className="text-xs text-gray-600">2 invitaciones necesitan recordatorios RSVP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}