/**
 * Types for Dynamic Customizer System
 *
 * WHY: Centralized type definitions for the customizer system
 * that dynamically adapts to template sections with progressive override support.
 */

export interface CustomizerField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'url' | 'textarea' | 'color' | 'checkbox' | 'time' | 'datetime-local' | 'toggle' | 'multi-image';
  placeholder?: string;
  section: string | string[];  // Permite campos compartidos entre múltiples secciones
  category: string;

  // Properties specific to multi-image fields
  maxImages?: number;
  minImages?: number;
}

// Gallery image interface for multi-image fields
export interface GalleryImage {
  url: string;
  alt?: string;
  category?: string;
  file?: File;
  id: string;
}

export interface CustomizerData {
  [key: string]: string | boolean | GalleryImage[] | undefined;
}

/**
 * TouchedFields interface - tracks which fields user has explicitly modified
 *
 * WHY: Enables progressive override strategy where template defaults
 * are preserved until user explicitly edits a field.
 */
export interface TouchedFields {
  [fieldKey: string]: boolean;
}

/**
 * FieldState interface - tracks the state of each field for progressive override
 *
 * WHY: Provides complete state information for field rendering including
 * visual indicators, reset capabilities, and value source tracking.
 */
export interface FieldState {
  /** Current value displayed in the field */
  value: string | boolean | GalleryImage[];
  /** Whether user has explicitly modified this field */
  isTouched: boolean;
  /** Whether current value differs from template default */
  isModified: boolean;
  /** Original template default value */
  defaultValue: string | boolean | GalleryImage[];
  /** Whether this field can be reset to default */
  canReset: boolean;
}

/**
 * Progressive override data structure
 *
 * WHY: Separates user-modified data from template defaults,
 * enabling smart merging and visual state indicators.
 */
export interface ProgressiveData {
  /** User's explicit modifications */
  userData: CustomizerData;
  /** Template default values */
  templateDefaults: CustomizerData;
  /** Fields that user has touched/modified */
  touchedFields: TouchedFields;
}

export interface SectionConfig {
  fields: string[];
  label: string;
  icon?: string;
}

export interface CustomizerState {
  isOpen: boolean;
  data: CustomizerData;
  availableFields: CustomizerField[];
  sectionsUsed: string[];
  /** Progressive override state */
  progressiveData: ProgressiveData;
  /** Field states for enhanced UI */
  fieldStates: Record<string, FieldState>;
}

export interface TemplateSection {
  name: string;
  component: string;
  isActive: boolean;
}