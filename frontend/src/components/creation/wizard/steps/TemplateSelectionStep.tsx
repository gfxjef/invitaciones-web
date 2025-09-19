/**
 * Template Selection Step Component
 * 
 * WHY: First step of the invitation wizard that allows users to browse
 * and select the base template for their invitation. Critical for setting
 * the foundation and style of the entire invitation.
 * 
 * WHAT: Interactive template gallery with filtering, search, and preview
 * functionality. Shows templates with pricing, features, and live previews.
 * Integrates with cart system for template selection.
 * 
 * HOW: Uses template API for fetching templates, implements filtering
 * and search functionality, and provides template comparison features.
 */

import React, { useState, useEffect } from 'react';
import { Search, Star, Eye, Check, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardStep, StepSection } from '../WizardStep';
import { WizardStepProps } from '../InvitationWizard';
import { useTemplates, useTemplateCategories } from '@/lib/hooks/use-templates';
import { Template } from '@/lib/api';

export const TemplateSelectionStep: React.FC<WizardStepProps> = ({
  data,
  onUpdate,
  onNext,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // API calls
  const { data: templatesData, isLoading: templatesLoading } = useTemplates({
    page: 1,
    per_page: 20,
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    is_premium: showPremiumOnly || undefined
  });

  const { data: categories } = useTemplateCategories();

  // Set initial template if one is already selected
  useEffect(() => {
    if (data.template_id && templatesData?.templates) {
      const template = templatesData.templates.find(t => t.id === data.template_id);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [data.template_id, templatesData]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    onUpdate('template_id', template.id);
    onUpdate('template_name', template.name);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onNext();
    }
  };

  const filteredTemplates = templatesData?.templates || [];

  return (
    <WizardStep isLoading={isLoading || templatesLoading}>
      <StepSection 
        title="Selecciona tu Plantilla"
        description="Elige el diseño base para tu invitación. Puedes personalizarlo completamente en los siguientes pasos."
      >
        {/* Search and Filters */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar plantillas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories?.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <Star className="w-4 h-4 mr-1 text-purple-600" />
                Solo plantillas Premium
              </span>
            </label>
            <span className="text-sm text-gray-500">
              {filteredTemplates.length} plantillas encontradas
            </span>
          </div>
        </div>

        {/* Selected Template Banner */}
        {selectedTemplate && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-white">
                <img
                  src={selectedTemplate.thumbnail_url || selectedTemplate.preview_image_url || '/placeholder-template.jpg'}
                  alt={selectedTemplate.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Plantilla Seleccionada</h3>
                </div>
                <p className="text-purple-800 font-medium">{selectedTemplate.name}</p>
                <p className="text-sm text-purple-700">{selectedTemplate.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-900">
                  S/ {selectedTemplate.price?.toFixed(2) || (selectedTemplate.is_premium ? '49.90' : '29.90')}
                </div>
                {selectedTemplate.is_premium && (
                  <Badge className="bg-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid/List */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={() => handleTemplateSelect(template)}
              viewMode={viewMode}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && !templatesLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron plantillas
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros o términos de búsqueda
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setShowPremiumOnly(false);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Continue Button */}
        {selectedTemplate && (
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleContinue}
              size="lg"
              className="px-8"
            >
              Continuar con esta plantilla
            </Button>
          </div>
        )}
      </StepSection>
    </WizardStep>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  viewMode: 'grid' | 'list';
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  viewMode
}) => {
  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open preview in new window/modal
    window.open(`/plantillas/${template.id}`, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={onSelect}
        className={`flex items-center gap-6 p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-purple-600 bg-purple-50 shadow-lg'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
        }`}
      >
        {/* Template Image */}
        <div className="w-24 h-30 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={template.thumbnail_url || template.preview_image_url || '/placeholder-template.jpg'}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Template Info */}
        <div className="flex-1">
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
                Seleccionada
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mb-2">{template.description}</p>
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 cursor-pointer ${
        isSelected
          ? 'border-purple-600 bg-purple-50 shadow-lg ring-2 ring-purple-200'
          : 'border-gray-100 bg-white hover:border-purple-200'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
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

        {/* Premium Badge */}
        {template.is_premium && (
          <Badge className="absolute top-3 left-3 bg-purple-600 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}

        {/* Hover Actions */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${
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
        </div>
      </div>

      {/* Template Info */}
      <div className={`p-4 ${isSelected ? 'bg-purple-50' : ''}`}>
        <h3 className={`font-semibold text-lg mb-2 ${
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

export default TemplateSelectionStep;