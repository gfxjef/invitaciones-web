/**
 * Wedding Section-to-Fields Mapping Configuration
 *
 * WHY: Defines which fields are available for customization
 * in wedding templates. This is isolated from other categories
 * to prevent field conflicts and enable category-specific customization.
 */

import { CustomizerField, SectionConfig } from '@/components/customizer/types';

// Section display order is now determined dynamically from the database sections_config
// No longer using hardcoded SECTION_DISPLAY_ORDER - order comes from Template.sections_config

// SECTION VARIANTS FIELDS CONFIGURATION
// Maps specific section variants to their required fields for maximum scalability
export const SECTION_VARIANTS_FIELDS: Record<string, string[]> = {
  // Hero Variants
  'hero_1': [
    'groom_name',
    'bride_name',
    'weddingDate',
    'eventLocation',
    'heroImageUrl'
  ],
  'hero_2': [
    'groom_name',
    'bride_name',
    'weddingDate',
    'eventLocation',
    'heroImageUrl'
  ],

  // Welcome Variants
  'welcome_1': [
    'welcome_welcomeText',
    'welcome_title',
    'welcome_description',
    'welcome_couplePhotoUrl',
    'welcome_bannerImageUrl'
  ],
  'welcome_2': [
    'welcome_description'  // Only description for minimalist design
  ],

  // Familiares Variants
  'familiares_1': [
    'familiares_titulo_padres',
    'familiares_titulo_padrinos',
    'familiares_padre_novio',
    'familiares_madre_novio',
    'familiares_padre_novia',
    'familiares_madre_novia',
    'familiares_padrino',
    'familiares_madrina'
  ],

  // PlaceReligioso Variants
  'place_religioso_1': [
    'place_religioso_titulo',
    'weddingDate',
    'place_religioso_lugar',
    'place_religioso_direccion',
    'place_religioso_mapa_url'
  ],

  // PlaceCeremonia Variants
  'place_ceremonia_1': [
    'place_ceremonia_titulo',
    'weddingDate',
    'place_ceremonia_hora',
    'place_ceremonia_lugar',
    'place_ceremonia_direccion',
    'place_ceremonia_mapa_url'
  ],

  // Vestimenta Variants
  'vestimenta_1': [
    'vestimenta_titulo',
    'vestimenta_etiqueta',
    'vestimenta_no_colores_titulo',
    'vestimenta_no_colores_info'
  ],

  // Future variants can be added here:
  // 'welcome_3': ['welcome_title', 'welcome_subtitle', 'welcome_backgroundVideo'],
  // 'hero_3': ['groom_name', 'bride_name', 'heroVideoUrl'],
};

// Map of wedding section names to their editable fields (wedding-specific)
export const WEDDING_SECTION_FIELDS_MAP: Record<string, SectionConfig> = {
  hero: {
    label: 'Portada',
    icon: '🎭',
    fields: [
      'groom_name',
      'bride_name',
      'weddingDate',
      'eventLocation',
      'heroImageUrl'
    ]
  },

  welcome: {
    label: 'Bienvenida',
    icon: '👋',
    fields: [
      'welcome_welcomeText',
      'welcome_title',
      'welcome_description',
      'welcome_couplePhotoUrl',
      'welcome_bannerImageUrl'
    ]
  },

  couple: {
    label: 'Los Novios',
    icon: '💑',
    fields: [
      'couple_sectionTitle',
      'couple_sectionSubtitle',
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
      'countdown_backgroundImageUrl',
      'countdown_preTitle',
      'countdown_title'
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
      'gallery_images'
    ]
  },

  video: {
    label: 'Video',
    icon: '🎥',
    fields: [
      'video_backgroundImageUrl',
      'video_videoEmbedUrl',
      'video_preTitle',
      'video_title'
    ]
  },

  itinerary: {
    label: 'Itinerario',
    icon: '📅',
    fields: [
      'itinerary_title',
      'itinerary_event_ceremonia_enabled',
      'itinerary_event_ceremonia_time',
      'itinerary_event_recepcion_enabled',
      'itinerary_event_recepcion_time',
      'itinerary_event_entrada_enabled',
      'itinerary_event_entrada_time',
      'itinerary_event_comida_enabled',
      'itinerary_event_comida_time',
      'itinerary_event_fiesta_enabled',
      'itinerary_event_fiesta_time'
    ]
  },

  familiares: {
    label: 'Familiares',
    icon: '👨‍👩‍👧‍👦',
    fields: [
      'familiares_titulo_padres',
      'familiares_titulo_padrinos',
      'familiares_padre_novio',
      'familiares_madre_novio',
      'familiares_padre_novia',
      'familiares_madre_novia',
      'familiares_padrino',
      'familiares_madrina'
    ]
  },

  place_religioso: {
    label: 'Lugar Religioso',
    icon: '⛪',
    fields: [
      'place_religioso_titulo',
      'weddingDate',
      'place_religioso_lugar',
      'place_religioso_direccion',
      'place_religioso_mapa_url'
    ]
  },

  place_ceremonia: {
    label: 'Lugar Ceremonia',
    icon: '🥂',
    fields: [
      'place_ceremonia_titulo',
      'weddingDate',
      'place_ceremonia_hora',
      'place_ceremonia_lugar',
      'place_ceremonia_direccion',
      'place_ceremonia_mapa_url'
    ]
  },

  vestimenta: {
    label: 'Vestimenta',
    icon: '👗',
    fields: [
      'vestimenta_titulo',
      'vestimenta_etiqueta',
      'vestimenta_no_colores_titulo',
      'vestimenta_no_colores_info'
    ]
  },

  footer: {
    label: 'Pie de Página',
    icon: '📝',
    fields: [
      'groom_name',
      'bride_name',
      'weddingDate',
      'eventLocation',
      'footer_copyrightText'
    ]
  }
};

// Complete field definitions with UI metadata (matching actual template component props)
export const FIELD_DEFINITIONS: Record<string, CustomizerField> = {
  // Hero section fields - Individual names (replacing legacy coupleNames)

  weddingDate: {
    key: 'weddingDate',
    label: 'Fecha y Hora del Evento',
    type: 'datetime-local',
    section: ['hero', 'footer', 'countdown', 'place_religioso'],
    category: 'Evento'
  },

  eventLocation: {
    key: 'eventLocation',
    label: 'Lugar del Evento',
    type: 'text',
    // placeholder:'Ej: LIMA - PERÚ',
    section: ['hero', 'footer'],
    category: 'Evento'
  },

  heroImageUrl: {
    key: 'heroImageUrl',
    label: 'Imagen de Portada',
    type: 'url',
    // placeholder:'URL de la imagen de fondo',
    section: 'hero',
    category: 'Imágenes'
  },

  // Welcome section fields
  welcome_welcomeText: {
    key: 'welcome_welcomeText',
    label: 'Texto de Bienvenida',
    type: 'text',
    // placeholder:'Ej: Hola & Bienvenidos',
    section: 'welcome',
    category: 'Mensajes'
  },

  welcome_title: {
    key: 'welcome_title',
    label: 'Título Principal',
    type: 'text',
    // placeholder:'Ej: Nos Vamos a Casar!!!!',
    section: 'welcome',
    category: 'Mensajes'
  },

  welcome_description: {
    key: 'welcome_description',
    label: 'Descripción',
    type: 'textarea',
    // placeholder:'Mensaje de amor y compromiso...',
    section: 'welcome',
    category: 'Mensajes'
  },

  welcome_couplePhotoUrl: {
    key: 'welcome_couplePhotoUrl',
    label: 'Foto de la Pareja',
    type: 'url',
    // placeholder:'URL de la foto de la pareja',
    section: 'welcome',
    category: 'Imágenes'
  },

  welcome_bannerImageUrl: {
    key: 'welcome_bannerImageUrl',
    label: 'Imagen de Banner',
    type: 'url',
    // placeholder:'URL de la imagen de banner',
    section: 'welcome',
    category: 'Imágenes'
  },

  // Couple section fields
  couple_sectionTitle: {
    key: 'couple_sectionTitle',
    label: 'Título de Sección',
    type: 'text',
    // placeholder:'Ej: Futuros Felices Esposos',
    section: 'couple',
    category: 'Títulos'
  },

  couple_sectionSubtitle: {
    key: 'couple_sectionSubtitle',
    label: 'Subtítulo de Sección',
    type: 'text',
    // placeholder:'Ej: MARIDO & MUJER',
    section: 'couple',
    category: 'Títulos'
  },

  bride_name: {
    key: 'bride_name',
    label: 'Nombre de la Novia',
    type: 'text',
    // placeholder:'Ej: Rosmery Guiterrez',
    section: ['hero', 'couple', 'footer'],  // Campo compartido entre múltiples secciones
    category: 'Pareja'
  },

  bride_role: {
    key: 'bride_role',
    label: 'Rol de la Novia',
    type: 'text',
    // placeholder:'Ej: La Novia',
    section: 'couple',
    category: 'Novia'
  },

  bride_description: {
    key: 'bride_description',
    label: 'Descripción de la Novia',
    type: 'textarea',
    // placeholder:'Mensaje personal para la novia...',
    section: 'couple',
    category: 'Novia'
  },

  bride_imageUrl: {
    key: 'bride_imageUrl',
    label: 'Foto de la Novia',
    type: 'url',
    // placeholder:'URL de la foto de la novia',
    section: 'couple',
    category: 'Novia'
  },

  groom_name: {
    key: 'groom_name',
    label: 'Nombre del Novio',
    type: 'text',
    // placeholder:'Ej: Jefferson Camacho',
    section: ['hero', 'couple', 'footer'],  // Campo compartido entre múltiples secciones
    category: 'Pareja'
  },

  groom_role: {
    key: 'groom_role',
    label: 'Rol del Novio',
    type: 'text',
    // placeholder:'Ej: El Novio',
    section: 'couple',
    category: 'Novio'
  },

  groom_description: {
    key: 'groom_description',
    label: 'Descripción del Novio',
    type: 'textarea',
    // placeholder:'Mensaje personal para el novio...',
    section: 'couple',
    category: 'Novio'
  },

  groom_imageUrl: {
    key: 'groom_imageUrl',
    label: 'Foto del Novio',
    type: 'url',
    // placeholder:'URL de la foto del novio',
    section: 'couple',
    category: 'Novio'
  },

  // Countdown section fields

  countdown_backgroundImageUrl: {
    key: 'countdown_backgroundImageUrl',
    label: 'Imagen de Fondo',
    type: 'url',
    // placeholder:'URL de la imagen de fondo',
    section: 'countdown',
    category: 'Imágenes'
  },

  countdown_preTitle: {
    key: 'countdown_preTitle',
    label: 'Pre-título',
    type: 'text',
    // placeholder:'Ej: DENTRO DE POCO SEREMOS UNA FAMILIA',
    section: 'countdown',
    category: 'Títulos'
  },

  countdown_title: {
    key: 'countdown_title',
    label: 'Título Principal',
    type: 'text',
    // placeholder:'Ej: CUENTA REGRESIVA',
    section: 'countdown',
    category: 'Títulos'
  },

  // Video section fields
  video_backgroundImageUrl: {
    key: 'video_backgroundImageUrl',
    label: 'Imagen de Fondo',
    type: 'url',
    // placeholder:'URL de la imagen de fondo',
    section: 'video',
    category: 'Imágenes'
  },

  video_videoEmbedUrl: {
    key: 'video_videoEmbedUrl',
    label: 'URL del Video (Embed)',
    type: 'url',
    // placeholder:'https://www.youtube.com/embed/...',
    section: 'video',
    category: 'Multimedia'
  },

  video_preTitle: {
    key: 'video_preTitle',
    label: 'Pre-título',
    type: 'text',
    // placeholder:'Ej: NUESTRO VIDEO',
    section: 'video',
    category: 'Títulos'
  },

  video_title: {
    key: 'video_title',
    label: 'Título Principal',
    type: 'text',
    // placeholder:'Ej: REPRODUCIR VIDEO',
    section: 'video',
    category: 'Títulos'
  },

  // Itinerary section fields
  itinerary_title: {
    key: 'itinerary_title',
    label: 'Título del Itinerario',
    type: 'text',
    section: 'itinerary',
    category: 'Títulos'
  },

  // Ceremonia event
  itinerary_event_ceremonia_enabled: {
    key: 'itinerary_event_ceremonia_enabled',
    label: 'Ceremonia',
    type: 'toggle',
    section: 'itinerary',
    category: 'Eventos'
  },

  itinerary_event_ceremonia_time: {
    key: 'itinerary_event_ceremonia_time',
    label: '',
    type: 'time',
    section: 'itinerary',
    category: 'Eventos'
  },

  // Recepción event
  itinerary_event_recepcion_enabled: {
    key: 'itinerary_event_recepcion_enabled',
    label: 'Recepción',
    type: 'toggle',
    section: 'itinerary',
    category: 'Eventos'
  },

  itinerary_event_recepcion_time: {
    key: 'itinerary_event_recepcion_time',
    label: '',
    type: 'time',
    section: 'itinerary',
    category: 'Eventos'
  },

  // Entrada event
  itinerary_event_entrada_enabled: {
    key: 'itinerary_event_entrada_enabled',
    label: 'Entrada',
    type: 'toggle',
    section: 'itinerary',
    category: 'Eventos'
  },

  itinerary_event_entrada_time: {
    key: 'itinerary_event_entrada_time',
    label: '',
    type: 'time',
    section: 'itinerary',
    category: 'Eventos'
  },

  // Comida event
  itinerary_event_comida_enabled: {
    key: 'itinerary_event_comida_enabled',
    label: 'Comida',
    type: 'toggle',
    section: 'itinerary',
    category: 'Eventos'
  },

  itinerary_event_comida_time: {
    key: 'itinerary_event_comida_time',
    label: '',
    type: 'time',
    section: 'itinerary',
    category: 'Eventos'
  },

  // Fiesta event
  itinerary_event_fiesta_enabled: {
    key: 'itinerary_event_fiesta_enabled',
    label: 'Fiesta',
    type: 'toggle',
    section: 'itinerary',
    category: 'Eventos'
  },

  itinerary_event_fiesta_time: {
    key: 'itinerary_event_fiesta_time',
    label: '',
    type: 'time',
    section: 'itinerary',
    category: 'Eventos'
  },

  // Familiares section fields - Titles and Parents and Godparents
  familiares_titulo_padres: {
    key: 'familiares_titulo_padres',
    label: 'Título de la Sección de Padres',
    type: 'text',
    section: 'familiares',
    category: 'Títulos'
  },

  familiares_titulo_padrinos: {
    key: 'familiares_titulo_padrinos',
    label: 'Título de la Sección de Padrinos',
    type: 'text',
    section: 'familiares',
    category: 'Títulos'
  },

  familiares_padre_novio: {
    key: 'familiares_padre_novio',
    label: 'Padre del Novio',
    type: 'text',
    section: 'familiares',
    category: 'Padres'
  },

  familiares_madre_novio: {
    key: 'familiares_madre_novio',
    label: 'Madre del Novio',
    type: 'text',
    section: 'familiares',
    category: 'Padres'
  },

  familiares_padre_novia: {
    key: 'familiares_padre_novia',
    label: 'Padre de la Novia',
    type: 'text',
    section: 'familiares',
    category: 'Padres'
  },

  familiares_madre_novia: {
    key: 'familiares_madre_novia',
    label: 'Madre de la Novia',
    type: 'text',
    section: 'familiares',
    category: 'Padres'
  },

  familiares_padrino: {
    key: 'familiares_padrino',
    label: 'Nombre del Padrino',
    type: 'text',
    section: 'familiares',
    category: 'Padrinos'
  },

  familiares_madrina: {
    key: 'familiares_madrina',
    label: 'Nombre de la Madrina',
    type: 'text',
    section: 'familiares',
    category: 'Padrinos'
  },

  // PlaceReligioso section fields - Religious location details
  place_religioso_titulo: {
    key: 'place_religioso_titulo',
    label: 'Título de la Sección',
    type: 'text',
    section: 'place_religioso',
    category: 'Títulos'
  },

  place_religioso_lugar: {
    key: 'place_religioso_lugar',
    label: 'Nombre del Lugar Religioso',
    type: 'text',
    section: 'place_religioso',
    category: 'Lugar'
  },

  place_religioso_direccion: {
    key: 'place_religioso_direccion',
    label: 'Dirección Completa',
    type: 'textarea',
    section: 'place_religioso',
    category: 'Lugar'
  },


  place_religioso_mapa_url: {
    key: 'place_religioso_mapa_url',
    label: 'URL del Mapa (Google Maps)',
    type: 'url',
    section: 'place_religioso',
    category: 'Lugar'
  },

  // PlaceCeremonia section fields - Post-ceremony reception location details
  place_ceremonia_titulo: {
    key: 'place_ceremonia_titulo',
    label: 'Título de la Sección',
    type: 'text',
    section: 'place_ceremonia',
    category: 'Títulos'
  },

  place_ceremonia_hora: {
    key: 'place_ceremonia_hora',
    label: 'Hora de la Ceremonia',
    type: 'time',
    section: 'place_ceremonia',
    category: 'Hora'
  },

  place_ceremonia_lugar: {
    key: 'place_ceremonia_lugar',
    label: 'Nombre del Lugar de Ceremonia',
    type: 'text',
    section: 'place_ceremonia',
    category: 'Lugar'
  },

  place_ceremonia_direccion: {
    key: 'place_ceremonia_direccion',
    label: 'Dirección Completa',
    type: 'textarea',
    section: 'place_ceremonia',
    category: 'Lugar'
  },

  place_ceremonia_mapa_url: {
    key: 'place_ceremonia_mapa_url',
    label: 'URL del Mapa (Google Maps)',
    type: 'url',
    section: 'place_ceremonia',
    category: 'Lugar'
  },

  // Vestimenta section fields
  vestimenta_titulo: {
    key: 'vestimenta_titulo',
    label: 'Título Principal',
    type: 'text',
    section: 'vestimenta',
    category: 'Títulos'
  },

  vestimenta_etiqueta: {
    key: 'vestimenta_etiqueta',
    label: 'Etiqueta del Evento',
    type: 'text',
    section: 'vestimenta',
    category: 'Código de Vestimenta'
  },

  vestimenta_no_colores_titulo: {
    key: 'vestimenta_no_colores_titulo',
    label: 'Título de Colores No Permitidos',
    type: 'text',
    section: 'vestimenta',
    category: 'Restricciones'
  },

  vestimenta_no_colores_info: {
    key: 'vestimenta_no_colores_info',
    label: 'Lista de Colores No Permitidos',
    type: 'textarea',
    section: 'vestimenta',
    category: 'Restricciones'
  },

  // Story section fields - 3 moments
  story_moment_1_date: {
    key: 'story_moment_1_date',
    label: 'Momento 1 - Fecha',
    type: 'text',
    // placeholder:'Ej: 20 DE JULIO, 2010',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_1_title: {
    key: 'story_moment_1_title',
    label: 'Momento 1 - Título',
    type: 'text',
    // placeholder:'Ej: Así Nos Conocimos',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_1_description: {
    key: 'story_moment_1_description',
    label: 'Momento 1 - Descripción',
    type: 'textarea',
    // placeholder:'Describe este momento especial de su historia...',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_1_imageUrl: {
    key: 'story_moment_1_imageUrl',
    label: 'Momento 1 - Imagen',
    type: 'url',
    // placeholder:'URL de la imagen del momento',
    section: 'story',
    category: 'Momento 1'
  },

  story_moment_2_date: {
    key: 'story_moment_2_date',
    label: 'Momento 2 - Fecha',
    type: 'text',
    // placeholder:'Ej: 1 DE AGOSTO, 2016',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_2_title: {
    key: 'story_moment_2_title',
    label: 'Momento 2 - Título',
    type: 'text',
    // placeholder:'Ej: Nuestra Primera Cita',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_2_description: {
    key: 'story_moment_2_description',
    label: 'Momento 2 - Descripción',
    type: 'textarea',
    // placeholder:'Describe este momento especial de su historia...',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_2_imageUrl: {
    key: 'story_moment_2_imageUrl',
    label: 'Momento 2 - Imagen',
    type: 'url',
    // placeholder:'URL de la imagen del momento',
    section: 'story',
    category: 'Momento 2'
  },

  story_moment_3_date: {
    key: 'story_moment_3_date',
    label: 'Momento 3 - Fecha',
    type: 'text',
    // placeholder:'Ej: 25 DE JUNIO, 2022',
    section: 'story',
    category: 'Momento 3'
  },

  story_moment_3_title: {
    key: 'story_moment_3_title',
    label: 'Momento 3 - Título',
    type: 'text',
    // placeholder:'Ej: Nos Comprometimos',
    section: 'story',
    category: 'Momento 3'
  },

  story_moment_3_description: {
    key: 'story_moment_3_description',
    label: 'Momento 3 - Descripción',
    type: 'textarea',
    // placeholder:'Describe este momento especial de su historia...',
    section: 'story',
    category: 'Momento 3'
  },

  story_moment_3_imageUrl: {
    key: 'story_moment_3_imageUrl',
    label: 'Momento 3 - Imagen',
    type: 'url',
    // placeholder:'URL de la imagen del momento',
    section: 'story',
    category: 'Momento 3'
  },

  // Gallery section - Unified multi-image field
  gallery_images: {
    key: 'gallery_images',
    label: 'Fotos de la Galería',
    type: 'multi-image',
    section: 'gallery',
    category: 'Galería',
    maxImages: 9,
    placeholder: 'Selecciona hasta 9 fotos para tu galería...'
  },

  // Footer section fields - Using individual names (removing legacy footer_coupleNames)



  footer_copyrightText: {
    key: 'footer_copyrightText',
    label: 'Texto de Copyright',
    type: 'text',
    // placeholder:'Hecho con Amor. All right reserved...',
    section: 'footer',
    category: 'Footer'
  }
};

/**
 * Get fields available for customization based on template sections
 */
export function getAvailableFields(activeSections: string[]): CustomizerField[] {
  // 🚨 DEBUG: Log available fields calculation
  console.log('🔍 getAvailableFields called with activeSections:', activeSections);

  const fieldsSet = new Set<string>();

  // Collect all fields from active sections
  activeSections.forEach(sectionName => {
    const section = WEDDING_SECTION_FIELDS_MAP[sectionName];
    if (section) {
      console.log(`🔍 Section "${sectionName}" has fields:`, section.fields);
      section.fields.forEach(fieldKey => fieldsSet.add(fieldKey));

      // Check specifically for gallery_images
      if (sectionName === 'gallery' && section.fields.includes('gallery_images')) {
        console.log('✅ gallery_images found in gallery section fields');
      }
    } else {
      console.log(`❌ No field mapping found for section "${sectionName}"`);
    }
  });

  console.log('🔍 All collected field keys:', Array.from(fieldsSet));
  console.log('🔍 gallery_images in fieldsSet?', fieldsSet.has('gallery_images'));

  // Convert to field definitions
  const result = Array.from(fieldsSet)
    .map(fieldKey => {
      const definition = FIELD_DEFINITIONS[fieldKey];
      if (!definition && fieldKey === 'gallery_images') {
        console.log('❌ gallery_images field definition NOT FOUND in FIELD_DEFINITIONS');
      }
      return definition;
    })
    .filter(Boolean)
    .sort((a, b) => a.category.localeCompare(b.category));

  console.log('🎯 getAvailableFields final result:', {
    totalFields: result.length,
    galleryImagesIncluded: result.some(f => f.key === 'gallery_images'),
    fieldKeys: result.map(f => f.key)
  });

  return result;
}

/**
 * Get sections used in a template based on configuration
 * Preserves the order as defined in the database sections_config
 */
export function detectActiveSections(sectionsConfig: any, templateData?: any): string[] {
  // 🚨 DEBUG: Log input parameters
  console.log('🔍 detectActiveSections called with:', {
    sectionsConfig,
    templateData,
    sections_config_ordered: templateData?.sections_config_ordered
  });

  if (!sectionsConfig) {
    console.log('❌ detectActiveSections: No sectionsConfig provided');
    return [];
  }

  let sectionOrder: string[];

  // Use sections_config_ordered if available (preserves database order)
  if (templateData?.sections_config_ordered && Array.isArray(templateData.sections_config_ordered)) {
    sectionOrder = templateData.sections_config_ordered.map((item: [string, string]) => item[0]);
    console.log('✅ Using sections_config_ordered:', sectionOrder);
  } else {
    // Fallback to Object.keys (may be alphabetical due to JSON serialization)
    sectionOrder = Object.keys(sectionsConfig);
    console.log('✅ Using Object.keys fallback:', sectionOrder);
  }

  // Filter to only enabled sections while preserving order
  const result = sectionOrder.filter(sectionName => {
    const value = sectionsConfig[sectionName];
    const isEnabled = value === true ||
           (typeof value === 'object' && value?.enabled !== false) ||
           (typeof value === 'string'); // For modular templates like "hero_1", "welcome_1"

    console.log(`🔍 Section "${sectionName}": value=${JSON.stringify(value)}, enabled=${isEnabled}`);
    return isEnabled;
  });

  console.log('🎯 detectActiveSections final result:', result);
  console.log('🎯 Gallery section included?', result.includes('gallery'));

  return result;
}

/**
 * Get ordered sections based on the order from the database (activeSections)
 * Only returns sections that have field mappings available
 */
export function getOrderedSections(activeSections: string[]): string[] {
  // Use the order from activeSections (which comes from DB) instead of hardcoded order
  return activeSections.filter(sectionName =>
    WEDDING_SECTION_FIELDS_MAP[sectionName] // Only include sections that have field definitions
  );
}

/**
 * Get fields grouped by ordered sections based on dynamic section order
 * Uses the order from activeSections (database order) instead of field appearance order
 */
export function getFieldsByOrderedSections(availableFields: CustomizerField[], activeSections: string[]): Record<string, CustomizerField[]> {
  // 🚨 DEBUG: Log input parameters
  console.log('🔍 getFieldsByOrderedSections called with:', {
    availableFields: availableFields.map(f => ({ key: f.key, section: f.section })),
    activeSections,
    totalFields: availableFields.length
  });

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

        // 🚨 DEBUG: Log field assignment (only for gallery_images)
        if (field.key === 'gallery_images') {
          console.log(`✅ gallery_images assigned to section "${firstActiveSection}"`);
        }
      } else if (field.key === 'gallery_images') {
        // 🚨 DEBUG: Log why gallery_images was NOT assigned
        console.log(`❌ gallery_images NOT assigned:`, {
          fieldSections: sections,
          firstActiveSection,
          alreadyProcessed: processedFields.has(field.key),
          activeSections
        });
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

  // 🚨 DEBUG: Log final result
  console.log('🎯 getFieldsByOrderedSections final result:', {
    sections: Object.keys(result),
    galleryFields: result.gallery?.length || 0,
    galleryHasGalleryImages: result.gallery?.some(f => f.key === 'gallery_images') || false,
    totalFieldsReturned: Object.values(result).flat().length
  });

  return result;
}

// WEDDING BASIC FIELDS CONFIGURATION - Fields shown in Basic mode for wedding templates
export const WEDDING_BASIC_FIELDS: string[] = [
  // Hero section - Essential information (using individual names)
  'groom_name',
  'bride_name',
  'weddingDate',
  'eventLocation',

  // Couple section - Basic names and roles
  'bride_name',      // Shared with hero - appears in both
  'bride_role',
  'groom_name',      // Shared with hero - appears in both
  'groom_role',

  // Countdown section - Uses shared weddingDate (already listed above)

  // Itinerary section - Essential timeline events (removed title from basic mode)
  'itinerary_event_ceremonia_enabled',
  'itinerary_event_ceremonia_time',
  'itinerary_event_recepcion_enabled',
  'itinerary_event_recepcion_time',
  'itinerary_event_entrada_enabled',
  'itinerary_event_entrada_time',
  'itinerary_event_comida_enabled',
  'itinerary_event_comida_time',
  'itinerary_event_fiesta_enabled',
  'itinerary_event_fiesta_time',

  // Story section - Basic moments (first 2 moments only)
  'story_moment_1_title',
  'story_moment_1_date',
  'story_moment_2_title',
  'story_moment_2_date',

  // Gallery section - Unified multi-image picker
  'gallery_images',

  // Familiares section - Essential family information
  'familiares_padre_novio',
  'familiares_madre_novio',
  'familiares_padre_novia',
  'familiares_madre_novia',
  'familiares_padrino',
  'familiares_madrina',

  // PlaceReligioso section - Essential religious ceremony location
  'place_religioso_lugar',
  'place_religioso_direccion',
  'place_religioso_mapa_url',

  // PlaceCeremonia section - Essential reception location
  'place_ceremonia_hora',
  'place_ceremonia_lugar',
  'place_ceremonia_direccion',
  'place_ceremonia_mapa_url',

  // Vestimenta section - Essential dress code information
  'vestimenta_etiqueta',
  'vestimenta_no_colores_info',

  // Footer section - Basic info (using individual names)
  'groom_name',        // Shared with hero/couple
  'bride_name',        // Shared with hero/couple
  // weddingDate already listed above (shared field)
  'eventLocation'      // Shared with hero
];

/**
 * Get fields specific to a section variant (e.g., hero_1, welcome_2)
 * This enables showing only relevant fields in the customizer for each variant
 */
export function getVariantSpecificFields(
  variantId: string,
  allFields: CustomizerField[]
): CustomizerField[] {
  const variantFields = SECTION_VARIANTS_FIELDS[variantId];

  if (!variantFields) {
    console.warn(`No variant fields configuration found for "${variantId}"`);
    return allFields;
  }

  // Filter fields to only include those relevant to this variant
  return allFields.filter(field => variantFields.includes(field.key));
}

/**
 * Get available fields for a section considering its active variant
 * This replaces the generic section-based filtering with variant-specific filtering
 */
export function getAvailableFieldsForVariant(
  activeSections: string[],
  sectionsConfig: Record<string, string>
): CustomizerField[] {
  console.log('🔍 getAvailableFieldsForVariant called with:', {
    activeSections,
    sectionsConfig
  });

  const fieldsSet = new Set<string>();

  // For each active section, get its variant and add variant-specific fields
  activeSections.forEach(sectionName => {
    const variantId = sectionsConfig[sectionName];

    if (variantId && SECTION_VARIANTS_FIELDS[variantId]) {
      const variantFields = SECTION_VARIANTS_FIELDS[variantId];
      console.log(`✅ Section "${sectionName}" using variant "${variantId}" with fields:`, variantFields);

      variantFields.forEach(fieldKey => fieldsSet.add(fieldKey));
    } else {
      // Fallback to generic section fields if no variant configuration
      const section = WEDDING_SECTION_FIELDS_MAP[sectionName];
      if (section) {
        console.log(`⚠️ Section "${sectionName}" using fallback generic fields:`, section.fields);
        section.fields.forEach(fieldKey => fieldsSet.add(fieldKey));
      }
    }
  });

  console.log('🔍 Collected field keys for variants:', Array.from(fieldsSet));

  // Convert to field definitions
  const result = Array.from(fieldsSet)
    .map(fieldKey => FIELD_DEFINITIONS[fieldKey])
    .filter(Boolean)
    .sort((a, b) => a.category.localeCompare(b.category));

  console.log('🎯 getAvailableFieldsForVariant final result:', {
    totalFields: result.length,
    fieldKeys: result.map(f => f.key)
  });

  return result;
}

/**
 * Wedding-specific utility: Filter fields by selected mode (Basic or Full)
 */
export function getWeddingFieldsByMode(
  allFields: CustomizerField[],
  mode: 'basic' | 'full'
): CustomizerField[] {
  if (mode === 'basic') {
    return allFields.filter(field => WEDDING_BASIC_FIELDS.includes(field.key));
  }
  return allFields; // FULL mode shows all fields
}