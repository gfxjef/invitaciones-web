/**
 * Section-to-Fields Mapping Configuration
 *
 * WHY: Defines which fields are available for customization
 * based on the sections present in each template.
 * Enables dynamic customizer panels that only show relevant fields.
 */

import { CustomizerField, SectionConfig } from './types';

// Section display order is now determined dynamically from the database sections_config
// No longer using hardcoded SECTION_DISPLAY_ORDER - order comes from Template.sections_config

// Map of section names to their editable fields (based on actual template component props)
export const SECTION_FIELDS_MAP: Record<string, SectionConfig> = {
  hero: {
    label: 'Portada',
    icon: '🎭',
    fields: [
      'coupleNames',
      'eventDate',
      'eventLocation',
      'heroImageUrl'
    ]
  },

  welcome: {
    label: 'Bienvenida',
    icon: '👋',
    fields: [
      'welcomeText',
      'title',
      'description',
      'couplePhotoUrl',
      'bannerImageUrl'
    ]
  },

  couple: {
    label: 'Los Novios',
    icon: '💑',
    fields: [
      'sectionTitle',
      'sectionSubtitle',
      'bride_name',
      'bride_role',
      'bride_description',
      'bride_imageUrl',
      'groom_name',
      'groom_role',
      'groom_description',
      'groom_imageUrl'
    ]
  },

  countdown: {
    label: 'Cuenta Regresiva',
    icon: '⏰',
    fields: [
      'weddingDate',
      'backgroundImageUrl',
      'preTitle',
      'title'
    ]
  },

  story: {
    label: 'Nuestra Historia',
    icon: '💕',
    fields: [
      'sectionSubtitle',
      'sectionTitle',
      'story_moment_1_date',
      'story_moment_1_title',
      'story_moment_1_description',
      'story_moment_1_imageUrl',
      'story_moment_2_date',
      'story_moment_2_title',
      'story_moment_2_description',
      'story_moment_2_imageUrl',
      'story_moment_3_date',
      'story_moment_3_title',
      'story_moment_3_description',
      'story_moment_3_imageUrl'
    ]
  },

  gallery: {
    label: 'Galería',
    icon: '📸',
    fields: [
      'sectionSubtitle',
      'sectionTitle',
      'gallery_image_1_url',
      'gallery_image_1_alt',
      'gallery_image_1_category',
      'gallery_image_2_url',
      'gallery_image_2_alt',
      'gallery_image_2_category',
      'gallery_image_3_url',
      'gallery_image_3_alt',
      'gallery_image_3_category',
      'gallery_image_4_url',
      'gallery_image_4_alt',
      'gallery_image_4_category',
      'gallery_image_5_url',
      'gallery_image_5_alt',
      'gallery_image_5_category',
      'gallery_image_6_url',
      'gallery_image_6_alt',
      'gallery_image_6_category',
      'gallery_image_7_url',
      'gallery_image_7_alt',
      'gallery_image_7_category',
      'gallery_image_8_url',
      'gallery_image_8_alt',
      'gallery_image_8_category',
      'gallery_image_9_url',
      'gallery_image_9_alt',
      'gallery_image_9_category',
      'gallery_image_10_url',
      'gallery_image_10_alt',
      'gallery_image_10_category'
    ]
  },

  video: {
    label: 'Video',
    icon: '🎥',
    fields: [
      'backgroundImageUrl',
      'videoEmbedUrl',
      'preTitle',
      'title'
    ]
  },

  footer: {
    label: 'Pie de Página',
    icon: '📝',
    fields: [
      'coupleNames',
      'eventDate',
      'eventLocation',
      'copyrightText'
    ]
  }
};

// Complete field definitions with UI metadata (matching actual template component props)
export const FIELD_DEFINITIONS: Record<string, CustomizerField> = {
  // Hero section fields
  coupleNames: {
    key: 'coupleNames',
    label: 'Nombres de la Pareja',
    type: 'text',
    placeholder: 'Ej: Jefferson & Rosmery',
    section: 'hero',
    category: 'Pareja'
  },

  eventDate: {
    key: 'eventDate',
    label: 'Fecha del Evento',
    type: 'text',
    placeholder: 'Ej: 15 December, 2024',
    section: 'hero',
    category: 'Evento'
  },

  eventLocation: {
    key: 'eventLocation',
    label: 'Lugar del Evento',
    type: 'text',
    placeholder: 'Ej: Lima, Perú',
    section: 'hero',
    category: 'Evento'
  },

  heroImageUrl: {
    key: 'heroImageUrl',
    label: 'Imagen de Portada',
    type: 'url',
    placeholder: 'URL de la imagen de fondo',
    section: 'hero',
    category: 'Imágenes'
  },

  // Welcome section fields
  welcomeText: {
    key: 'welcomeText',
    label: 'Texto de Bienvenida',
    type: 'text',
    placeholder: 'Ej: Hola & Bienvenidos',
    section: 'welcome',
    category: 'Mensajes'
  },

  title: {
    key: 'title',
    label: 'Título Principal',
    type: 'text',
    placeholder: 'Ej: Nos Vamos a Casar!!!!',
    section: 'welcome',
    category: 'Mensajes'
  },

  description: {
    key: 'description',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Mensaje de amor y compromiso...',
    section: 'welcome',
    category: 'Mensajes'
  },

  couplePhotoUrl: {
    key: 'couplePhotoUrl',
    label: 'Foto de la Pareja',
    type: 'url',
    placeholder: 'URL de la foto de la pareja',
    section: 'welcome',
    category: 'Imágenes'
  },

  bannerImageUrl: {
    key: 'bannerImageUrl',
    label: 'Imagen de Banner',
    type: 'url',
    placeholder: 'URL de la imagen de banner',
    section: 'welcome',
    category: 'Imágenes'
  },

  // Couple section fields
  sectionTitle: {
    key: 'sectionTitle',
    label: 'Título de Sección',
    type: 'text',
    placeholder: 'Ej: Futuros Felices Esposos',
    section: 'couple',
    category: 'Títulos'
  },

  sectionSubtitle: {
    key: 'sectionSubtitle',
    label: 'Subtítulo de Sección',
    type: 'text',
    placeholder: 'Ej: MARIDO & MUJER',
    section: 'couple',
    category: 'Títulos'
  },

  bride_name: {
    key: 'bride_name',
    label: 'Nombre de la Novia',
    type: 'text',
    placeholder: 'Ej: Rosmery Guiterrez',
    section: 'couple',
    category: 'Novia'
  },

  bride_role: {
    key: 'bride_role',
    label: 'Rol de la Novia',
    type: 'text',
    placeholder: 'Ej: La Novia',
    section: 'couple',
    category: 'Novia'
  },

  bride_description: {
    key: 'bride_description',
    label: 'Descripción de la Novia',
    type: 'textarea',
    placeholder: 'Mensaje personal para la novia...',
    section: 'couple',
    category: 'Novia'
  },

  bride_imageUrl: {
    key: 'bride_imageUrl',
    label: 'Foto de la Novia',
    type: 'url',
    placeholder: 'URL de la foto de la novia',
    section: 'couple',
    category: 'Novia'
  },

  groom_name: {
    key: 'groom_name',
    label: 'Nombre del Novio',
    type: 'text',
    placeholder: 'Ej: Jefferson Camacho',
    section: 'couple',
    category: 'Novio'
  },

  groom_role: {
    key: 'groom_role',
    label: 'Rol del Novio',
    type: 'text',
    placeholder: 'Ej: El Novio',
    section: 'couple',
    category: 'Novio'
  },

  groom_description: {
    key: 'groom_description',
    label: 'Descripción del Novio',
    type: 'textarea',
    placeholder: 'Mensaje personal para el novio...',
    section: 'couple',
    category: 'Novio'
  },

  groom_imageUrl: {
    key: 'groom_imageUrl',
    label: 'Foto del Novio',
    type: 'url',
    placeholder: 'URL de la foto del novio',
    section: 'couple',
    category: 'Novio'
  },

  // Countdown section fields
  weddingDate: {
    key: 'weddingDate',
    label: 'Fecha de la Boda (ISO)',
    type: 'datetime-local',
    placeholder: '2025-12-15T17:00:00',
    section: 'countdown',
    category: 'Evento'
  },

  backgroundImageUrl: {
    key: 'backgroundImageUrl',
    label: 'Imagen de Fondo',
    type: 'url',
    placeholder: 'URL de la imagen de fondo',
    section: 'countdown',
    category: 'Imágenes'
  },

  preTitle: {
    key: 'preTitle',
    label: 'Pre-título',
    type: 'text',
    placeholder: 'Ej: DENTRO DE POCO SEREMOS UNA FAMILIA',
    section: 'countdown',
    category: 'Títulos'
  },

  // Video section fields
  videoEmbedUrl: {
    key: 'videoEmbedUrl',
    label: 'URL del Video (Embed)',
    type: 'url',
    placeholder: 'https://www.youtube.com/embed/...',
    section: 'video',
    category: 'Multimedia'
  },

  // Story section fields - 3 moments
  story_moment_1_date: {
    key: 'story_moment_1_date',
    label: 'Momento 1 - Fecha',
    type: 'text',
    placeholder: 'Ej: 20 DE JULIO, 2010',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_1_title: {
    key: 'story_moment_1_title',
    label: 'Momento 1 - Título',
    type: 'text',
    placeholder: 'Ej: Así Nos Conocimos',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_1_description: {
    key: 'story_moment_1_description',
    label: 'Momento 1 - Descripción',
    type: 'textarea',
    placeholder: 'Describe este momento especial de su historia...',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_1_imageUrl: {
    key: 'story_moment_1_imageUrl',
    label: 'Momento 1 - Imagen',
    type: 'url',
    placeholder: 'URL de la imagen del momento',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_2_date: {
    key: 'story_moment_2_date',
    label: 'Momento 2 - Fecha',
    type: 'text',
    placeholder: 'Ej: 1 DE AGOSTO, 2016',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_2_title: {
    key: 'story_moment_2_title',
    label: 'Momento 2 - Título',
    type: 'text',
    placeholder: 'Ej: Nuestra Primera Cita',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_2_description: {
    key: 'story_moment_2_description',
    label: 'Momento 2 - Descripción',
    type: 'textarea',
    placeholder: 'Describe este momento especial de su historia...',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_2_imageUrl: {
    key: 'story_moment_2_imageUrl',
    label: 'Momento 2 - Imagen',
    type: 'url',
    placeholder: 'URL de la imagen del momento',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_3_date: {
    key: 'story_moment_3_date',
    label: 'Momento 3 - Fecha',
    type: 'text',
    placeholder: 'Ej: 25 DE JUNIO, 2022',
    section: 'story',
    category: 'Momento 3'
  },

  story_moment_3_title: {
    key: 'story_moment_3_title',
    label: 'Momento 3 - Título',
    type: 'text',
    placeholder: 'Ej: Nos Comprometimos',
    section: 'story',
    category: 'Momento 3'
  },

  story_moment_3_description: {
    key: 'story_moment_3_description',
    label: 'Momento 3 - Descripción',
    type: 'textarea',
    placeholder: 'Describe este momento especial de su historia...',
    section: 'story',
    category: 'Momento 3'
  },

  story_moment_3_imageUrl: {
    key: 'story_moment_3_imageUrl',
    label: 'Momento 3 - Imagen',
    type: 'url',
    placeholder: 'URL de la imagen del momento',
    section: 'story',
    category: 'Momento 3'
  },

  // Gallery section fields - 10 images
  gallery_image_1_url: {
    key: 'gallery_image_1_url',
    label: 'Imagen 1 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_1_alt: {
    key: 'gallery_image_1_alt',
    label: 'Imagen 1 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_1_category: {
    key: 'gallery_image_1_category',
    label: 'Imagen 1 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_2_url: {
    key: 'gallery_image_2_url',
    label: 'Imagen 2 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_2_alt: {
    key: 'gallery_image_2_alt',
    label: 'Imagen 2 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_2_category: {
    key: 'gallery_image_2_category',
    label: 'Imagen 2 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_3_url: {
    key: 'gallery_image_3_url',
    label: 'Imagen 3 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_3_alt: {
    key: 'gallery_image_3_alt',
    label: 'Imagen 3 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_3_category: {
    key: 'gallery_image_3_category',
    label: 'Imagen 3 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_4_url: {
    key: 'gallery_image_4_url',
    label: 'Imagen 4 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_4_alt: {
    key: 'gallery_image_4_alt',
    label: 'Imagen 4 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_4_category: {
    key: 'gallery_image_4_category',
    label: 'Imagen 4 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_5_url: {
    key: 'gallery_image_5_url',
    label: 'Imagen 5 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_5_alt: {
    key: 'gallery_image_5_alt',
    label: 'Imagen 5 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_5_category: {
    key: 'gallery_image_5_category',
    label: 'Imagen 5 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_6_url: {
    key: 'gallery_image_6_url',
    label: 'Imagen 6 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_6_alt: {
    key: 'gallery_image_6_alt',
    label: 'Imagen 6 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_6_category: {
    key: 'gallery_image_6_category',
    label: 'Imagen 6 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_7_url: {
    key: 'gallery_image_7_url',
    label: 'Imagen 7 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_7_alt: {
    key: 'gallery_image_7_alt',
    label: 'Imagen 7 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_7_category: {
    key: 'gallery_image_7_category',
    label: 'Imagen 7 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_8_url: {
    key: 'gallery_image_8_url',
    label: 'Imagen 8 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_8_alt: {
    key: 'gallery_image_8_alt',
    label: 'Imagen 8 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_8_category: {
    key: 'gallery_image_8_category',
    label: 'Imagen 8 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_9_url: {
    key: 'gallery_image_9_url',
    label: 'Imagen 9 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_9_alt: {
    key: 'gallery_image_9_alt',
    label: 'Imagen 9 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_9_category: {
    key: 'gallery_image_9_category',
    label: 'Imagen 9 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_10_url: {
    key: 'gallery_image_10_url',
    label: 'Imagen 10 - URL',
    type: 'url',
    placeholder: 'URL de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_10_alt: {
    key: 'gallery_image_10_alt',
    label: 'Imagen 10 - Descripción',
    type: 'text',
    placeholder: 'Descripción de la imagen',
    section: 'gallery',
    category: 'Galería'
  },

  gallery_image_10_category: {
    key: 'gallery_image_10_category',
    label: 'Imagen 10 - Categoría',
    type: 'text',
    placeholder: 'ceremony, party, couple',
    section: 'gallery',
    category: 'Galería'
  },

  // Footer section fields
  copyrightText: {
    key: 'copyrightText',
    label: 'Texto de Copyright',
    type: 'text',
    placeholder: 'Hecho con Amor. All right reserved...',
    section: 'footer',
    category: 'Footer'
  }
};

/**
 * Get fields available for customization based on template sections
 */
export function getAvailableFields(activeSections: string[]): CustomizerField[] {
  const fieldsSet = new Set<string>();

  // Collect all fields from active sections
  activeSections.forEach(sectionName => {
    const section = SECTION_FIELDS_MAP[sectionName];
    if (section) {
      section.fields.forEach(fieldKey => fieldsSet.add(fieldKey));
    }
  });

  // Convert to field definitions
  return Array.from(fieldsSet)
    .map(fieldKey => FIELD_DEFINITIONS[fieldKey])
    .filter(Boolean)
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Get sections used in a template based on configuration
 * Preserves the order as defined in the database sections_config
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
 * Get ordered sections based on the order from the database (activeSections)
 * Only returns sections that have field mappings available
 */
export function getOrderedSections(activeSections: string[]): string[] {
  // Use the order from activeSections (which comes from DB) instead of hardcoded order
  return activeSections.filter(sectionName =>
    SECTION_FIELDS_MAP[sectionName] // Only include sections that have field definitions
  );
}

/**
 * Get fields grouped by ordered sections based on dynamic section order
 * Uses the order from activeSections (database order) instead of field appearance order
 */
export function getFieldsByOrderedSections(availableFields: CustomizerField[], activeSections: string[]): Record<string, CustomizerField[]> {
  const fieldsBySections: Record<string, CustomizerField[]> = {};

  // First pass: group fields by section
  availableFields.forEach(field => {
    if (field.section) {
      if (!fieldsBySections[field.section]) {
        fieldsBySections[field.section] = [];
      }
      fieldsBySections[field.section].push(field);
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