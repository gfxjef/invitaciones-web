/**
 * URL Stats Component
 * 
 * WHY: Provides detailed analytics and statistics for invitation URLs.
 * Essential for users to understand engagement and track performance.
 * 
 * WHAT: Modal component displaying comprehensive URL statistics including
 * visit trends, device breakdown, geographic data, and export capabilities.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  X, 
  Download, 
  Share2,
  ExternalLink,
  TrendingUp,
  Users,
  Clock,
  Globe,
  Smartphone,
  RefreshCw,
  Calendar,
  Eye,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatsChart, CompactStats } from '@/components/ui/stats-chart';
import { CopyButton } from '@/components/ui/copy-button';
import { QRCodeDisplay } from '@/components/ui/qr-code';
import { useInvitationURLStats } from '@/lib/hooks/use-invitation-urls';
import { InvitationURL } from '@/lib/api';

interface URLStatsModalProps {
  url: InvitationURL;
  isOpen: boolean;
  onClose: () => void;
}

export function URLStatsModal({ url, isOpen, onClose }: URLStatsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'export'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch 
  } = useInvitationURLStats(url.id, { enabled: isOpen });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://graphica.pe';
  const shortUrl = `${baseUrl}/r/${url.short_code}`;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen && autoRefresh) {
      interval = setInterval(() => {
        refetch();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, autoRefresh, refetch]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCompactDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleExportStats = () => {
    if (!stats) return;

    const data = {
      url: {
        id: url.id,
        title: url.title,
        short_code: url.short_code,
        short_url: shortUrl,
        original_url: url.original_url,
        created_at: url.created_at,
        last_visited_at: url.last_visited_at,
      },
      statistics: stats,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url_download = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_download;
    link.download = `url-stats-${url.short_code}-${formatCompactDate(new Date().toISOString())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_download);
  };

  const handleShareStats = async () => {
    const message = `Estadísticas de "${url.title}":\n` +
                   `📊 ${stats?.total_visits || 0} visitas totales\n` +
                   `👥 ${stats?.unique_visits || 0} visitantes únicos\n` +
                   `🔗 ${shortUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Estadísticas - ${url.title}`,
          text: message,
        });
      } catch (error) {
        navigator.clipboard.writeText(message);
      }
    } else {
      navigator.clipboard.writeText(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-purple-600 rounded-lg p-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Estadísticas de URL
                </h2>
                <p className="text-gray-600 mb-2">{url.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Link2 className="w-4 h-4" />
                    <code className="font-mono">{shortUrl}</code>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Creada el {formatCompactDate(url.created_at)}
                  </div>
                  <Badge 
                    variant="outline"
                    className={url.is_active 
                      ? 'border-green-200 text-green-700 bg-green-50'
                      : 'border-red-200 text-red-700 bg-red-50'
                    }
                  >
                    {url.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Auto-actualizar
              </label>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex px-6">
            {[
              { id: 'overview', label: 'Resumen', icon: Eye },
              { id: 'details', label: 'Detalles', icon: BarChart3 },
              { id: 'export', label: 'Exportar', icon: Download },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error al cargar estadísticas
              </h3>
              <p className="text-gray-600 mb-4">
                No se pudieron cargar las estadísticas de esta URL.
              </p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Eye className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-900">
                          {url.visit_count}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">Visitas totales</p>
                      <p className="text-xs text-blue-600">
                        Desde {formatCompactDate(url.created_at)}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-bold text-green-900">
                          {stats?.unique_visits || 0}
                        </span>
                      </div>
                      <p className="text-sm text-green-700 font-medium">Visitantes únicos</p>
                      <p className="text-xs text-green-600">
                        {stats && stats.total_visits > 0 
                          ? Math.round((stats.unique_visits / stats.total_visits) * 100)
                          : 0}% de unicidad
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8 text-purple-600" />
                        <span className="text-sm font-bold text-purple-900">
                          {url.last_visited_at ? formatCompactDate(url.last_visited_at) : 'Nunca'}
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 font-medium">Última visita</p>
                      <p className="text-xs text-purple-600">
                        Hora: {url.last_visited_at 
                          ? new Date(url.last_visited_at).toLocaleTimeString('es-PE', { 
                              hour: '2-digit', minute: '2-digit' 
                            })
                          : '--:--'
                        }
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Globe className="w-8 h-8 text-orange-600" />
                        <span className="text-2xl font-bold text-orange-900">
                          {stats ? Object.keys(stats.countries).length : 0}
                        </span>
                      </div>
                      <p className="text-sm text-orange-700 font-medium">Países</p>
                      <p className="text-xs text-orange-600">
                        Alcance geográfico
                      </p>
                    </div>
                  </div>

                  {/* Compact Stats */}
                  {stats && (
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-4">Estadísticas rápidas</h3>
                        <CompactStats stats={stats} showDevices={true} />
                      </div>
                      
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-4">Código QR</h3>
                        <div className="flex justify-center">
                          <QRCodeDisplay
                            shortCode={url.short_code}
                            title={url.title}
                            size="md"
                            showDownload={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Acciones rápidas</h3>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton
                        text={shortUrl}
                        label="Copiar URL"
                        variant="outline"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(shortUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareStats}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir stats
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url.original_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver original
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && stats && (
                <StatsChart stats={stats} />
              )}

              {/* Export Tab */}
              {activeTab === 'export' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Exportar estadísticas
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Descarga los datos de tu URL en diferentes formatos para análisis externo.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                      <Button
                        onClick={handleExportStats}
                        disabled={!stats}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const csv = generateCSV(stats, url);
                          downloadCSV(csv, `url-stats-${url.short_code}`);
                        }}
                        disabled={!stats}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>

                  {/* Export Preview */}
                  {stats && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Vista previa de datos</h4>
                      <div className="bg-white border rounded p-3 font-mono text-xs overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify({
                            url_title: url.title,
                            short_code: url.short_code,
                            total_visits: stats.total_visits,
                            unique_visits: stats.unique_visits,
                            created_at: url.created_at,
                            last_visited: url.last_visited_at,
                            devices: stats.devices,
                            browsers: stats.browsers,
                            countries: stats.countries,
                          }, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact URL Stats Component
 * Shows minimal stats in a small card format
 */
interface CompactURLStatsProps {
  url: InvitationURL;
  className?: string;
}

export function CompactURLStats({ url, className = '' }: CompactURLStatsProps) {
  const { data: stats, isLoading } = useInvitationURLStats(url.id);

  if (isLoading) {
    return (
      <div className={`bg-white border rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 truncate">{url.title}</h3>
        <Badge 
          variant="outline"
          className={url.is_active 
            ? 'border-green-200 text-green-700 bg-green-50'
            : 'border-red-200 text-red-700 bg-red-50'
          }
        >
          {url.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>
      
      {stats ? (
        <CompactStats stats={stats} showDevices={false} />
      ) : (
        <div className="text-center py-4 text-gray-500">
          <BarChart3 className="w-6 h-6 mx-auto mb-1" />
          <p className="text-xs">Sin estadísticas</p>
        </div>
      )}
    </div>
  );
}

// Utility functions for export
function generateCSV(stats: any, url: InvitationURL): string {
  const headers = ['Fecha', 'Visitas'];
  const rows = stats.daily_visits.map((visit: any) => [visit.date, visit.visits]);
  
  const csvContent = [
    `# Estadísticas de URL: ${url.title}`,
    `# Código: ${url.short_code}`,
    `# Total visitas: ${stats.total_visits}`,
    `# Visitantes únicos: ${stats.unique_visits}`,
    '',
    headers.join(','),
    ...rows.map((row: any[]) => row.join(',')),
  ].join('\n');

  return csvContent;
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}