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
    validation: { required: true }
  },
  childNickname: {
    key: 'childNickname',
    label: 'Apodo o Diminutivo',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Sofi',
  },
  age: {
    key: 'age',
    label: 'Edad',
    type: 'number',
    section: 'party-hero',
    placeholder: '5',
    validation: { required: true, min: 1, max: 18 }
  },
  birthdayMessage: {
    key: 'birthdayMessage',
    label: 'Mensaje de Cumpleaños',
    type: 'textarea',
    section: 'birthday-child',
    placeholder: 'Un mensaje especial sobre el cumpleañero...',
  },

  // Party Details
  birthdayDate: {
    key: 'birthdayDate',
    label: 'Fecha de Cumpleaños',
    type: 'date',
    section: 'party-hero',
    validation: { required: true }
  },
  partyLocation: {
    key: 'partyLocation',
    label: 'Lugar de la Fiesta',
    type: 'text',
    section: 'party-hero',
    placeholder: 'Ej: Casa de Sofia',
    validation: { required: true }
  },
  partyTheme: {
    key: 'partyTheme',
    label: 'Tema de la Fiesta',
    type: 'text',
    section: 'party-hero',
    placeholder: 'Ej: Princesas, Superhéroes, Unicornios',
  },

  // Child Preferences
  favoriteColor: {
    key: 'favoriteColor',
    label: 'Color Favorito',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Rosa, Azul, Verde',
  },
  favoriteToy: {
    key: 'favoriteToy',
    label: 'Juguete Favorito',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Muñecas, Carros, Legos',
  },
  favoriteFood: {
    key: 'favoriteFood',
    label: 'Comida Favorita',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Pizza, Helado, Galletas',
  },
  hobbyOrInterest: {
    key: 'hobbyOrInterest',
    label: 'Hobby o Interés',
    type: 'text',
    section: 'birthday-child',
    placeholder: 'Ej: Bailar, Dibujar, Fútbol',
  },

  // Visual Elements
  heroImageUrl: {
    key: 'heroImageUrl',
    label: 'Imagen de Portada',
    type: 'image',
    section: 'party-hero',
    placeholder: 'URL de la imagen de fondo',
  },
  childPhotoUrl: {
    key: 'childPhotoUrl',
    label: 'Foto del Cumpleañero',
    type: 'image',
    section: 'birthday-child',
    placeholder: 'URL de la foto del niño/a',
  },
  backgroundColor: {
    key: 'backgroundColor',
    label: 'Color de Fondo',
    type: 'color',
    section: 'party-hero',
    placeholder: '#FFB6C1',
  },
  accentColor: {
    key: 'accentColor',
    label: 'Color de Acento',
    type: 'color',
    section: 'party-hero',
    placeholder: '#FF69B4',
  },

  // Party Information
  partyDate: {
    key: 'partyDate',
    label: 'Fecha de la Fiesta',
    type: 'date',
    section: 'party-info',
    validation: { required: true }
  },
  partyTime: {
    key: 'partyTime',
    label: 'Hora de Inicio',
    type: 'time',
    section: 'party-info',
    validation: { required: true }
  },
  partyEndTime: {
    key: 'partyEndTime',
    label: 'Hora de Finalización',
    type: 'time',
    section: 'party-info',
  },
  partyAddress: {
    key: 'partyAddress',
    label: 'Dirección Completa',
    type: 'textarea',
    section: 'party-info',
    placeholder: 'Dirección completa del lugar de la fiesta',
    validation: { required: true }
  },
  parentPhone: {
    key: 'parentPhone',
    label: 'Teléfono de Contacto',
    type: 'tel',
    section: 'party-info',
    placeholder: '+51 999 999 999',
  },
  parentWhatsapp: {
    key: 'parentWhatsapp',
    label: 'WhatsApp',
    type: 'tel',
    section: 'party-info',
    placeholder: '51999999999',
  },
  giftSuggestions: {
    key: 'giftSuggestions',
    label: 'Sugerencias de Regalos',
    type: 'textarea',
    section: 'party-info',
    placeholder: 'Libros, juguetes educativos, ropa talla X...',
  },
  dresscode: {
    key: 'dresscode',
    label: 'Código de Vestimenta',
    type: 'text',
    section: 'party-info',
    placeholder: 'Ej: Casual, disfraces del tema, colores específicos',
  },
  specialNotes: {
    key: 'specialNotes',
    label: 'Notas Especiales',
    type: 'textarea',
    section: 'party-info',
    placeholder: 'Alergias, instrucciones especiales, etc.',
  },
  rsvpDeadline: {
    key: 'rsvpDeadline',
    label: 'Confirmar Antes del',
    type: 'date',
    section: 'party-info',
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