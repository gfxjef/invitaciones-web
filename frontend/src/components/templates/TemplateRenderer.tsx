/**
 * Template Renderer Component
 *
 * WHY: Main component that renders modular templates based on
 * template metadata from the database. Now focuses exclusively
 * on modular templates with category-specific section rendering.
 *
 * FEATURES:
 * - Modular template support (sections_config)
 * - Category-aware rendering (weddings, kids, corporate)
 * - Dynamic section loading based on template configuration
 * - Fallback handling for missing components
 */

'use client';

import { useMemo } from 'react';
import { TemplateProps, TemplateComponent } from '@/types/template';
import { TemplateBuilder } from './TemplateBuilder';

interface TemplateRendererProps extends TemplateProps {
  // Optional override for template selection
  templateOverride?: string;
  // Custom preview data from customizer (takes priority over regular data)
  customPreviewData?: any;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  invitation,
  data,
  template,
  colors,
  features,
  media,
  events,
  isPreview = false,
  isEditing = false,
  templateOverride,
  customPreviewData
}) => {

  // Use custom preview data if available, otherwise use regular data
  const renderData = customPreviewData || data;

  // Determine template category and rendering approach
  const renderingDecision = useMemo(() => {
    // All templates are now modular - determine category
    if (!template.sections_config) {
      return {
        type: 'error',
        message: 'Template sections_config not found. All templates must be modular.'
      };
    }

    // Determine category based on template metadata or default to weddings
    const category = template.category || 'weddings';

    return {
      type: 'modular',
      category: category,
      config: template.sections_config
    };
  }, [template.sections_config, template.category]);

  // Fallback component for missing templates
  const FallbackTemplate = ({ message, availableTemplates }: { message: string; availableTemplates?: string[] }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Template No Disponible
        </h1>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        {availableTemplates && (
          <p className="text-sm text-gray-500">
            Templates disponibles: {availableTemplates.join(', ')}
          </p>
        )}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>Tipo de template:</strong> {template.template_type || 'legacy'}
          </p>
          {template.sections_config && (
            <p className="text-sm text-blue-700 mt-1">
              <strong>Configuración de secciones:</strong> {JSON.stringify(template.sections_config, null, 2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render based on template type
  switch (renderingDecision.type) {
    case 'modular':
      return (
        <TemplateBuilder
          invitation={invitation}
          data={renderData}
          template={template}
          colors={colors}
          features={features}
          media={media}
          events={events}
          isPreview={isPreview}
          isEditing={isEditing}
          sectionsConfig={renderingDecision.config}
          category={renderingDecision.category}
        />
      );

    case 'error':
    default:
      return (
        <FallbackTemplate
          message={renderingDecision.message || 'Unknown template error'}
          availableTemplates={renderingDecision.availableTemplates}
        />
      );
  }
};