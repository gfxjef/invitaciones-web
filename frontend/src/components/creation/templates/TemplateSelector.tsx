/**
 * Template Selector Component
 * 
 * WHY: Standalone template selection interface that can be used
 * independently or within the wizard. Provides advanced filtering,
 * comparison, and preview capabilities for template selection.
 * 
 * WHAT: Comprehensive template browsing interface with category
 * filters, search functionality, template comparison, and detailed
 * previews. Supports both grid and list views with sorting options.
 * 
 * HOW: Uses template APIs for data fetching, implements advanced
 * filtering logic, provides template comparison features, and
 * integrates with cart system for template selection.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Eye, 
  ShoppingCart,
  Check,
  X,
  Heart,
  Zap,
  Palette,
  Layout,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTemplates, useTemplateCategories } from '@/lib/hooks/use-templates';
import { useAddTemplateToCart } from '@/lib/hooks/use-cart';
import { Template } from '@/lib/api';

interface TemplateSelectorProps {
  onSelectTemplate?: (template: Template) => void;
  selectedTemplateId?: number | null;
  showHeader?: boolean;
  maxSelections?: number;
  mode?: 'select' | 'preview' | 'compare';
  className?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  selectedTemplateId = null,
  showHeader = true,
  maxSelections = 1,
  mode = 'select',
  className = ''
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'name' | 'newest'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  // API hooks
  const { data: templatesData, isLoading } = useTemplates({
    page: 1,
    per_page: 50,
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    is_premium: priceFilter === 'premium' ? true : priceFilter === 'free' ? false : undefined,
    sort_by: sortBy === 'popular' ? 'display_order' : sortBy === 'newest' ? 'created_at' : sortBy,
    sort_order: sortBy === 'newest' ? 'desc' : 'asc'
  });

  const { data: categories } = useTemplateCategories();
  const { addTemplate, isPending: isAddingToCart } = useAddTemplateToCart();

  // Computed values
  const templates = templatesData?.templates || [];
  const totalTemplates = templatesData?.total || 0;

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return template.name.toLowerCase().includes(searchLower) ||
               template.description.toLowerCase().includes(searchLower) ||
               template.category.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [templates, searchTerm]);

  // Handlers
  const handleSelectTemplate = useCallback((template: Template) => {
    if (mode === 'compare') {
      setSelectedTemplates(prev => {
        const isSelected = prev.some(t => t.id === template.id);
        if (isSelected) {
          return prev.filter(t => t.id !== template.id);
        } else if (prev.length < 3) { // Max 3 for comparison
          return [...prev, template];
        }
        return prev;
      });
      return;
    }

    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  }, [mode, onSelectTemplate]);

  const handleAddToCart = useCallback(async (template: Template, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      await addTemplate(template);
    } catch (error) {
      console.error('Error adding template to cart:', error);
    }
  }, [addTemplate]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceFilter('all');
    setSortBy('popular');
  }, []);

  const toggleComparison = useCallback(() => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      setSelectedTemplates([]);
    }
  }, [comparisonMode]);

  const isSelected = useCallback((template: Template) => {
    if (mode === 'compare') {
      return selectedTemplates.some(t => t.id === template.id);
    }
    return selectedTemplateId === template.id;
  }, [mode, selectedTemplates, selectedTemplateId]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Plantillas de Invitación
            </h2>
            <p className="text-gray-600 mt-1">
              {totalTemplates} plantillas disponibles
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {mode === 'select' && (
              <Button
                variant="outline"
                onClick={toggleComparison}
                className={comparisonMode ? 'bg-purple-50 border-purple-300' : ''}
              >
                <Layout className="w-4 h-4 mr-2" />
                {comparisonMode ? 'Salir de Comparación' : 'Comparar'}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar plantillas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories?.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="all">Todos los precios</option>
                <option value="free">Gratuitas</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="popular">Más populares</option>
                <option value="newest">Más recientes</option>
                <option value="name">Nombre A-Z</option>
                <option value="price">Precio</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista
              </label>
              <div className="flex border border-gray-300 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              Limpiar Filtros
            </Button>
            
            <span className="text-sm text-gray-600">
              {filteredTemplates.length} de {totalTemplates} plantillas
            </span>
          </div>
        </div>
      )}

      {/* Comparison Mode Notice */}
      {comparisonMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Layout className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">
                  Modo Comparación Activo
                </h4>
                <p className="text-sm text-blue-800">
                  Selecciona hasta 3 plantillas para comparar ({selectedTemplates.length}/3)
                </p>
              </div>
            </div>
            
            {selectedTemplates.length > 1 && (
              <Button size="sm">
                Comparar Seleccionadas
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Templates Grid/List */}
      {isLoading ? (
        <TemplateLoadingGrid viewMode={viewMode} />
      ) : filteredTemplates.length === 0 ? (
        <TemplateEmptyState onClearFilters={handleClearFilters} />
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
              isSelected={isSelected(template)}
              isComparison={comparisonMode}
              canSelect={!comparisonMode || selectedTemplates.length < 3}
              onSelect={() => handleSelectTemplate(template)}
              onAddToCart={(e) => handleAddToCart(template, e)}
              isAddingToCart={isAddingToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: Template;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isComparison: boolean;
  canSelect: boolean;
  onSelect: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
  isAddingToCart: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  viewMode,
  isSelected,
  isComparison,
  canSelect,
  onSelect,
  onAddToCart,
  isAddingToCart
}) => {
  const handleClick = () => {
    if (canSelect) {
      onSelect();
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/plantillas/${template.id}`, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className={`flex items-center gap-6 p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-purple-600 bg-purple-50 shadow-lg'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
        } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Template Image */}
        <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={template.thumbnail_url || template.preview_image_url || '/placeholder-template.jpg'}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Template Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h3>
                {template.is_premium && (
                  <Badge className="bg-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {isSelected && (
                  <Badge className="bg-green-600 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    {isComparison ? 'En Comparación' : 'Seleccionada'}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg">
                  S/ {template.price?.toFixed(2) || (template.is_premium ? '49.90' : '29.90')}
                </span>
                {template.category && (
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              
              {!isComparison && (
                <Button
                  size="sm"
                  onClick={onAddToCart}
                  disabled={isAddingToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {isAddingToCart ? 'Agregando...' : 'Agregar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 cursor-pointer ${
        isSelected
          ? 'border-purple-600 bg-purple-50 shadow-lg ring-2 ring-purple-200'
          : 'border-gray-100 bg-white hover:border-purple-200'
      } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-purple-600 text-white rounded-full p-2 shadow-lg">
            <Check className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Template Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={template.preview_image_url || '/placeholder-template.jpg'}
          alt={template.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isSelected ? 'scale-105' : 'group-hover:scale-105'
          }`}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {template.is_premium && (
            <Badge className="bg-purple-600 text-white border-0">
              <Star className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          
          {template.featured && (
            <Badge className="bg-yellow-500 text-white border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>

        {/* Hover Actions */}
        {canSelect && (
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-3 ${
            isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePreview}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            
            {!isComparison && (
              <Button
                size="sm"
                onClick={onAddToCart}
                disabled={isAddingToCart}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isAddingToCart ? 'Agregando...' : 'Seleccionar'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className={`p-4 ${isSelected ? 'bg-purple-50' : ''}`}>
        <h3 className={`font-semibold text-lg mb-2 line-clamp-1 ${
          isSelected ? 'text-purple-900' : 'text-gray-900'
        }`}>
          {template.name}
        </h3>
        
        <p className={`text-sm mb-3 line-clamp-2 ${
          isSelected ? 'text-purple-700' : 'text-gray-600'
        }`}>
          {template.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {template.category && (
              <Badge variant="outline" className={`text-xs ${
                isSelected
                  ? 'border-purple-300 text-purple-700 bg-purple-100'
                  : 'border-gray-300 text-gray-600'
              }`}>
                {template.category}
              </Badge>
            )}
          </div>
          
          <div className={`font-bold ${
            isSelected ? 'text-purple-800' : 'text-gray-900'
          }`}>
            S/ {template.price?.toFixed(2) || (template.is_premium ? '49.90' : '29.90')}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Grid Component
const TemplateLoadingGrid: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => (
  <div className={`grid gap-6 ${
    viewMode === 'grid'
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1'
  }`}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse overflow-hidden">
        {viewMode === 'grid' ? (
          <>
            <div className="aspect-[3/4] bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6 p-4">
            <div className="w-24 h-32 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// Empty State Component
const TemplateEmptyState: React.FC<{ onClearFilters: () => void }> = ({ onClearFilters }) => (
  <div className="text-center py-16">
    <div className="text-gray-400 mb-6">
      <Sparkles className="w-16 h-16 mx-auto" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      No se encontraron plantillas
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      No hay plantillas que coincidan con tus criterios de búsqueda. 
      Intenta ajustar los filtros o términos de búsqueda.
    </p>
    <Button onClick={onClearFilters} variant="outline">
      <X className="w-4 h-4 mr-2" />
      Limpiar Filtros
    </Button>
  </div>
);

export default TemplateSelector;