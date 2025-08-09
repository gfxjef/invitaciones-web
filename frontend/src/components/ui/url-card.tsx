/**
 * URL Card Component
 * 
 * WHY: Displays invitation URL information in a card format with stats,
 * QR code preview, and action buttons. Central component for URL management.
 * 
 * WHAT: Responsive card component showing URL details, visit statistics,
 * active status, and management actions with consistent styling.
 */

'use client';

import { useState } from 'react';
import { 
  Link2, 
  Eye, 
  Calendar, 
  QrCode, 
  MoreVertical,
  ExternalLink,
  Edit3,
  Power,
  Trash2,
  Share2,
  TrendingUp,
  Clock,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { QRCodeDisplay, QRCodeModal } from '@/components/ui/qr-code';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { InvitationURL, VisitStats } from '@/lib/api';

interface URLCardProps {
  url: InvitationURL;
  stats?: VisitStats;
  onEdit?: (url: InvitationURL) => void;
  onDelete?: (url: InvitationURL) => void;
  onToggleStatus?: (url: InvitationURL) => void;
  onViewStats?: (url: InvitationURL) => void;
  showQR?: boolean;
  compact?: boolean;
  className?: string;
}

export function URLCard({
  url,
  stats,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewStats,
  showQR = true,
  compact = false,
  className = '',
}: URLCardProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://graphica.pe';
  const shortUrl = `${baseUrl}/r/${url.short_code}`;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      default: return Monitor;
    }
  };

  if (compact) {
    return (
      <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <h3 className="font-medium text-gray-900 truncate">{url.title}</h3>
              <Badge 
                variant="outline" 
                className={`text-xs ${url.is_active ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-700 bg-red-50'}`}
              >
                {url.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 font-mono truncate">{shortUrl}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {url.visit_count} visitas
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(url.last_visited_at)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <CopyButton text={shortUrl} showText={false} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(shortUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 truncate">{url.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Creada el {formatTime(url.created_at)}
              </p>
              <Badge 
                variant="outline" 
                className={`${url.is_active ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-700 bg-red-50'}`}
              >
                {url.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActionsMenu(!showActionsMenu)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(url);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                  {onToggleStatus && (
                    <button
                      onClick={() => {
                        onToggleStatus(url);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      {url.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                  {onViewStats && (
                    <button
                      onClick={() => {
                        onViewStats(url);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Ver estadísticas
                    </button>
                  )}
                  {onDelete && (
                    <>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          onDelete(url);
                          setShowActionsMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - URL & Stats */}
            <div className="space-y-4">
              {/* URL Display */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  URL corta
                </label>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-sm font-mono text-gray-900 break-all mb-2">
                    {shortUrl}
                  </p>
                  <div className="flex items-center gap-2">
                    <CopyButton text={shortUrl} size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(shortUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: url.title,
                            url: shortUrl,
                          });
                        } else {
                          navigator.clipboard.writeText(shortUrl);
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Original URL */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  URL original
                </label>
                <p className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded border">
                  {url.original_url}
                </p>
              </div>

              {/* Basic Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-lg font-semibold text-blue-900">
                      {url.visit_count}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">Visitas totales</p>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      {formatDate(url.last_visited_at)}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">Última visita</p>
                </div>
              </div>

              {/* Advanced Stats (if available) */}
              {stats && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Estadísticas detalladas</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-lg font-semibold text-gray-900">{stats.unique_visits}</p>
                      <p className="text-xs text-gray-600">Visitantes únicos</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-lg font-semibold text-gray-900">
                        {stats.total_visits > 0 ? Math.round((stats.unique_visits / stats.total_visits) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-600">Tasa única</p>
                    </div>
                  </div>

                  {/* Device Breakdown */}
                  {stats.devices && Object.keys(stats.devices).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Dispositivos</p>
                      <div className="space-y-1">
                        {Object.entries(stats.devices).map(([device, count]) => {
                          const DeviceIcon = getDeviceIcon(device);
                          const percentage = stats.total_visits > 0 
                            ? Math.round((count / stats.total_visits) * 100) 
                            : 0;
                          
                          return (
                            <div key={device} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <DeviceIcon className="w-4 h-4 text-gray-500" />
                                <span className="capitalize">{device}</span>
                              </div>
                              <span className="font-medium">{count} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - QR Code */}
            {showQR && (
              <div className="flex flex-col items-center">
                <h4 className="font-medium text-gray-900 mb-4">Código QR</h4>
                <QRCodeDisplay
                  shortCode={url.short_code}
                  title={url.title}
                  size="md"
                  showDownload={true}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQRModal(true)}
                  className="mt-3"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Ver grande
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Click outside handler */}
        {showActionsMenu && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowActionsMenu(false)}
          />
        )}
      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shortCode={url.short_code}
        title={url.title}
        fullUrl={shortUrl}
      />
    </>
  );
}

/**
 * URL Card List Component
 * 
 * WHY: Displays multiple URL cards in a responsive layout.
 * Provides consistent spacing and empty state handling.
 */
interface URLCardListProps {
  urls: InvitationURL[];
  statsMap?: Record<number, VisitStats>;
  onEdit?: (url: InvitationURL) => void;
  onDelete?: (url: InvitationURL) => void;
  onToggleStatus?: (url: InvitationURL) => void;
  onViewStats?: (url: InvitationURL) => void;
  loading?: boolean;
  compact?: boolean;
  className?: string;
}

export function URLCardList({
  urls,
  statsMap = {},
  onEdit,
  onDelete,
  onToggleStatus,
  onViewStats,
  loading = false,
  compact = false,
  className = '',
}: URLCardListProps) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!urls.length) {
    return (
      <div className="text-center py-12">
        <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay URLs creadas
        </h3>
        <p className="text-gray-600">
          Crea tu primera URL única para compartir tu invitación
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {urls.map((url) => (
        <URLCard
          key={url.id}
          url={url}
          stats={statsMap[url.id]}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewStats={onViewStats}
          compact={compact}
        />
      ))}
    </div>
  );
}