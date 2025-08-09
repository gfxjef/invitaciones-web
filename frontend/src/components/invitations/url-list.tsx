/**
 * URL List Component
 * 
 * WHY: Displays and manages all invitation URLs in a organized list format.
 * Provides bulk operations, filtering, and comprehensive URL management.
 * 
 * WHAT: List component with search, filtering, sorting, and batch operations
 * for invitation URLs. Includes empty states and loading indicators.
 */

'use client';

import { useState, useMemo } from 'react';
import { 
  Link2, 
  Search, 
  Filter, 
  MoreVertical,
  Plus,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Share2,
  QrCode,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Grid3X3,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { URLCardList } from '@/components/ui/url-card';
import { CopyButton } from '@/components/ui/copy-button';
import { URLForm } from './url-form';
import { URLStatsModal } from './url-stats';
import { 
  useInvitationURLs,
  useDeleteInvitationURL,
  useToggleURLStatus,
  usePrefetchInvitationURL
} from '@/lib/hooks/use-invitation-urls';
import { InvitationURL } from '@/lib/api';

interface URLListProps {
  invitationId: number;
  invitationName?: string;
  className?: string;
}

type SortField = 'created_at' | 'title' | 'visit_count' | 'last_visited_at';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive';
type ViewMode = 'list' | 'grid';

interface URLListState {
  searchTerm: string;
  filterStatus: FilterStatus;
  sortField: SortField;
  sortOrder: SortOrder;
  selectedUrls: Set<number>;
  showForm: boolean;
  editingUrl: InvitationURL | null;
  viewingStatsUrl: InvitationURL | null;
  viewMode: ViewMode;
}

export function URLList({ 
  invitationId, 
  invitationName,
  className = '' 
}: URLListProps) {
  const [state, setState] = useState<URLListState>({
    searchTerm: '',
    filterStatus: 'all',
    sortField: 'created_at',
    sortOrder: 'desc',
    selectedUrls: new Set(),
    showForm: false,
    editingUrl: null,
    viewingStatsUrl: null,
    viewMode: 'list',
  });

  const { 
    data: urls = [], 
    isLoading, 
    error,
    refetch 
  } = useInvitationURLs(invitationId);

  const deleteURL = useDeleteInvitationURL();
  const toggleStatus = useToggleURLStatus();
  const { prefetchURL, prefetchURLStats } = usePrefetchInvitationURL();

  // Filtered and sorted URLs
  const filteredAndSortedUrls = useMemo(() => {
    let filtered = urls.filter((url) => {
      const matchesSearch = !state.searchTerm || 
        url.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        url.short_code.toLowerCase().includes(state.searchTerm.toLowerCase());
      
      const matchesStatus = state.filterStatus === 'all' ||
        (state.filterStatus === 'active' && url.is_active) ||
        (state.filterStatus === 'inactive' && !url.is_active);

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[state.sortField];
      let bValue: any = b[state.sortField];

      if (state.sortField === 'created_at' || state.sortField === 'last_visited_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [urls, state.searchTerm, state.filterStatus, state.sortField, state.sortOrder]);

  const updateState = (updates: Partial<URLListState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleSort = (field: SortField) => {
    updateState({
      sortField: field,
      sortOrder: state.sortField === field && state.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleSelectUrl = (urlId: number, selected: boolean) => {
    const newSelected = new Set(state.selectedUrls);
    if (selected) {
      newSelected.add(urlId);
    } else {
      newSelected.delete(urlId);
    }
    updateState({ selectedUrls: newSelected });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      updateState({ selectedUrls: new Set(filteredAndSortedUrls.map(u => u.id)) });
    } else {
      updateState({ selectedUrls: new Set() });
    }
  };

  const handleBulkToggleStatus = async () => {
    const urlsToToggle = filteredAndSortedUrls.filter(url => 
      state.selectedUrls.has(url.id)
    );

    for (const url of urlsToToggle) {
      try {
        await toggleStatus.mutateAsync(url.id);
      } catch (error) {
        console.error(`Error toggling URL ${url.id}:`, error);
      }
    }

    updateState({ selectedUrls: new Set() });
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${state.selectedUrls.size} URLs? Esta acción no se puede deshacer.`)) {
      return;
    }

    const urlsToDelete = Array.from(state.selectedUrls);
    for (const urlId of urlsToDelete) {
      try {
        await deleteURL.mutateAsync(urlId);
      } catch (error) {
        console.error(`Error deleting URL ${urlId}:`, error);
      }
    }

    updateState({ selectedUrls: new Set() });
  };

  const handleEdit = (url: InvitationURL) => {
    updateState({ editingUrl: url, showForm: true });
  };

  const handleDelete = async (url: InvitationURL) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la URL "${url.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteURL.mutateAsync(url.id);
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  const handleToggleStatus = async (url: InvitationURL) => {
    try {
      await toggleStatus.mutateAsync(url.id);
    } catch (error) {
      console.error('Error toggling URL status:', error);
    }
  };

  const handleViewStats = (url: InvitationURL) => {
    prefetchURLStats(url.id);
    updateState({ viewingStatsUrl: url });
  };

  const handleMouseEnterUrl = (url: InvitationURL) => {
    prefetchURL(url.id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle2 : EyeOff;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-red-600 bg-red-50 border-red-200';
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error al cargar URLs</h3>
            <p className="text-sm text-red-700 mt-1">
              No se pudieron cargar las URLs de la invitación. Intenta recargar la página.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">URLs Únicas</h2>
          <p className="text-gray-600">
            {invitationName && `Para: ${invitationName} • `}
            {isLoading ? 'Cargando...' : `${urls.length} URL${urls.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={state.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateState({ viewMode: 'list' })}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateState({ viewMode: 'grid' })}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={() => updateState({ showForm: true, editingUrl: null })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear URL
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o código..."
            value={state.searchTerm}
            onChange={(e) => updateState({ searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={state.filterStatus}
          onChange={(e) => updateState({ filterStatus: e.target.value as FilterStatus })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>

        {/* Sort */}
        <select
          value={`${state.sortField}-${state.sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
            updateState({ sortField: field, sortOrder: order });
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="created_at-desc">Más reciente</option>
          <option value="created_at-asc">Más antigua</option>
          <option value="title-asc">Título A-Z</option>
          <option value="title-desc">Título Z-A</option>
          <option value="visit_count-desc">Más visitas</option>
          <option value="visit_count-asc">Menos visitas</option>
          <option value="last_visited_at-desc">Visitada reciente</option>
          <option value="last_visited_at-asc">Visitada antigua</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {state.selectedUrls.size > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-purple-900">
                {state.selectedUrls.size} URL{state.selectedUrls.size !== 1 ? 's' : ''} seleccionada{state.selectedUrls.size !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateState({ selectedUrls: new Set() })}
                className="text-purple-700 hover:text-purple-800"
              >
                Deseleccionar
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkToggleStatus}
                disabled={toggleStatus.isPending}
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Eye className="w-4 h-4 mr-1" />
                Cambiar estado
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteURL.isPending}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && urls.length === 0 && (
        <EmptyState
          icon={<Link2 className="w-12 h-12 text-gray-400" />}
          title="No hay URLs creadas"
          description="Crea tu primera URL única para compartir tu invitación de forma personalizada"
          action={
            <Button onClick={() => updateState({ showForm: true, editingUrl: null })}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera URL
            </Button>
          }
        />
      )}

      {/* URLs Display */}
      {!isLoading && filteredAndSortedUrls.length > 0 && (
        <>
          {state.viewMode === 'grid' ? (
            <URLCardList
              urls={filteredAndSortedUrls}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onViewStats={handleViewStats}
              compact={true}
            />
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={state.selectedUrls.size === filteredAndSortedUrls.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="grid grid-cols-12 gap-4 flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        URL
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-2">
                      <button
                        onClick={() => handleSort('visit_count')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Visitas
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => handleSort('last_visited_at')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Última visita
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="col-span-2">Acciones</div>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredAndSortedUrls.map((url) => (
                  <div
                    key={url.id}
                    onMouseEnter={() => handleMouseEnterUrl(url)}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={state.selectedUrls.has(url.id)}
                        onChange={(e) => handleSelectUrl(url.id, e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      
                      <div className="grid grid-cols-12 gap-4 flex-1">
                        {/* URL Info */}
                        <div className="col-span-4 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <p className="font-medium text-gray-900 truncate">
                              {url.title}
                            </p>
                          </div>
                          <p className="text-sm font-mono text-gray-600 truncate">
                            /r/{url.short_code}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <Badge 
                            variant="outline"
                            className={`${getStatusColor(url.is_active)}`}
                          >
                            {url.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>

                        {/* Visit Count */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {url.visit_count}
                            </span>
                          </div>
                        </div>

                        {/* Last Visited */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {formatDate(url.last_visited_at)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <CopyButton
                              text={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://graphica.pe'}/r/${url.short_code}`}
                              showText={false}
                              size="sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStats(url)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {/* TODO: Add dropdown menu */}}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && urls.length > 0 && filteredAndSortedUrls.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron URLs
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta cambiar los filtros o el término de búsqueda
          </p>
          <Button
            variant="outline"
            onClick={() => updateState({ searchTerm: '', filterStatus: 'all' })}
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* URL Form Modal */}
      <URLForm
        invitationId={invitationId}
        url={state.editingUrl || undefined}
        isOpen={state.showForm}
        onClose={() => updateState({ showForm: false, editingUrl: null })}
        onSuccess={() => {
          updateState({ showForm: false, editingUrl: null });
          refetch();
        }}
      />

      {/* Stats Modal */}
      {state.viewingStatsUrl && (
        <URLStatsModal
          url={state.viewingStatsUrl}
          isOpen={!!state.viewingStatsUrl}
          onClose={() => updateState({ viewingStatsUrl: null })}
        />
      )}
    </div>
  );
}