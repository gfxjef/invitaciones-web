/**
 * Template Library Component
 * 
 * WHY: Comprehensive template browsing and management interface
 * with categorization, search, favorites, and usage tracking.
 * 
 * WHAT: Template discovery and organization system with advanced
 * filtering, preview capabilities, and integration with creation workflow.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Heart,
  Calendar,
  Baby,
  Users,
  Crown,
  Sparkles,
  TrendingUp,
  Clock,
  Bookmark,
  Eye,
  Download,
  ShoppingCart,
  Check,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { templatesApi, type Template } from '@/lib/api';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'name' | 'category';
type FilterCategory = 'all' | 'boda' | 'quince' | 'bautizo' | 'cumpleanos' | 'baby_shower' | 'otro';
type FilterType = 'all' | 'free' | 'premium' | 'favorites';

interface TemplateWithStats extends Template {
  usage_count?: number;
  is_favorite?: boolean;
  popularity_score?: number;
  tags?: string[];
}

// Mock enhanced templates data
const mockTemplates: TemplateWithStats[] = [
  {
    id: 1,
    name: 'Elegancia Rosa',
    description: 'Diseño elegante con tonos rosados, perfecto para bodas románticas',
    category: 'boda',
    preview_image_url: '/api/placeholder/400/300',
    thumbnail_url: '/api/placeholder/200/150',
    is_premium: true,
    is_active: true,
    display_order: 1,
    supported_features: ['rsvp', 'gallery', 'timeline', 'location', 'music'],
    default_colors: { primary: '#EC4899', secondary: '#F9A8D4', accent: '#BE185D' },
    price: 290,
    currency: 'PEN',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-07-01T14:30:00Z',
    usage_count: 45,
    is_favorite: true,
    popularity_score: 92,
    tags: ['elegante', 'rosa', 'romántico', 'floral']
  },
  {
    id: 2,
    name: 'Clásico Dorado',
    description: 'Diseño tradicional con detalles dorados, ideal para celebraciones especiales',
    category: 'quince',
    preview_image_url: '/api/placeholder/400/300',
    thumbnail_url: '/api/placeholder/200/150',
    is_premium: false,
    is_active: true,
    display_order: 2,
    supported_features: ['rsvp', 'gallery', 'music'],
    default_colors: { primary: '#F59E0B', secondary: '#FEF3C7', accent: '#DC2626' },
    created_at: '2024-02-20T09:15:00Z',
    updated_at: '2024-06-15T11:45:00Z',
    usage_count: 28,
    is_favorite: false,
    popularity_score: 78,
    tags: ['clásico', 'dorado', 'elegante', 'quinceañera']
  },
  {
    id: 3,
    name: 'Vintage Floral',
    description: 'Estilo vintage con elementos florales delicados',
    category: 'baby_shower',
    preview_image_url: '/api/placeholder/400/300',
    thumbnail_url: '/api/placeholder/200/150',
    is_premium: true,
    is_active: true,
    display_order: 3,
    supported_features: ['rsvp', 'gifts', 'photos', 'timeline'],
    default_colors: { primary: '#10B981', secondary: '#D1FAE5', accent: '#059669' },
    price: 190,
    currency: 'PEN',
    created_at: '2024-03-10T16:20:00Z',
    updated_at: '2024-07-20T08:30:00Z',
    usage_count: 34,
    is_favorite: true,
    popularity_score: 85,
    tags: ['vintage', 'floral', 'suave', 'bebé']
  },
  {
    id: 4,
    name: 'Moderno Minimalista',
    description: 'Diseño limpio y moderno con líneas simples',
    category: 'cumpleanos',
    preview_image_url: '/api/placeholder/400/300',
    thumbnail_url: '/api/placeholder/200/150',
    is_premium: false,
    is_active: true,
    display_order: 4,
    supported_features: ['rsvp', 'location', 'music'],
    default_colors: { primary: '#6366F1', secondary: '#E0E7FF', accent: '#4F46E5' },
    created_at: '2024-04-05T12:30:00Z',
    updated_at: '2024-05-10T15:20:00Z',
    usage_count: 19,
    is_favorite: false,
    popularity_score: 65,
    tags: ['moderno', 'minimalista', 'limpio', 'simple']
  }
];

const CATEGORY_LABELS = {
  all: 'Todas las categorías',
  boda: 'Bodas',
  quince: 'XV Años',
  bautizo: 'Bautizos',
  cumpleanos: 'Cumpleaños',
  baby_shower: 'Baby Showers',
  otro: 'Otros eventos'
};

const TYPE_LABELS = {
  all: 'Todas',
  free: 'Gratuitas',
  premium: 'Premium',
  favorites: 'Favoritas'
};

const SORT_LABELS = {
  popular: 'Más populares',
  newest: 'Más recientes',
  name: 'Nombre A-Z',
  category: 'Categoría'
};

export default function TemplateLibrary() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await templatesApi.getTemplates({
      //   page: 1,
      //   per_page: 100,
      //   category: filterCategory !== 'all' ? filterCategory : undefined,
      //   is_premium: filterType === 'premium' ? true : filterType === 'free' ? false : undefined
      // });
      // setTemplates(response.templates);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 800));
      setTemplates(mockTemplates);
    } catch (error) {
      toast.error('Error cargando plantillas');
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedTemplates = templates
    .filter(template => {
      // Search filter
      const matchesSearch = !searchQuery.trim() || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Category filter
      if (filterCategory !== 'all' && template.category !== filterCategory) {
        return false;
      }

      // Type filter
      switch (filterType) {
        case 'free':
          return !template.is_premium;
        case 'premium':
          return template.is_premium;
        case 'favorites':
          return template.is_favorite;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.popularity_score || 0) - (a.popularity_score || 0);
        case 'newest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const getEventTypeIcon = (category: string) => {
    switch (category) {
      case 'boda': return Heart;
      case 'quince': return Star;
      case 'bautizo': return Users;
      case 'cumpleanos': return Calendar;
      case 'baby_shower': return Baby;
      default: return Sparkles;
    }
  };

  const formatCurrency = (amount: number) => `S/ ${amount}`;

  const handleToggleFavorite = async (template: TemplateWithStats) => {
    try {
      // TODO: Implement API call
      const updatedTemplates = templates.map(t => 
        t.id === template.id ? { ...t, is_favorite: !t.is_favorite } : t
      );
      setTemplates(updatedTemplates);
      
      toast.success(
        template.is_favorite ? 'Eliminado de favoritos' : 'Agregado a favoritos'
      );
    } catch (error) {
      toast.error('Error actualizando favoritos');
    }
  };

  const handleUseTemplate = (template: TemplateWithStats) => {
    router.push(`/plantillas/${template.id}`);
  };

  const handlePreviewTemplate = (template: TemplateWithStats) => {
    window.open(`/plantillas/${template.id}/preview`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Plantillas</h1>
            <p className="text-gray-600">Explora y descubre plantillas para tu evento</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Plantillas</h1>
          <p className="text-gray-600">
            {filteredAndSortedTemplates.length} plantilla{filteredAndSortedTemplates.length !== 1 ? 's' : ''} disponibles
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
        </div>
      </div>

      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Categoría</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterCategory('all');
                setFilterType('all');
                setSearchQuery('');
                setSortBy('popular');
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Templates Display */}
      {filteredAndSortedTemplates.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-12 h-12 text-gray-400" />}
          title="No se encontraron plantillas"
          description="Intenta ajustar los filtros o términos de búsqueda"
          action={
            <Button onClick={() => {
              setFilterCategory('all');
              setFilterType('all');
              setSearchQuery('');
            }}>
              Ver todas las plantillas
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedTemplates.map((template) => {
            const EventIcon = getEventTypeIcon(template.category);
            
            return (
              <div key={template.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 group">
                {/* Template Preview */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-t-lg overflow-hidden">
                  {/* Premium Badge */}
                  {template.is_premium && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </Badge>
                    </div>
                  )}

                  {/* Favorite Toggle */}
                  <div className="absolute top-3 right-3 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1 bg-white/80 backdrop-blur-sm ${
                        template.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                      } hover:text-yellow-500`}
                      onClick={() => handleToggleFavorite(template)}
                    >
                      <Star className={`w-4 h-4 ${template.is_favorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  {/* Event Type Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <EventIcon className="w-16 h-16 text-purple-600 opacity-30" />
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 text-gray-900 hover:bg-white"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Vista previa
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Category Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium">
                      {CATEGORY_LABELS[template.category as keyof typeof CATEGORY_LABELS]?.replace('s', '') || template.category}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Template Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.supported_features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature === 'rsvp' ? 'RSVP' : 
                           feature === 'gallery' ? 'Galería' :
                           feature === 'music' ? 'Música' :
                           feature === 'timeline' ? 'Cronograma' :
                           feature === 'location' ? 'Ubicación' :
                           feature}
                        </Badge>
                      ))}
                      {template.supported_features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.supported_features.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Usage Stats */}
                    {template.usage_count && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <TrendingUp className="w-3 h-3" />
                        <span>{template.usage_count} personas han usado esta plantilla</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      {template.is_premium ? (
                        <p className="text-lg font-bold text-purple-600">
                          {formatCurrency(template.price || 0)}
                        </p>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Gratuita
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {template.is_premium ? 'Comprar' : 'Usar plantilla'}
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
                    Plantilla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Popularidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedTemplates.map((template) => {
                  const EventIcon = getEventTypeIcon(template.category);
                  
                  return (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <EventIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{template.name}</p>
                            <p className="text-sm text-gray-600">{template.description}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {template.is_favorite && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                              {template.is_premium && (
                                <Crown className="w-3 h-3 text-yellow-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {CATEGORY_LABELS[template.category as keyof typeof CATEGORY_LABELS]?.replace('s', '') || template.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {template.is_premium ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Premium
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Gratuita
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          {template.usage_count} usos
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.is_premium ? formatCurrency(template.price || 0) : 'Gratis'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            Vista previa
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {template.is_premium ? 'Comprar' : 'Usar'}
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