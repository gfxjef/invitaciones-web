/**
 * Template Registry
 *
 * WHY: Central registry that maps template_file keys from the database
 * to their corresponding React components. This allows the system to
 * dynamically load templates based on metadata.
 */

import { TemplateRegistry } from '@/types/template';

// Import template components
import { EleganteDorado } from '../designs/EleganteDorado';
import { ModernMinimalist } from '../designs/ModernMinimalist';
import { RomanticoFloral } from '../designs/RomanticoFloral';

/**
 * Template Registry Mapping
 *
 * Key: template_file value from database
 * Value: React component for that template
 *
 * When adding new templates:
 * 1. Import the component above
 * 2. Add mapping below with appropriate key
 * 3. Ensure database has matching template_file value
 */
export const templateRegistry: TemplateRegistry = {
  // Classic elegant template with golden accents
  'elegante_dorado': EleganteDorado,
  'EleganteDorado': EleganteDorado, // Alternative naming

  // Modern minimalist template
  'modern_minimalist': ModernMinimalist,
  'ModernMinimalist': ModernMinimalist, // Alternative naming

  // Romantic floral template
  'romantico_floral': RomanticoFloral,
  'RomanticoFloral': RomanticoFloral, // Alternative naming

  // Future templates will be added here:
  // 'rustic_natural': RusticNatural,
  // 'luxury_black': LuxuryBlack,
};

/**
 * Get available template keys
 */
export const getAvailableTemplates = (): string[] => {
  return Object.keys(templateRegistry);
};

/**
 * Check if a template exists in the registry
 */
export const isTemplateAvailable = (templateKey: string): boolean => {
  return templateKey in templateRegistry;
};

/**
 * Get template component by key
 */
export const getTemplateComponent = (templateKey: string) => {
  return templateRegistry[templateKey] || null;
};