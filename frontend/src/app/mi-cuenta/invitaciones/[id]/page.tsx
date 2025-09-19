/**
 * Invitation Detail Page (/mi-cuenta/invitaciones/[id])
 * 
 * WHY: Provides detailed view and management for a specific invitation.
 * Central hub for invitation editing, URL management, and statistics.
 * 
 * WHAT: Comprehensive invitation management page with tabs for basic info,
 * URL management, statistics, and settings. Includes action buttons and navigation.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FileText, 
  Users, 
  Eye, 
  Calendar,
  Globe,
  BarChart3,
  Settings,
  Edit3,
  Share2,
  Download,
  ExternalLink,
  Copy,
  ArrowLeft,
  Link2,
  QrCode,
  TrendingUp,
  Heart,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { URLList } from '@/components/invitations/url-list';
import { CompactURLStats } from '@/components/invitations/url-stats';
import { useInvitationURLs } from '@/lib/hooks/use-invitation-urls';
import toast from 'react-hot-toast';

// Mock invitation data - in real app, this would come from API
const mockInvitation = {
  id: 1,
  name: 'Boda Jefferson & Rosmery',
  event_type: 'boda',
  event_date: '2024-09-15T18:00:00Z',
  url_slug: 'maria-carlos-2024',
  full_url: 'https://graphica.pe/invitacion/maria-carlos-2024',
  status: 'active',
  template_name: 'Elegancia Rosa',
  thumbnail_url: '/api/placeholder/400/300',
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
    rsvp_deadline: '2024-09-01T23:59:59Z',
    guest_limit: 150,
    is_public: true,
    password_protected: false,
  },
};

const EVENT_TYPE_LABELS = {
  boda: 'Boda',
  quince: 'XV Años',
  bautizo: 'Bautizo',
  cumpleanos: 'Cumpleaños',
  baby_shower: 'Baby Shower',
  otro: 'Otro',
};

const STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  active: {
    label: 'Activa',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  expired: {
    label: 'Expirada',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  completed: {
    label: 'Completada',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
};

type TabType = 'overview' | 'urls' | 'stats' | 'settings';

export default function InvitationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invitationId = parseInt(params.id as string);
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [invitation, setInvitation] = useState(mockInvitation);
  const [isLoading, setIsLoading] = useState(false);

  const { data: urls = [], isLoading: urlsLoading } = useInvitationURLs(invitationId);

  useEffect(() => {
    // In real app, load invitation data from API
    // loadInvitation(invitationId);
  }, [invitationId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles');
  };

  const handleShareInvitation = () => {
    if (navigator.share) {
      navigator.share({
        title: invitation.name,
        text: `Te invito a mi ${EVENT_TYPE_LABELS[invitation.event_type as keyof typeof EVENT_TYPE_LABELS].toLowerCase()}`,
        url: invitation.full_url,
      });
    } else {
      handleCopyUrl(invitation.full_url);
    }
  };

  const getStatusConfig = () => {
    return STATUS_CONFIG[invitation.status as keyof typeof STATUS_CONFIG];
  };

  const getEventTypeIcon = () => {
    switch (invitation.event_type) {
      case 'boda': return Heart;
      case 'quince': return Calendar;
      case 'bautizo': return Users;
      case 'cumpleanos': return Calendar;
      case 'baby_shower': return Users;
      default: return Calendar;
    }
  };

  const EventTypeIcon = getEventTypeIcon();
  const statusConfig = getStatusConfig();

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Resumen',
      icon: FileText,
      description: 'Información general',
    },
    {
      id: 'urls' as TabType,
      label: 'URLs Únicas',
      icon: Link2,
      description: 'Gestionar enlaces',
      badge: urls.length > 0 ? urls.length.toString() : undefined,
    },
    {
      id: 'stats' as TabType,
      label: 'Estadísticas',
      icon: BarChart3,
      description: 'Analytics y métricas',
    },
    {
      id: 'settings' as TabType,
      label: 'Configuración',
      icon: Settings,
      description: 'Ajustes avanzados',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/mi-cuenta/invitaciones')}
            className="mt-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <EventTypeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{invitation.name}</h1>
                <div className="flex items-center gap-3 text-gray-600">
                  <span>{EVENT_TYPE_LABELS[invitation.event_type as keyof typeof EVENT_TYPE_LABELS]}</span>
                  <span>•</span>
                  <span>{formatShortDate(invitation.event_date)}</span>
                  <Badge className={`border ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(invitation.full_url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver invitación
          </Button>
          <Button
            variant="outline"
            onClick={handleShareInvitation}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button>
            <Edit3 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              {invitation.stats.total_views}
            </span>
          </div>
          <p className="text-sm text-gray-600">Vistas totales</p>
          <p className="text-xs text-gray-500">
            {invitation.stats.unique_visitors} únicas
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {invitation.stats.rsvp_confirmed}
            </span>
          </div>
          <p className="text-sm text-gray-600">Confirmados</p>
          <p className="text-xs text-gray-500">
            de {invitation.stats.rsvp_responses} respuestas
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Link2 className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {urlsLoading ? '...' : urls.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">URLs únicas</p>
          <p className="text-xs text-gray-500">
            {urlsLoading ? 'Cargando...' : `${urls.filter(u => u.is_active).length} activas`}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Share2 className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">
              {invitation.stats.shares}
            </span>
          </div>
          <p className="text-sm text-gray-600">Compartidas</p>
          <p className="text-xs text-gray-500">
            En redes sociales
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {tab.badge}
                  </Badge>
                )}
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 ml-2">{tab.description}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Información básica</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tipo de evento</p>
                          <p className="text-gray-900">{EVENT_TYPE_LABELS[invitation.event_type as keyof typeof EVENT_TYPE_LABELS]}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Estado</p>
                          <Badge className={`inline-flex border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fecha del evento</p>
                        <p className="text-gray-900">{formatDate(invitation.event_date)}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Plantilla</p>
                        <p className="text-gray-900">{invitation.template_name}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">URL de la invitación</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-900 flex-1 font-mono text-sm break-all">
                            {invitation.full_url}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(invitation.full_url)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Configuración RSVP</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">RSVP habilitado</span>
                        <Badge variant="outline">
                          {invitation.settings.rsvp_enabled ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                      
                      {invitation.settings.rsvp_enabled && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Límite de invitados</span>
                            <span className="text-sm text-gray-900">
                              {invitation.settings.guest_limit || 'Sin límite'}
                            </span>
                          </div>
                          
                          {invitation.settings.rsvp_deadline && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Fecha límite</span>
                              <span className="text-sm text-gray-900">
                                {formatShortDate(invitation.settings.rsvp_deadline)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Visibilidad</span>
                        <Badge variant="outline">
                          {invitation.settings.is_public ? 'Pública' : 'Privada'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Estadísticas detalladas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Eye className="w-6 h-6 text-blue-600" />
                          <span className="text-xl font-bold text-blue-900">
                            {invitation.stats.total_views}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">Vistas totales</p>
                        <p className="text-xs text-blue-600">
                          {invitation.stats.unique_visitors} visitantes únicos
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Users className="w-6 h-6 text-green-600" />
                          <span className="text-xl font-bold text-green-900">
                            {invitation.stats.rsvp_confirmed}
                          </span>
                        </div>
                        <p className="text-sm text-green-700">Confirmados</p>
                        <p className="text-xs text-green-600">
                          {Math.round((invitation.stats.rsvp_confirmed / invitation.stats.rsvp_responses) * 100)}% de respuesta
                        </p>
                      </div>

                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <MessageCircle className="w-6 h-6 text-red-600" />
                          <span className="text-xl font-bold text-red-900">
                            {invitation.stats.rsvp_declined}
                          </span>
                        </div>
                        <p className="text-sm text-red-700">No asisten</p>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Share2 className="w-6 h-6 text-orange-600" />
                          <span className="text-xl font-bold text-orange-900">
                            {invitation.stats.shares}
                          </span>
                        </div>
                        <p className="text-sm text-orange-700">Compartidas</p>
                      </div>
                    </div>
                  </div>

                  {/* URLs Preview */}
                  {urls.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">URLs recientes</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('urls')}
                        >
                          Ver todas ({urls.length})
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {urls.slice(0, 3).map((url) => (
                          <CompactURLStats key={url.id} url={url} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'urls' && (
            <URLList
              invitationId={invitationId}
              invitationName={invitation.name}
            />
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Estadísticas detalladas
                </h3>
                <p className="text-gray-600">
                  Las estadísticas avanzadas estarán disponibles próximamente.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Configuración avanzada
                </h3>
                <p className="text-gray-600">
                  Las opciones de configuración estarán disponibles próximamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}