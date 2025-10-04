/**
 * Templates Gallery Page (/plantillas)
 * 
 * WHY: Main templates browsing page that allows users to explore available
 * invitation templates with filtering, search, and pagination. Critical for
 * user discovery and template selection process.
 * 
 * WHAT: Server-side rendered page with client-side interactivity for filtering,
 * searching, and pagination. Includes responsive grid, category filters, and
 * premium/free toggle.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Grid, List, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTemplates, useTemplateCategories } from '@/lib/hooks/use-templates';
import { Template } from '@/lib/api';

// Template Card Component
const TemplateCard = ({ template }: { template: Template }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/plantillas/${template.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer aspect-[3/4]"
    >
      {/* Background Image (Full Card) */}
      <img
        src={template.preview_image_url || 'https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=600'}
        alt={template.name}
        className="absolute inset-0 w-full h-auto object-top transition-transform duration-[2000ms] ease-in-out group-hover:scale-105 group-hover:-translate-y-[30%]"
      />

      {/* Premium/Basic Badge - Top */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className={`${
          template.is_premium
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0'
            : 'bg-white/90 backdrop-blur-sm text-gray-900 border-0'
        }`}>
          <Star className="w-3 h-3 mr-1" />
          {template.is_premium ? 'Premium' : 'Basic'}
        </Badge>
      </div>

      {/* Gradient Overlay - Bottom 50% */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

      {/* Content Over Gradient */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="font-semibold text-lg mb-3 line-clamp-1 text-white">
          {template.name}
        </h3>

        <div className="flex items-center gap-2">
          {/* Category */}
          {template.category && (
            <Badge
              variant="outline"
              className="text-xs border-white/30 text-white bg-white/10 backdrop-blur-sm"
            >
              {template.category}
            </Badge>
          )}

          {/* Price */}
          <div className="text-sm font-semibold text-white">
            S/ {template.price?.toFixed(2) || (template.is_premium ? '49.90' : '29.90')}
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 hover:bg-white text-gray-900"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalles
        </Button>
      </div>
    </div>
  );
};

// Main Page Component
export default function PlantillasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isPremiumFilter, setIsPremiumFilter] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('display_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Sync URL params with state
  useEffect(() => {
    const page = searchParams.get('page');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const premium = searchParams.get('premium');
    
    if (page) setCurrentPage(parseInt(page));
    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
    if (premium) setIsPremiumFilter(premium === 'true');
  }, [searchParams]);

  // API calls
  const { data: templatesData, isLoading, error } = useTemplates({
    page: currentPage,
    per_page: 12,
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    is_premium: isPremiumFilter ?? undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: categories } = useTemplateCategories();

  // Update URL when filters change
  const updateURL = (params: Record<string, string | number | boolean>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value.toString());
      } else {
        newSearchParams.delete(key);
      }
    });
    
    router.push(`/plantillas?${newSearchParams.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateURL({ search: value, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateURL({ category, page: 1 });
  };

  const handlePremiumFilter = (isPremium: boolean | null) => {
    setIsPremiumFilter(isPremium);
    setCurrentPage(1);
    updateURL({ premium: isPremium?.toString() || '', page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setIsPremiumFilter(null);
    setCurrentPage(1);
    router.push('/plantillas');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Plantillas de Invitaciones
            </h1>
            <p className="text-xl text-gray-600">
              Encuentra la plantilla perfecta para tu evento especial
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Limpiar
                </Button>
              </div>

              {/* Premium Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Tipo</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="premium"
                      checked={isPremiumFilter === null}
                      onChange={() => handlePremiumFilter(null)}
                      className="text-purple-600 focus:ring-purple-600"
                    />
                    <span className="ml-3 text-gray-700">Todas</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="premium"
                      checked={isPremiumFilter === false}
                      onChange={() => handlePremiumFilter(false)}
                      className="text-purple-600 focus:ring-purple-600"
                    />
                    <span className="ml-3 text-gray-700">Gratuitas</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="premium"
                      checked={isPremiumFilter === true}
                      onChange={() => handlePremiumFilter(true)}
                      className="text-purple-600 focus:ring-purple-600"
                    />
                    <span className="ml-3 text-gray-700 flex items-center">
                      <Star className="w-4 h-4 mr-1 text-purple-600" />
                      Premium
                    </span>
                  </label>
                </div>
              </div>

              {/* Category Filter */}
              {categories && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Categoría</h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => handleCategoryChange('')}
                        className="text-purple-600 focus:ring-purple-600"
                      />
                      <span className="ml-3 text-gray-700">Todas</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => handleCategoryChange(category)}
                          className="text-purple-600 focus:ring-purple-600"
                        />
                        <span className="ml-3 text-gray-700 capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  {templatesData ? (
                    <>Mostrando {templatesData.templates.length} de {templatesData.total} plantillas</>
                  ) : (
                    'Cargando...'
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sort Options */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="display_order-asc">Por defecto</option>
                  <option value="name-asc">Nombre A-Z</option>
                  <option value="name-desc">Nombre Z-A</option>
                  <option value="created_at-desc">Más recientes</option>
                  <option value="created_at-asc">Más antiguos</option>
                </select>
              </div>
            </div>

            {/* Templates Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Error cargando las plantillas</p>
                <Button onClick={() => window.location.reload()}>
                  Intentar de nuevo
                </Button>
              </div>
            ) : !templatesData?.templates.length ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No se encontraron plantillas</p>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {templatesData.templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {templatesData && templatesData.pages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={!templatesData.has_prev}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  
                  {Array.from({ length: Math.min(5, templatesData.pages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > templatesData.pages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={!templatesData.has_next}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}