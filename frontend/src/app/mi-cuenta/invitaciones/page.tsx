/**
 * Invitations Management Page (/mi-cuenta/invitaciones)
 * 
 * WHY: Allows users to manage their active invitations, view statistics,
 * download assets, and track guest confirmations. Core feature for 
 * invitation lifecycle management.
 * 
 * WHAT: Complete invitation management interface with status tracking,
 * guest management, analytics, and download functionality.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Users, 
  Eye, 
  Download, 
  Share2, 
  Edit3,
  Calendar,
  Globe,
  BarChart3,
  Copy,
  ExternalLink,
  Plus,
  Settings,
  Heart,
  MessageCircle,
  TrendingUp,
  Clock,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';

interface Invitation {
  id: number;
  name: string;
  event_type: 'boda' | 'quince' | 'bautizo' | 'cumpleanos' | 'baby_shower' | 'otro';
  event_date: string;
  url_slug: string;
  full_url: string;
  status: 'draft' | 'active' | 'expired' | 'completed';
  template_name: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  stats: {
    total_views: number;
    unique_visitors: number;
    rsvp_responses: number;
    rsvp_confirmed: number;
    rsvp_declined: number;
    shares: number;
  };
  settings: {
    rsvp_enabled: boolean;
    rsvp_deadline?: string;
    guest_limit?: number;
    is_public: boolean;
    password_protected: boolean;
  };
}

// Mock invitations data for development
const mockInvitations: Invitation[] = [
  {
    id: 1,
    name: 'Boda María & Carlos',
    event_type: 'boda',
    event_date: '2024-09-15T18:00:00Z',
    url_slug: 'maria-carlos-2024',
    full_url: 'https://graphica.pe/invitacion/maria-carlos-2024',
    status: 'active',
    template_name: 'Elegancia Rosa',
    thumbnail_url: '/api/placeholder/300/200',
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
    thumbnail_url: '/api/placeholder/300/200',
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
      rsvp_deadline: '2024-08-15T23:59:59Z',
      guest_limit: 80,
      is_public: true,
      password_protected: false,
    },
  },
  {
    id: 3,
    name: 'Baby Shower Emma',
    event_type: 'baby_shower',
    event_date: '2024-08-10T15:00:00Z',
    url_slug: 'baby-shower-emma',
    full_url: 'https://graphica.pe/invitacion/baby-shower-emma',
    status: 'completed',
    template_name: 'Vintage Floral',
    thumbnail_url: '/api/placeholder/300/200',
    created_at: '2024-06-30T12:00:00Z',
    updated_at: '2024-08-11T10:30:00Z',
    stats: {
      total_views: 156,
      unique_visitors: 124,
      rsvp_responses: 35,
      rsvp_confirmed: 32,
      rsvp_declined: 3,
      shares: 8,
    },
    settings: {
      rsvp_enabled: true,
      rsvp_deadline: '2024-08-05T23:59:59Z',
      guest_limit: 40,
      is_public: false,
      password_protected: true,
    },
  },
];

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

export default function InvitacionesPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await invitationsApi.getInvitations();
      // setInvitations(response.data);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setInvitations(mockInvitations);
    } catch (error) {
      toast.error('Error cargando invitaciones');
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles');
  };

  const handleShareInvitation = (invitation: Invitation) => {
    if (navigator.share) {
      navigator.share({
        title: invitation.name,
        text: `Te invito a mi ${EVENT_TYPE_LABELS[invitation.event_type].toLowerCase()}`,
        url: invitation.full_url,
      });
    } else {
      handleCopyUrl(invitation.full_url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  };

  const calculateResponseRate = (invitation: Invitation) => {
    const { stats } = invitation;
    if (stats.rsvp_responses === 0) return 0;
    return Math.round((stats.rsvp_confirmed / stats.rsvp_responses) * 100);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'boda': return Heart;
      case 'quince': return Calendar;
      case 'bautizo': return Users;
      case 'cumpleanos': return Calendar;
      case 'baby_shower': return Users;
      default: return Calendar;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Invitaciones</h1>
            <p className="text-gray-600">Gestiona y monitorea tus invitaciones</p>
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Invitaciones</h1>
          <p className="text-gray-600">
            {invitations.length} invitación{invitations.length !== 1 ? 'es' : ''} creadas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              Lista
            </Button>
          </div>
          <Button onClick={() => router.push('/plantillas')}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva invitación
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {invitations.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Total invitaciones</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              {invitations.reduce((sum, inv) => sum + inv.stats.total_views, 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Vistas totales</p>
        </div>

        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {invitations.reduce((sum, inv) => sum + inv.stats.rsvp_confirmed, 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Confirmaciones</p>
        </div>

        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Share2 className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">
              {invitations.reduce((sum, inv) => sum + inv.stats.shares, 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Compartidas</p>
        </div>
      </div>

      {/* Invitations List/Grid */}
      {invitations.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12 text-gray-400" />}
          title="No tienes invitaciones"
          description="Crea tu primera invitación digital para comenzar"
          action={
            <Button onClick={() => router.push('/plantillas')}>
              <Plus className="w-4 h-4 mr-2" />
              Crear invitación
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((invitation) => {
            const statusConfig = getStatusConfig(invitation.status);
            const EventTypeIcon = getEventTypeIcon(invitation.event_type);
            const responseRate = calculateResponseRate(invitation);

            return (
              <div key={invitation.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                {/* Invitation Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <EventTypeIcon className="w-16 h-16 text-purple-600 opacity-50" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={`border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-white bg-opacity-90 rounded-full p-1">
                      <EventTypeIcon className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Invitation Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                      {invitation.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {EVENT_TYPE_LABELS[invitation.event_type]} • {formatShortDate(invitation.event_date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Plantilla: {invitation.template_name}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {invitation.stats.total_views}
                      </p>
                      <p className="text-xs text-gray-500">Vistas</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {invitation.stats.rsvp_confirmed}
                      </p>
                      <p className="text-xs text-gray-500">Confirmados</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {responseRate}%
                      </p>
                      <p className="text-xs text-gray-500">Respuesta</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/mi-cuenta/invitaciones/${invitation.id}`)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/mi-cuenta/invitaciones/${invitation.id}/urls`)}
                      title="Gestionar URLs únicas"
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareInvitation(invitation)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(invitation.full_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invitación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invitations.map((invitation) => {
                  const statusConfig = getStatusConfig(invitation.status);
                  const EventTypeIcon = getEventTypeIcon(invitation.event_type);

                  return (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <EventTypeIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invitation.name}</p>
                            <p className="text-sm text-gray-600">
                              {EVENT_TYPE_LABELS[invitation.event_type]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatShortDate(invitation.event_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{invitation.stats.total_views} vistas</div>
                          <div className="text-gray-500">
                            {invitation.stats.rsvp_confirmed} confirmados
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/mi-cuenta/invitaciones/${invitation.id}`)}
                          >
                            Ver detalles
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/mi-cuenta/invitaciones/${invitation.id}/urls`)}
                            title="Gestionar URLs únicas"
                          >
                            <Link2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareInvitation(invitation)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invitation Detail Modal */}
      {selectedInvitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Detalles de la Invitación
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInvitation(null)}
                >
                  ×
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Información básica</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nombre del evento</p>
                        <p className="text-gray-900">{selectedInvitation.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tipo de evento</p>
                        <p className="text-gray-900">
                          {EVENT_TYPE_LABELS[selectedInvitation.event_type]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fecha del evento</p>
                        <p className="text-gray-900">
                          {formatDate(selectedInvitation.event_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estado</p>
                        <Badge className={`inline-flex border ${getStatusConfig(selectedInvitation.status).color}`}>
                          {getStatusConfig(selectedInvitation.status).label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* URL and Sharing */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Enlace de la invitación</h4>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-900 break-all">
                        {selectedInvitation.full_url}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(selectedInvitation.full_url)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareInvitation(selectedInvitation)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedInvitation.full_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats and Settings */}
                <div className="space-y-6">
                  {/* Statistics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Eye className="w-5 h-5 text-blue-600" />
                          <span className="text-lg font-semibold text-blue-900">
                            {selectedInvitation.stats.total_views}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">Vistas totales</p>
                        <p className="text-xs text-blue-600">
                          {selectedInvitation.stats.unique_visitors} únicos
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Users className="w-5 h-5 text-green-600" />
                          <span className="text-lg font-semibold text-green-900">
                            {selectedInvitation.stats.rsvp_confirmed}
                          </span>
                        </div>
                        <p className="text-sm text-green-700">Confirmados</p>
                        <p className="text-xs text-green-600">
                          de {selectedInvitation.stats.rsvp_responses} respuestas
                        </p>
                      </div>

                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Users className="w-5 h-5 text-red-600" />
                          <span className="text-lg font-semibold text-red-900">
                            {selectedInvitation.stats.rsvp_declined}
                          </span>
                        </div>
                        <p className="text-sm text-red-700">No asisten</p>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Share2 className="w-5 h-5 text-orange-600" />
                          <span className="text-lg font-semibold text-orange-900">
                            {selectedInvitation.stats.shares}
                          </span>
                        </div>
                        <p className="text-sm text-orange-700">Compartidas</p>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Settings */}
                  {selectedInvitation.settings.rsvp_enabled && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Configuración RSVP</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Límite de invitados:</span>
                          <span className="text-gray-900">
                            {selectedInvitation.settings.guest_limit || 'Sin límite'}
                          </span>
                        </div>
                        {selectedInvitation.settings.rsvp_deadline && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha límite:</span>
                            <span className="text-gray-900">
                              {formatShortDate(selectedInvitation.settings.rsvp_deadline)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Visibilidad:</span>
                          <Badge variant="outline">
                            {selectedInvitation.settings.is_public ? 'Pública' : 'Privada'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/invitacion/${selectedInvitation.id}/edit`)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast('Función de descarga próximamente')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/invitacion/${selectedInvitation.id}/settings`)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
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