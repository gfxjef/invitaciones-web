/**
 * Kids Section-to-Fields Mapping Configuration
 *
 * WHY: Defines which fields are available for customization
 * in kids birthday party templates. This is isolated from other categories
 * to prevent field conflicts and enable category-specific customization.
 */

import { CustomizerField, SectionConfig } from './types';

// Map of kids section names to their editable fields (kids-specific)
export const KIDS_SECTION_FIELDS_MAP: Record<string, SectionConfig> = {
  'party-hero': {
    label: 'Portada de Fiesta',
    icon: '🎈',
    fields: [
      'childName',
      'age',
      'birthdayDate',
      'partyLocation',
      'partyTheme',
      'heroImageUrl',
      'backgroundColor',
      'accentColor'
    ]
  },

  'birthday-child': {
    label: 'El Cumpleañero',
    icon: '🎂',
    fields: [
      'childName',
      'childNickname',
      'age',
      'birthdayMessage',
      'favoriteColor',
      'favoriteToy',
      'favoriteFood',
      'hobbyOrInterest',
      'childPhotoUrl'
    ]
  },

  'party-games': {
    label: 'Juegos y Actividades',
    icon: '🎮',
    fields: [
      'gamesTitle',
      'gamesDescription',
      'game1Name',
      'game1Description',
      'game2Name',
      'game2Description',
      'game3Name',
      'game3Description',
      'activityTime',
      'specialInstructions'
    ]
  },

  'party-info': {
    label: 'Información de la Fiesta',
    icon: '🎉',
    fields: [
      'partyDate',
      'partyTime',
      'partyEndTime',
      'partyAddress',
      'parentPhone',
      'parentWhatsapp',
      'giftSuggestions',
      'dresscode',
      'specialNotes',
      'rsvpDeadline'
    ]
  }
};

// Kids field definitions (isolated from wedding fields)
export const KIDS_FIELD_DEFINITIONS: Record<string, CustomizerField> = {
  // Child Information
  childName: {
    key: 'childName',
    label: 'Nombre del Niño/a',
    type: 'text',
    section: 'party-hero',
    placeholder: 'Ej: Sofia Isabella',
    category: 'Información del Niño'
  },
  childNickname: {
    key: 'childNickname',
    label: 'Apodo o Diminutivo',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Sofi',
    category: 'Información del Niño'
  },
  age: {
    key: 'age',
    label: 'Edad',
    type: 'text',
    section: 'party-hero',
    placeholder: '5',
    category: 'Información del Niño'
  },
  birthdayMessage: {
    key: 'birthdayMessage',
    label: 'Mensaje de Cumpleaños',
    type: 'textarea',
    section: 'birthday-child',
    placeholder: 'Un mensaje especial sobre el cumpleañero...',
    category: 'Información del Niño'
  },

  // Party Details
  birthdayDate: {
    key: 'birthdayDate',
    label: 'Fecha de Cumpleaños',
    type: 'date',
    section: 'party-hero',
    category: 'Detalles de la Fiesta'
  },
  partyLocation: {
    key: 'partyLocation',
    label: 'Lugar de la Fiesta',
    type: 'text',
    section: 'party-hero',
    placeholder: 'Ej: Casa de Sofia',
    category: 'Detalles de la Fiesta'
  },
  partyTheme: {
    key: 'partyTheme',
    label: 'Tema de la Fiesta',
    type: 'text',
    section: 'party-hero',
    placeholder: 'Ej: Princesas, Superhéroes, Unicornios',
    category: 'Detalles de la Fiesta'
  },

  // Child Preferences
  favoriteColor: {
    key: 'favoriteColor',
    label: 'Color Favorito',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Rosa, Azul, Verde',
    category: 'Preferencias del Niño'
  },
  favoriteToy: {
    key: 'favoriteToy',
    label: 'Juguete Favorito',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Muñecas, Carros, Legos',
    category: 'Preferencias del Niño'
  },
  favoriteFood: {
    key: 'favoriteFood',
    label: 'Comida Favorita',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Pizza, Helado, Galletas',
    category: 'Preferencias del Niño'
  },
  hobbyOrInterest: {
    key: 'hobbyOrInterest',
    label: 'Hobby o Interés',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Bailar, Dibujar, Fútbol',
    category: 'Preferencias del Niño'
  },

  // Visual Elements
  heroImageUrl: {
    key: 'heroImageUrl',
    label: 'Imagen de Portada',
    type: 'url',
    section: 'party-hero',
    placeholder: 'URL de la imagen de fondo',
    category: 'Elementos Visuales'
  },
  childPhotoUrl: {
    key: 'childPhotoUrl',
    label: 'Foto del Cumpleañero',
    type: 'url',
    section: 'birthday-child',
    placeholder: 'URL de la foto del niño/a',
    category: 'Elementos Visuales'
  },
  backgroundColor: {
    key: 'backgroundColor',
    label: 'Color de Fondo',
    type: 'color',
    section: 'party-hero',
    placeholder: '#FFB6C1',
    category: 'Elementos Visuales'
  },
  accentColor: {
    key: 'accentColor',
    label: 'Color de Acento',
    type: 'color',
    section: 'party-hero',
    placeholder: '#FF69B4',
    category: 'Elementos Visuales'
  },

  // Party Information
  partyDate: {
    key: 'partyDate',
    label: 'Fecha de la Fiesta',
    type: 'date',
    section: 'party-info',
    category: 'Información de la Fiesta'
  },
  partyTime: {
    key: 'partyTime',
    label: 'Hora de Inicio',
    type: 'time',
    section: 'party-info',
    category: 'Información de la Fiesta'
  },
  partyEndTime: {
    key: 'partyEndTime',
    label: 'Hora de Finalización',
    type: 'time',
    section: 'party-info',
    category: 'Información de la Fiesta'
  },
  partyAddress: {
    key: 'partyAddress',
    label: 'Dirección Completa',
    type: 'textarea',
    section: 'party-info',
    placeholder: 'Dirección completa del lugar de la fiesta',
    category: 'Información de la Fiesta'
  },
  parentPhone: {
    key: 'parentPhone',
    label: 'Teléfono de Contacto',
    type: 'text',
    section: 'party-info',
    placeholder: '+51 999 999 999',
    category: 'Información de la Fiesta'
  },
  parentWhatsapp: {
    key: 'parentWhatsapp',
    label: 'WhatsApp',
    type: 'text',
    section: 'party-info',
    placeholder: '51999999999',
    category: 'Información de la Fiesta'
  },
  giftSuggestions: {
    key: 'giftSuggestions',
    label: 'Sugerencias de Regalos',
    type: 'textarea',
    section: 'party-info',
    placeholder: 'Libros, juguetes educativos, ropa talla X...',
    category: 'Información de la Fiesta'
  },
  dresscode: {
    key: 'dresscode',
    label: 'Código de Vestimenta',
    type: 'text',
    section: 'party-info',
    placeholder: 'Ej: Casual, disfraces del tema, colores específicos',
    category: 'Información de la Fiesta'
  },
  specialNotes: {
    key: 'specialNotes',
    label: 'Notas Especiales',
    type: 'textarea',
    section: 'party-info',
    placeholder: 'Alergias, instrucciones especiales, etc.',
    category: 'Información de la Fiesta'
  },
  rsvpDeadline: {
    key: 'rsvpDeadline',
    label: 'Confirmar Antes del',
    type: 'date',
    section: 'party-info',
    category: 'Información de la Fiesta'
  },

  // Party Games Fields
  gamesTitle: {
    key: 'gamesTitle',
    label: 'Título de Juegos',
    type: 'text',
    section: 'party-games',
    placeholder: 'Ej: Juegos y Actividades Divertidas',
    category: 'Juegos y Actividades'
  },
  gamesDescription: {
    key: 'gamesDescription',
    label: 'Descripción de Juegos',
    type: 'textarea',
    section: 'party-games',
    placeholder: 'Descripción general de las actividades planeadas...',
    category: 'Juegos y Actividades'
  },
  game1Name: {
    key: 'game1Name',
    label: 'Nombre del Juego 1',
    type: 'text',
    section: 'party-games',
    placeholder: 'Ej: La Pirinola',
    category: 'Juegos y Actividades'
  },
  game1Description: {
    key: 'game1Description',
    label: 'Descripción del Juego 1',
    type: 'textarea',
    section: 'party-games',
    placeholder: 'Cómo se juega este juego...',
    category: 'Juegos y Actividades'
  },
  game2Name: {
    key: 'game2Name',
    label: 'Nombre del Juego 2',
    type: 'text',
    section: 'party-games',
    placeholder: 'Ej: Buscar el Tesoro',
    category: 'Juegos y Actividades'
  },
  game2Description: {
    key: 'game2Description',
    label: 'Descripción del Juego 2',
    type: 'textarea',
    section: 'party-games',
    placeholder: 'Cómo se juega este juego...',
    category: 'Juegos y Actividades'
  },
  game3Name: {
    key: 'game3Name',
    label: 'Nombre del Juego 3',
    type: 'text',
    section: 'party-games',
    placeholder: 'Ej: Baile Musical',
    category: 'Juegos y Actividades'
  },
  game3Description: {
    key: 'game3Description',
    label: 'Descripción del Juego 3',
    type: 'textarea',
    section: 'party-games',
    placeholder: 'Cómo se juega este juego...',
    category: 'Juegos y Actividades'
  },
  activityTime: {
    key: 'activityTime',
    label: 'Tiempo de Actividades',
    type: 'text',
    section: 'party-games',
    placeholder: 'Ej: 30 minutos cada juego',
    category: 'Juegos y Actividades'
  },
  specialInstructions: {
    key: 'specialInstructions',
    label: 'Instrucciones Especiales',
    type: 'textarea',
    section: 'party-games',
    placeholder: 'Instrucciones adicionales para los juegos...',
    category: 'Juegos y Actividades'
  },
};

/**
 * Get available kids fields for customizer
 */
export function getAvailableKidsFields(): CustomizerField[] {
  return Object.values(KIDS_FIELD_DEFINITIONS);
}

/**
 * Detect active kids sections from template configuration
 */
export function detectActiveKidsSections(sectionsConfig: any, templateData?: any): string[] {
  if (!sectionsConfig || typeof sectionsConfig !== 'object') {
    return [];
  }

  const activeSections: string[] = [];

  // Use sections_config_ordered if available for proper order
  if (templateData?.sections_config_ordered) {
    const orderedSections = templateData.sections_config_ordered.map((item: [string, string]) => item[0]);
    return orderedSections.filter((sectionName: string) =>
      KIDS_SECTION_FIELDS_MAP[sectionName] // Only include sections that have field definitions
    );
  }

  // Fallback to Object.keys if sections_config_ordered is not available
  Object.keys(sectionsConfig).forEach(sectionName => {
    const section = KIDS_SECTION_FIELDS_MAP[sectionName];
    if (section) {
      activeSections.push(sectionName);
    }
  });

  return activeSections;
}

/**
 * Get kids fields organized by sections in the correct order
 */
export function getKidsFieldsByOrderedSections(availableFields: CustomizerField[], activeSections: string[]): Record<string, CustomizerField[]> {
  const fieldsBySection: Record<string, CustomizerField[]> = {};

  // Initialize sections in the correct order
  activeSections.forEach(sectionName => {
    fieldsBySection[sectionName] = [];
  });

  // Group fields by their sections
  availableFields.forEach(field => {
    if (fieldsBySection[field.section]) {
      fieldsBySection[field.section].push(field);
    }
  });

  return fieldsBySection;
}