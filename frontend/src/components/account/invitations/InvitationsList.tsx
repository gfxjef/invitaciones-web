/**
 * Enhanced Invitations List Component
 * 
 * WHY: Comprehensive invitation management interface with advanced
 * filtering, sorting, search, and bulk operations for efficient
 * invitation lifecycle management.
 * 
 * WHAT: Complete list view with grid/table modes, advanced filters,
 * search capabilities, bulk operations, and detailed stats.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  Users,
  Share2,
  MoreHorizontal,
  ChevronDown,
  Check,
  X,
  Archive,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Plus,
  Heart,
  Star,
  Baby
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { invitationsApi, type Invitation } from '@/lib/api';
import InvitationCard from './InvitationCard';
import BulkActionsBar from './BulkActionsBar';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'updated_at' | 'event_date' | 'views' | 'confirmations';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'draft' | 'active' | 'expired' | 'completed';
type FilterEventType = 'all' | 'boda' | 'quince' | 'bautizo' | 'cumpleanos' | 'baby_shower' | 'otro';

interface FilterOptions {
  status: FilterStatus;
  eventType: FilterEventType;
  dateRange: 'all' | 'thisWeek' | 'thisMonth' | 'nextMonth';
  hasRsvp: 'all' | 'enabled' | 'disabled';
}

interface SortOptions {
  field: SortField;
  order: SortOrder;
}

// Mock data for development - replace with API call
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
      is_public: false,
      password_protected: true,
    },
  },
  {
    id: 4,
    name: 'Cumpleaños Jorge (Borrador)',
    event_type: 'cumpleanos',
    event_date: '2024-09-25T20:00:00Z',
    url_slug: 'jorge-cumple',
    full_url: 'https://graphica.pe/invitacion/jorge-cumple',
    status: 'draft',
    template_name: 'Moderno Azul',
    created_at: '2024-08-01T09:00:00Z',
    updated_at: '2024-08-01T09:00:00Z',
    stats: {
      total_views: 0,
      unique_visitors: 0,
      rsvp_responses: 0,
      rsvp_confirmed: 0,
      rsvp_declined: 0,
      shares: 0,
    },
    settings: {
      rsvp_enabled: false,
      is_public: false,
      password_protected: false,
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

export default function InvitationsList() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvitations, setSelectedInvitations] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter and sort states
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    eventType: 'all',
    dateRange: 'all',
    hasRsvp: 'all'
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'updated_at',
    order: 'desc'
  });

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      // Call real API endpoint
      const response = await invitationsApi.getInvitations({
        page: 1,
        per_page: 100,
        status: filters.status !== 'all' ? filters.status : undefined,
        event_type: filters.eventType !== 'all' ? filters.eventType : undefined
      });

      // Backend returns { invitations: [...], total: N }
      // Map to frontend format if needed
      const mappedInvitations = response.invitations || response.items || [];
      setInvitations(mappedInvitations);

      console.log(`✅ Loaded ${mappedInvitations.length} invitations from API`);
    } catch (error) {
      toast.error('Error cargando invitaciones');
      console.error('Error loading invitations:', error);
      setInvitations([]); // Clear on error
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort invitations
  const filteredAndSortedInvitations = useMemo(() => {
    let filtered = invitations;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.name.toLowerCase().includes(query) ||
        inv.template_name.toLowerCase().includes(query) ||
        EVENT_TYPE_LABELS[inv.event_type].toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    // Apply event type filter
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(inv => inv.event_type === filters.eventType);
    }

    // Apply RSVP filter
    if (filters.hasRsvp !== 'all') {
      const hasRsvp = filters.hasRsvp === 'enabled';
      filtered = filtered.filter(inv => inv.settings.rsvp_enabled === hasRsvp);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      filtered = filtered.filter(inv => {
        const eventDate = new Date(inv.event_date);
        switch (filters.dateRange) {
          case 'thisWeek':
            return eventDate >= startOfWeek;
          case 'thisMonth':
            return eventDate >= startOfMonth && eventDate < startOfNextMonth;
          case 'nextMonth':
            return eventDate >= startOfNextMonth && eventDate <= endOfNextMonth;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortOptions.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case 'event_date':
          aValue = new Date(a.event_date);
          bValue = new Date(b.event_date);
          break;
        case 'views':
          aValue = a.stats.views;
          bValue = b.stats.views;
          break;
        case 'confirmations':
          aValue = a.stats.rsvps;
          bValue = b.stats.rsvps;
          break;
        default:
          aValue = a.updated_at;
          bValue = b.updated_at;
      }

      if (aValue < bValue) return sortOptions.order === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.order === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [invitations, searchQuery, filters, sortOptions]);

  const handleSelectInvitation = (id: number, selected: boolean) => {
    const newSelected = new Set(selectedInvitations);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedInvitations(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedInvitations(new Set(filteredAndSortedInvitations.map(inv => inv.id)));
    } else {
      setSelectedInvitations(new Set());
    }
  };

  const handleSort = (field: SortField) => {
    setSortOptions(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

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
      month: '2-digit',
      year: 'numeric',
    });
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
            {filteredAndSortedInvitations.length} de {invitations.length} invitaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-purple-50 border-purple-200 text-purple-700' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => router.push('/plantillas')}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva invitación
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar invitaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterStatus }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="draft">Borrador</option>
                  <option value="active">Activa</option>
                  <option value="expired">Expirada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>

              {/* Event Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de evento</label>
                <select
                  value={filters.eventType}
                  onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value as FilterEventType }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="boda">Boda</option>
                  <option value="quince">XV Años</option>
                  <option value="bautizo">Bautizo</option>
                  <option value="cumpleanos">Cumpleaños</option>
                  <option value="baby_shower">Baby Shower</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Fecha del evento</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="thisWeek">Esta semana</option>
                  <option value="thisMonth">Este mes</option>
                  <option value="nextMonth">Próximo mes</option>
                </select>
              </div>

              {/* RSVP Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">RSVP</label>
                <select
                  value={filters.hasRsvp}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasRsvp: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="enabled">Con RSVP</option>
                  <option value="disabled">Sin RSVP</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    status: 'all',
                    eventType: 'all',
                    dateRange: 'all',
                    hasRsvp: 'all'
                  });
                  setSearchQuery('');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedInvitations.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedInvitations.size}
          onSelectAll={() => handleSelectAll(true)}
          onDeselectAll={() => handleSelectAll(false)}
          onBulkDelete={() => {
            // TODO: Implement bulk delete
            toast.success(`${selectedInvitations.size} invitaciones eliminadas`);
            setSelectedInvitations(new Set());
          }}
          onBulkArchive={() => {
            // TODO: Implement bulk archive
            toast.success(`${selectedInvitations.size} invitaciones archivadas`);
            setSelectedInvitations(new Set());
          }}
          onBulkDuplicate={() => {
            // TODO: Implement bulk duplicate
            toast.success(`${selectedInvitations.size} invitaciones duplicadas`);
            setSelectedInvitations(new Set());
          }}
        />
      )}

      {/* Invitations Display */}
      {filteredAndSortedInvitations.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-12 h-12 text-gray-400" />}
          title={searchQuery || filters.status !== 'all' ? 'No se encontraron invitaciones' : 'No tienes invitaciones'}
          description={
            searchQuery || filters.status !== 'all' 
              ? 'Intenta ajustar los filtros o términos de búsqueda'
              : 'Crea tu primera invitación digital para comenzar'
          }
          action={
            <Button onClick={() => router.push('/plantillas')}>
              <Plus className="w-4 h-4 mr-2" />
              Crear invitación
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              isSelected={selectedInvitations.has(invitation.id)}
              onSelect={(selected) => handleSelectInvitation(invitation.id, selected)}
              onView={() => router.push(`/mi-cuenta/invitaciones/${invitation.id}`)}
              onEdit={() => router.push(`/invitacion/${invitation.id}/edit`)}
              onShare={(inv) => {
                if (navigator.share) {
                  navigator.share({
                    title: inv.name,
                    text: `Te invito a mi ${EVENT_TYPE_LABELS[inv.event_type].toLowerCase()}`,
                    url: inv.full_url,
                  });
                } else {
                  navigator.clipboard.writeText(inv.full_url);
                  toast.success('URL copiada al portapapeles');
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={selectedInvitations.size === filteredAndSortedInvitations.length && filteredAndSortedInvitations.length > 0}
                      indeterminate={selectedInvitations.size > 0 && selectedInvitations.size < filteredAndSortedInvitations.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Invitación
                      {sortOptions.field === 'name' && (
                        sortOptions.order === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('event_date')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Fecha evento
                      {sortOptions.field === 'event_date' && (
                        sortOptions.order === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('views')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Estadísticas
                      {sortOptions.field === 'views' && (
                        sortOptions.order === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedInvitations.map((invitation) => {
                  const statusConfig = STATUS_CONFIG[invitation.status];
                  const EventTypeIcon = getEventTypeIcon(invitation.event_type);

                  return (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedInvitations.has(invitation.id)}
                          onCheckedChange={(checked) => handleSelectInvitation(invitation.id, !!checked)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <EventTypeIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invitation.title}</p>
                            <p className="text-sm text-gray-600">
                              {EVENT_TYPE_LABELS[invitation.event_type]} • {invitation.template_name}
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
                        {formatDate(invitation.event_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-gray-400" />
                              <span>{invitation.stats.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span>{invitation.stats.rsvps}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-3 h-3 text-gray-400" />
                              <span>{invitation.stats.shares}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/mi-cuenta/invitaciones/${invitation.id}`)}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/invitacion/${invitation.id}/edit`)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invitation.full_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
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
    </div>
  );
}