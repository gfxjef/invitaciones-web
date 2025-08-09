/**
 * Invitation URLs Management Page (/mi-cuenta/invitaciones/[id]/urls)
 * 
 * WHY: Dedicated page for comprehensive URL management for a specific invitation.
 * Provides full-featured interface for creating, editing, and analyzing URLs.
 * 
 * WHAT: Complete URL management interface with advanced features like bulk
 * operations, detailed analytics, QR code management, and export capabilities.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Link2, 
  ArrowLeft, 
  Plus,
  Download,
  Share2,
  BarChart3,
  QrCode,
  Settings,
  AlertCircle,
  FileText,
  Users,
  Eye,
  TrendingUp,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { URLList } from '@/components/invitations/url-list';
import { URLForm } from '@/components/invitations/url-form';
import { BulkCopyButton } from '@/components/ui/copy-button';
import { QRCodeGrid } from '@/components/ui/qr-code';
import { useInvitationURLs, useURLCreationValidation } from '@/lib/hooks/use-invitation-urls';
import { InvitationURL } from '@/lib/api';
import toast from 'react-hot-toast';

// Mock invitation data - in real app, this would come from API
const mockInvitation = {
  id: 1,
  name: 'Boda María & Carlos',
  event_type: 'boda',
  event_date: '2024-09-15T18:00:00Z',
  status: 'active',
  template_name: 'Elegancia Rosa',
};

type ViewMode = 'list' | 'grid' | 'qr-codes' | 'analytics';

export default function InvitationURLsPage() {
  const router = useRouter();
  const params = useParams();
  const invitationId = parseInt(params.id as string);
  
  const [invitation, setInvitation] = useState(mockInvitation);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    data: urls = [], 
    isLoading: urlsLoading,
    error: urlsError
  } = useInvitationURLs(invitationId);

  const { 
    canCreate, 
    userPlan, 
    currentCount, 
    isLoading: validationLoading 
  } = useURLCreationValidation(invitationId);

  useEffect(() => {
    // In real app, load invitation data from API
    // loadInvitation(invitationId);
  }, [invitationId]);

  const getStatsOverview = () => {
    if (!urls.length) return null;

    const totalVisits = urls.reduce((sum, url) => sum + url.visit_count, 0);
    const activeUrls = urls.filter(url => url.is_active).length;
    const lastVisited = urls
      .filter(url => url.last_visited_at)
      .sort((a, b) => new Date(b.last_visited_at!).getTime() - new Date(a.last_visited_at!).getTime())[0];

    return {
      totalUrls: urls.length,
      activeUrls,
      totalVisits,
      lastVisited: lastVisited?.last_visited_at || null,
    };
  };

  const handleExportAllURLs = () => {
    const exportData = {
      invitation: {
        id: invitation.id,
        name: invitation.name,
        event_type: invitation.event_type,
      },
      urls: urls.map(url => ({
        id: url.id,
        title: url.title,
        short_code: url.short_code,
        short_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://graphica.pe'}/r/${url.short_code}`,
        original_url: url.original_url,
        is_active: url.is_active,
        visit_count: url.visit_count,
        created_at: url.created_at,
        last_visited_at: url.last_visited_at,
      })),
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invitation-urls-${invitation.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('URLs exportadas exitosamente');
  };

  const handleBulkShare = () => {
    const urlsToShare = urls
      .filter(url => url.is_active)
      .map(url => ({
        title: url.title,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://graphica.pe'}/r/${url.short_code}`,
      }));

    if (urlsToShare.length === 0) {
      toast.error('No hay URLs activas para compartir');
      return;
    }

    const message = `🎊 ${invitation.name}\n\n` + 
                   urlsToShare.map(({ title, url }) => `📎 ${title}: ${url}`).join('\n\n') +
                   `\n\n¡Espero contar con tu presencia! 💖`;

    if (navigator.share) {
      navigator.share({
        title: `URLs para ${invitation.name}`,
        text: message,
      });
    } else {
      navigator.clipboard.writeText(message);
      toast.success('URLs copiadas al portapapeles');
    }
  };

  const stats = getStatsOverview();

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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/mi-cuenta/invitaciones/${invitationId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">URLs Únicas</h1>
                <p className="text-gray-600">
                  {invitation.name} • {urlsLoading ? 'Cargando...' : `${urls.length} URL${urls.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <FileText className="w-4 h-4 mr-1" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Tarjetas
            </Button>
            <Button
              variant={viewMode === 'qr-codes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('qr-codes')}
              className="px-3"
            >
              <QrCode className="w-4 h-4 mr-1" />
              QR
            </Button>
          </div>

          {/* Actions */}
          {urls.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleExportAllURLs}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir todas
              </Button>
            </>
          )}

          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={!canCreate.allowed && !validationLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva URL
          </Button>
        </div>
      </div>

      {/* Plan Status */}
      {!validationLoading && (
        <div className={`p-4 rounded-lg border ${
          canCreate.allowed 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-1 rounded-full ${
              canCreate.allowed ? 'bg-blue-600' : 'bg-orange-600'
            }`}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div>
              <p className={`text-sm font-medium ${
                canCreate.allowed ? 'text-blue-800' : 'text-orange-800'
              }`}>
                Plan {userPlan?.name || 'Desconocido'}
              </p>
              <p className={`text-sm ${
                canCreate.allowed ? 'text-blue-700' : 'text-orange-700'
              }`}>
                {canCreate.reason}
              </p>
              {userPlan && (
                <p className="text-xs text-gray-600 mt-1">
                  Límite: {userPlan.max_urls_per_invitation} URL{userPlan.max_urls_per_invitation > 1 ? 's' : ''} por invitación
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Link2 className="w-6 h-6 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalUrls}
              </span>
            </div>
            <p className="text-sm text-gray-600">URLs creadas</p>
            <p className="text-xs text-gray-500">
              {stats.activeUrls} activas
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.totalVisits}
              </span>
            </div>
            <p className="text-sm text-gray-600">Visitas totales</p>
            <p className="text-xs text-gray-500">
              Entre todas las URLs
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="text-lg font-bold text-gray-900">
                {stats.totalVisits > 0 ? Math.round(stats.totalVisits / stats.totalUrls) : 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Promedio visitas</p>
            <p className="text-xs text-gray-500">
              Por URL
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-bold text-gray-900">
                {stats.lastVisited 
                  ? new Date(stats.lastVisited).toLocaleDateString('es-PE', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })
                  : 'Nunca'
                }
              </span>
            </div>
            <p className="text-sm text-gray-600">Última visita</p>
            <p className="text-xs text-gray-500">
              Más reciente
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {urlsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Error al cargar URLs</h3>
              <p className="text-sm text-red-700 mt-1">
                No se pudieron cargar las URLs de esta invitación. Intenta recargar la página.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {!urlsError && (
        <>
          {viewMode === 'list' && (
            <URLList
              invitationId={invitationId}
              invitationName={invitation.name}
            />
          )}

          {viewMode === 'grid' && (
            <URLList
              invitationId={invitationId}
              invitationName={invitation.name}
            />
          )}

          {viewMode === 'qr-codes' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Códigos QR</h3>
                    <p className="text-gray-600">
                      Descarga o comparte los códigos QR de tus URLs
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement bulk QR download
                        toast('Descarga masiva próximamente');
                      }}
                      disabled={urls.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar todos
                    </Button>
                  </div>
                </div>

                {urlsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : urls.length > 0 ? (
                  <QRCodeGrid
                    qrCodes={urls
                      .filter(url => url.is_active)
                      .map(url => ({
                        shortCode: url.short_code,
                        title: url.title,
                      }))
                    }
                    size="md"
                    showDownload={true}
                  />
                ) : (
                  <div className="text-center py-12">
                    <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No hay URLs para mostrar
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Crea tu primera URL única para generar códigos QR
                    </p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      disabled={!canCreate.allowed}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear URL
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bulk Copy Actions */}
          {urls.length > 0 && viewMode !== 'qr-codes' && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Acciones masivas</h4>
                  <p className="text-sm text-gray-600">
                    Operaciones rápidas con todas las URLs activas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <BulkCopyButton
                    urls={urls
                      .filter(url => url.is_active)
                      .map(url => ({
                        title: url.title,
                        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://graphica.pe'}/r/${url.short_code}`,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkShare}
                    disabled={urls.filter(url => url.is_active).length === 0}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir todas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create URL Form */}
      <URLForm
        invitationId={invitationId}
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          setShowCreateForm(false);
          toast.success('URL creada exitosamente');
        }}
      />
    </div>
  );
}