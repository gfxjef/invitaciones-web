/**
 * Individual Invitation Card Component
 * 
 * WHY: Displays individual invitation in a card format with
 * quick actions, statistics, and status indicators for
 * efficient invitation management.
 * 
 * WHAT: Card component with thumbnail, stats, actions,
 * selection support, and hover effects.
 */

'use client';

import { useState } from 'react';
import { 
  Heart,
  Star,
  Users,
  Calendar,
  Baby,
  Eye,
  Share2,
  Edit3,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Download,
  Archive,
  Trash2,
  BarChart3,
  Link2,
  Clock,
  MapPin,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type Invitation } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InvitationCardProps {
  invitation: Invitation;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onView?: (invitation: Invitation) => void;
  onEdit?: (invitation: Invitation) => void;
  onDuplicate?: (invitation: Invitation) => void;
  onDelete?: (invitation: Invitation) => void;
  onShare?: (invitation: Invitation) => void;
  onArchive?: (invitation: Invitation) => void;
  className?: string;
}

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
    icon: Clock
  },
  active: {
    label: 'Activa',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Eye
  },
  expired: {
    label: 'Expirada',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Clock
  },
  completed: {
    label: 'Completada',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: BarChart3
  },
};

export default function InvitationCard({
  invitation,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onShare,
  onArchive,
  className = ''
}: InvitationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'boda': return Heart;
      case 'quince': return Star;
      case 'bautizo': return Users;
      case 'cumpleanos': return Calendar;
      case 'baby_shower': return Baby;
      default: return Calendar;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateResponseRate = () => {
    const { stats } = invitation;
    // Backend only provides total rsvps count, not confirmed/responses breakdown
    // Return 0 for now - TODO: backend needs to provide rsvp_confirmed and rsvp_declined
    return stats.rsvps > 0 ? 100 : 0;
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const statusConfig = STATUS_CONFIG[invitation.status];
  const EventTypeIcon = getEventTypeIcon(invitation.event_type);
  const responseRate = calculateResponseRate();
  const isEventSoon = new Date(invitation.event_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Within 7 days

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${
        isSelected ? 'ring-2 ring-purple-500 border-purple-300' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className={`absolute top-3 left-3 z-10 transition-opacity ${
          isSelected || isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-white shadow-sm"
          />
        </div>
      )}

      {/* Invitation Thumbnail/Preview */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-t-lg overflow-hidden">
        {/* Event Soon Badge */}
        {isEventSoon && invitation.status === 'active' && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
              Próximamente
            </Badge>
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute ${onSelect ? 'top-3 right-3' : 'top-3 left-3'} z-10`}>
          <Badge className={`border ${statusConfig.color} flex items-center gap-1`}>
            <statusConfig.icon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Event Type Icon Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <EventTypeIcon className="w-16 h-16 text-purple-600 opacity-30" />
        </div>

        {/* Template Preview Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <p className="text-white text-sm font-medium">
            {invitation.template_name}
          </p>
        </div>

        {/* Hover Actions */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 text-gray-900 hover:bg-white"
            onClick={() => window.open(invitation.full_url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 text-gray-900 hover:bg-white"
              onClick={() => onEdit(invitation)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Invitation Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
            {invitation.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>{EVENT_TYPE_LABELS[invitation.event_type]}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(invitation.event_date)}</span>
            </div>
            <span>•</span>
            <span>{formatTime(invitation.event_date)}</span>
          </div>
          
          {/* Event Status Indicators */}
          <div className="flex items-center gap-2 text-xs">
            {invitation.settings.rsvp_enabled && (
              <Badge variant="outline" className="text-xs">
                RSVP habilitado
              </Badge>
            )}
            {invitation.settings.password_protected && (
              <Badge variant="outline" className="text-xs">
                Protegida
              </Badge>
            )}
            {!invitation.settings.is_public && (
              <Badge variant="outline" className="text-xs">
                Privada
              </Badge>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center mb-1">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {invitation.stats.views}
            </p>
            <p className="text-xs text-gray-500">Vistas</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {invitation.stats.rsvps}
            </p>
            <p className="text-xs text-gray-500">RSVPs</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className={`w-4 h-4 ${getPerformanceColor(responseRate)}`} />
            </div>
            <p className={`text-lg font-semibold ${getPerformanceColor(responseRate)}`}>
              {responseRate}%
            </p>
            <p className="text-xs text-gray-500">Respuesta</p>
          </div>
        </div>

        {/* Engagement Summary */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Share2 className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">Compartidas:</span>
              <span className="font-medium text-gray-900">{invitation.stats.shares}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">Únicos:</span>
              <span className="font-medium text-gray-900">{invitation.stats.visitors}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView(invitation)}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Analíticas
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare?.(invitation)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(invitation)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar invitación
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => window.open(invitation.full_url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir invitación
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => {
                  navigator.clipboard.writeText(invitation.full_url);
                  // TODO: Add toast notification
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar enlace
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Link2 className="w-4 h-4 mr-2" />
                Gestionar URLs
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(invitation)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Descargar QR
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(invitation)}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archivar
                </DropdownMenuItem>
              )}
              
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(invitation)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}