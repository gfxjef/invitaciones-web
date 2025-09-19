/**
 * My Templates Component
 * 
 * WHY: Manages user's personal template library including saved templates,
 * custom designs, and template creation from existing invitations.
 * 
 * WHAT: Template management interface with creation, editing, organization,
 * sharing capabilities, and usage analytics.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Star,
  Heart,
  Calendar,
  Baby,
  Users,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit3,
  Copy,
  Share2,
  Trash2,
  Eye,
  Download,
  Settings,
  Palette,
  Layout,
  Image as ImageIcon,
  Bookmark,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { templatesApi, type Template } from '@/lib/api';
import toast from 'react-hot-toast';

interface CustomTemplate extends Template {
  created_from_invitation?: {
    id: number;
    name: string;
  };
  usage_count?: number;
  last_used?: string;
  is_favorite?: boolean;
  tags?: string[];
}

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | 'favorites' | 'custom' | 'recent' | 'popular';

const mockCustomTemplates: CustomTemplate[] = [
  {
    id: 101,
    name: 'Mi Boda Elegante',
    description: 'Plantilla personalizada creada desde la invitación de María & Carlos',
    category: 'boda',
    preview_image_url: '/api/placeholder/400/300',
    thumbnail_url: '/api/placeholder/200/150',
    is_premium: false,
    is_active: true,
    display_order: 1,
    supported_features: ['rsvp', 'gallery', 'timeline', 'location'],
    default_colors: {
      primary: '#8B5CF6',
      secondary: '#F3E8FF',
      accent: '#EC4899'
    },
    created_at: '2024-07-20T10:30:00Z',
    updated_at: '2024-07-25T14:20:00Z',
    created_from_invitation: {
      id: 1,
      name: 'Boda María & Carlos'
    },
    usage_count: 3,
    last_used: '2024-08-15T09:00:00Z',
    is_favorite: true,
    tags: ['elegante', 'rosa', 'moderno']
  },
  {
    id: 102,
    name: 'XV Años Dorado',
    description: 'Diseño personalizado para celebraciones de quinceañera',
    category: 'quince',
    preview_image_url: '/api/placeholder/400/300',
    thumbnail_url: '/api/placeholder/200/150',
    is_premium: false,
    is_active: true,
    display_order: 2,
    supported_features: ['rsvp', 'gallery', 'music'],
    default_colors: {
      primary: '#F59E0B',
      secondary: '#FEF3C7',
      accent: '#DC2626'
    },
    created_at: '2024-07-15T16:45:00Z',
    updated_at: '2024-07-22T09:15:00Z',
    usage_count: 1,
    last_used: '2024-07-22T09:15:00Z',
    is_favorite: false,
    tags: ['dorado', 'clásico', 'quinceañera']
  },
  {
    id: 103,
    name: 'Baby Shower Suave',
    description: 'Template tierno para celebraciones de baby shower',
    category: 'baby_shower',
    preview_image_url: '/api/placeholder/400/300',
    thumbnail_url: '/api/placeholder/200/150',
    is_premium: false,
    is_active: true,
    display_order: 3,
    supported_features: ['rsvp', 'gifts', 'photos'],
    default_colors: {
      primary: '#10B981',
      secondary: '#D1FAE5',
      accent: '#F59E0B'
    },
    created_at: '2024-06-30T12:00:00Z',
    updated_at: '2024-08-11T10:30:00Z',
    usage_count: 2,
    last_used: '2024-08-11T10:30:00Z',
    is_favorite: false,
    tags: ['suave', 'verde', 'baby']
  }
];

const CATEGORY_LABELS = {
  all: 'Todas',
  favorites: 'Favoritas',
  custom: 'Personalizadas',
  recent: 'Recientes',
  popular: 'Populares'
};

const EVENT_TYPE_LABELS = {
  boda: 'Boda',
  quince: 'XV Años',
  bautizo: 'Bautizo',
  cumpleanos: 'Cumpleaños',
  baby_shower: 'Baby Shower',
  otro: 'Otro',
};

export default function MyTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await templatesApi.getUserTemplates();
      // setTemplates(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 800));
      setTemplates(mockCustomTemplates);
    } catch (error) {
      toast.error('Error cargando plantillas');
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    // Search filter
    const matchesSearch = !searchQuery.trim() || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Category filter
    switch (filterCategory) {
      case 'favorites':
        return template.is_favorite;
      case 'custom':
        return template.created_from_invitation !== undefined;
      case 'recent':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(template.updated_at) > weekAgo;
      case 'popular':
        return (template.usage_count || 0) > 2;
      default:
        return true;
    }
  });

  const getEventTypeIcon = (category: string) => {
    switch (category) {
      case 'boda': return Heart;
      case 'quince': return Star;
      case 'bautizo': return Users;
      case 'cumpleanos': return Calendar;
      case 'baby_shower': return Baby;
      default: return Layout;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreateFromInvitation = () => {
    router.push('/mi-cuenta/invitaciones?action=create-template');
  };

  const handleUseTemplate = (template: CustomTemplate) => {
    router.push(`/plantillas/${template.id}?source=my-templates`);
  };

  const handleEditTemplate = (template: CustomTemplate) => {
    router.push(`/editor/template/${template.id}`);
  };

  const handleToggleFavorite = async (template: CustomTemplate) => {
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

  const handleDuplicateTemplate = async (template: CustomTemplate) => {
    try {
      // TODO: Implement duplication logic
      toast.success(`Plantilla "${template.name}" duplicada`);
      loadTemplates();
    } catch (error) {
      toast.error('Error duplicando plantilla');
    }
  };

  const handleDeleteTemplate = async (template: CustomTemplate) => {
    if (confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
      try {
        // TODO: Implement delete API call
        setTemplates(prev => prev.filter(t => t.id !== template.id));
        toast.success('Plantilla eliminada');
      } catch (error) {
        toast.error('Error eliminando plantilla');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Plantillas</h1>
            <p className="text-gray-600">Gestiona tus plantillas personalizadas</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Plantillas</h1>
          <p className="text-gray-600">
            {filteredTemplates.length} plantilla{filteredTemplates.length !== 1 ? 's' : ''} 
            {filterCategory !== 'all' ? ` en ${CATEGORY_LABELS[filterCategory].toLowerCase()}` : ''}
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
          
          <Button onClick={handleCreateFromInvitation}>
            <Plus className="w-4 h-4 mr-2" />
            Crear plantilla
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
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
        
        <div className="flex items-center gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={filterCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(key as FilterCategory)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Display */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={<Layout className="w-12 h-12 text-gray-400" />}
          title={searchQuery ? 'No se encontraron plantillas' : 'No tienes plantillas personalizadas'}
          description={
            searchQuery 
              ? 'Intenta ajustar los filtros o términos de búsqueda'
              : 'Crea plantillas personalizadas desde tus invitaciones existentes'
          }
          action={
            <Button onClick={handleCreateFromInvitation}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera plantilla
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const EventIcon = getEventTypeIcon(template.category);
            
            return (
              <div key={template.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                {/* Template Preview */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-t-lg overflow-hidden">
                  <div className="absolute top-3 left-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1 ${template.is_favorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                      onClick={() => handleToggleFavorite(template)}
                    >
                      <Star className={`w-4 h-4 ${template.is_favorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteTemplate(template)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <EventIcon className="w-16 h-16 text-purple-600 opacity-30" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <p className="text-white text-sm font-medium">
                      {EVENT_TYPE_LABELS[template.category as keyof typeof EVENT_TYPE_LABELS] || template.category}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Template Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {template.description}
                    </p>
                    
                    {/* Template Metadata */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>Actualizada {formatDate(template.updated_at)}</span>
                      {template.usage_count && (
                        <>
                          <span>•</span>
                          <span>{template.usage_count} uso{template.usage_count !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>

                    {/* Creation Source */}
                    {template.created_from_invitation && (
                      <div className="bg-blue-50 rounded-lg p-2 mb-2">
                        <p className="text-xs text-blue-700">
                          Creada desde: {template.created_from_invitation.name}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Layout className="w-4 h-4 mr-1" />
                      Usar plantilla
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit3 className="w-4 h-4" />
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
                    Usos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actualizada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTemplates.map((template) => {
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
                            {template.is_favorite && (
                              <Star className="w-3 h-3 text-yellow-500 fill-current inline" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {EVENT_TYPE_LABELS[template.category as keyof typeof EVENT_TYPE_LABELS] || template.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.usage_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(template.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                          >
                            Usar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit3 className="w-4 h-4" />
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