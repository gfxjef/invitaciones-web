/**
 * Global Customizer Utilities
 *
 * WHY: Provides general utilities for customizer functionality.
 * Specific category configurations should be in their respective category folders.
 * This file contains only shared utilities and fallback functions.
 */

import { CustomizerField, SectionConfig, CustomizerMode } from './types';

// DEPRECATED: Category-specific configurations moved to their respective folders
// Use category-specific imports instead:
// - Wedding: frontend/src/components/templates/categories/weddings/customizer/sectionFieldsMap.ts
// - Kids: frontend/src/components/templates/categories/kids/customizer/sectionFieldsMap.ts
// - etc.

// Legacy fallback for backward compatibility - SHOULD NOT BE USED for new development
export const SECTION_FIELDS_MAP: Record<string, SectionConfig> = {
  // DEPRECATED: This is kept only for legacy compatibility
  // All new development should use category-specific field maps
};

// DEPRECATED: Category-specific field definitions moved to their respective folders
export const FIELD_DEFINITIONS: Record<string, CustomizerField> = {
  // DEPRECATED: This is kept only for legacy compatibility
  // All new development should use category-specific field definitions
};

// DEPRECATED: Category-specific basic fields moved to their respective folders
export const BASIC_FIELDS: string[] = [
  // DEPRECATED: This is kept only for legacy compatibility
  // All new development should use category-specific basic fields (e.g., WEDDING_BASIC_FIELDS)
];

/**
 * Generic utility: Filter fields by selected mode (Basic or Full)
 * This utility can be used by any category's customizer
 */
export function getFieldsByMode(
  allFields: CustomizerField[],
  basicFields: string[],
  mode: CustomizerMode
): CustomizerField[] {
  if (mode === 'basic') {
    return allFields.filter(field => basicFields.includes(field.key));
  }
  return allFields; // FULL mode shows all fields
}

/**
 * Generic utility: Get fields grouped by sections with mode filtering applied
 * This utility can be used by any category's customizer
 */
export function getFieldsByCategoryWithMode(
  availableFields: CustomizerField[],
  activeSections: string[],
  basicFields: string[],
  mode: CustomizerMode,
  getFieldsByOrderedSections: (fields: CustomizerField[], sections: string[]) => Record<string, CustomizerField[]>
): Record<string, CustomizerField[]> {
  const filteredFields = getFieldsByMode(availableFields, basicFields, mode);
  return getFieldsByOrderedSections(filteredFields, activeSections);
}

/**
 * Generic utility: Get sections used in a template based on configuration
 * Preserves the order as defined in the database sections_config
 * This utility can be used by any category
 */
export function detectActiveSections(sectionsConfig: any, templateData?: any): string[] {
  if (!sectionsConfig) {
    return [];
  }

  let sectionOrder: string[];

  // Use sections_config_ordered if available (preserves database order)
  if (templateData?.sections_config_ordered && Array.isArray(templateData.sections_config_ordered)) {
    sectionOrder = templateData.sections_config_ordered.map((item: [string, string]) => item[0]);
  } else {
    // Fallback to Object.keys (may be alphabetical due to JSON serialization)
    sectionOrder = Object.keys(sectionsConfig);
  }

  // Filter to only enabled sections while preserving order
  const result = sectionOrder.filter(sectionName => {
    const value = sectionsConfig[sectionName];
    return value === true ||
           (typeof value === 'object' && value?.enabled !== false) ||
           (typeof value === 'string'); // For modular templates like "hero_1", "welcome_1"
  });

  return result;
}

/**
 * Generic utility: Get ordered sections based on the order from the database (activeSections)
 * Only returns sections that have field mappings available
 * This utility can be used by any category
 */
export function getOrderedSections(activeSections: string[], sectionFieldsMap: Record<string, SectionConfig>): string[] {
  // Use the order from activeSections (which comes from DB) instead of hardcoded order
  return activeSections.filter(sectionName =>
    sectionFieldsMap[sectionName] // Only include sections that have field definitions
  );
}

/**
 * Generic utility: Get fields grouped by ordered sections based on dynamic section order
 * Uses the order from activeSections (database order) instead of field appearance order
 * This utility can be used by any category
 */
export function getFieldsByOrderedSections(availableFields: CustomizerField[], activeSections: string[]): Record<string, CustomizerField[]> {
  const fieldsBySections: Record<string, CustomizerField[]> = {};
  const processedFields = new Set<string>(); // Para evitar duplicados

  // First pass: group fields by section, handling multiple sections per field
  availableFields.forEach(field => {
    if (field.section) {
      // Handle both string and array sections
      const sections = Array.isArray(field.section) ? field.section : [field.section];

      // Para campos con múltiples secciones, solo añadir en la primera sección activa
      const firstActiveSection = activeSections.find(activeSection =>
        sections.includes(activeSection)
      );

      if (firstActiveSection && !processedFields.has(field.key)) {
        if (!fieldsBySections[firstActiveSection]) {
          fieldsBySections[firstActiveSection] = [];
        }
        fieldsBySections[firstActiveSection].push(field);
        processedFields.add(field.key);
      }
    }
  });

  // Second pass: return sections in activeSections order (database order)
  const result: Record<string, CustomizerField[]> = {};
  activeSections.forEach(sectionName => {
    if (fieldsBySections[sectionName] && fieldsBySections[sectionName].length > 0) {
      result[sectionName] = fieldsBySections[sectionName];
    }
  });

  return result;
}

/**
 * Generic utility: Get available fields for customization based on template sections
 * This utility can be used by any category
 */
export function getAvailableFields(activeSections: string[], sectionFieldsMap: Record<string, SectionConfig>, fieldDefinitions: Record<string, CustomizerField>): CustomizerField[] {
  const fieldsSet = new Set<string>();

  // Collect all fields from active sections
  activeSections.forEach(sectionName => {
    const section = sectionFieldsMap[sectionName];
    if (section) {
      section.fields.forEach(fieldKey => fieldsSet.add(fieldKey));
    }
  });

  // Convert to field definitions
  return Array.from(fieldsSet)
    .map(fieldKey => fieldDefinitions[fieldKey])
    .filter(Boolean)
    .sort((a, b) => a.category.localeCompare(b.category));
}