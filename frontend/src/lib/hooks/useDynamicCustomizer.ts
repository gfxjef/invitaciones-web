/**
 * Dynamic Customizer Hook
 *
 * WHY: Manages the state and logic for the dynamic customizer system.
 * Automatically detects available fields based on template sections
 * and provides real-time preview functionality.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CustomizerData,
  CustomizerField,
  CustomizerState,
  TouchedFields,
  FieldState,
  ProgressiveData
} from '@/components/customizer/types';
import { getAvailableFields, detectActiveSections, getFieldsByOrderedSections, SECTION_FIELDS_MAP } from '@/components/customizer/sectionFieldsMap';

interface UseDynamicCustomizerProps {
  initialData?: any;
  sectionsConfig?: any;
  templateData?: any;
}

export function useDynamicCustomizer({
  initialData = {},
  sectionsConfig = {},
  templateData = {}
}: UseDynamicCustomizerProps = {}) {

  // Main customizer state
  const [isOpen, setIsOpen] = useState(false);
  const [customizerData, setCustomizerData] = useState<CustomizerData>({});

  // Progressive override state
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [templateDefaults, setTemplateDefaults] = useState<CustomizerData>({});

  // Detect active sections from template configuration
  const activeSections = useMemo(() => {
    const detectedSections = detectActiveSections(sectionsConfig, templateData);

    // Fallback: if no sections detected, assume common sections for demo
    if (detectedSections.length === 0) {
      return ['hero', 'welcome', 'couple', 'countdown', 'story', 'video', 'gallery', 'footer'];
    }

    return detectedSections;
  }, [sectionsConfig, templateData]);

  // Get available fields based on active sections
  const availableFields = useMemo(() => {
    return getAvailableFields(activeSections);
  }, [activeSections]);

  // Initialize progressive override system
  useEffect(() => {
    const extractedDefaults: CustomizerData = {};
    const initialMergedData: CustomizerData = {};
    const initialTouchedFields: TouchedFields = {};

    // Extract template defaults from the transform function
    const templateProps = transformToTemplateProps(templateData);

    // Map template defaults for each available field
    availableFields.forEach(field => {
      let defaultValue = '';

      // Extract default values from the template transformation
      switch (field.key) {
        case 'coupleNames':
          defaultValue = templateProps.hero?.coupleNames || 'Jefferson & Rosmery';
          break;
        case 'eventDate':
          defaultValue = templateProps.hero?.eventDate || '15 December, 2024';
          break;
        case 'eventLocation':
          defaultValue = templateProps.hero?.eventLocation || 'New York';
          break;
        case 'heroImageUrl':
          defaultValue = templateProps.hero?.heroImageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/1-2.jpg';
          break;
        case 'bannerImageUrl':
          defaultValue = templateProps.welcome?.bannerImageUrl || 'https://i.imgur.com/svWa52m.png';
          break;
        case 'couplePhotoUrl':
          defaultValue = templateProps.welcome?.couplePhotoUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/couple.png';
          break;
        case 'bride_name':
          defaultValue = templateProps.couple?.brideData?.name || 'Rosmery Guiterrez';
          break;
        case 'groom_name':
          defaultValue = templateProps.couple?.groomData?.name || 'Jefferson Camacho';
          break;
        case 'bride_role':
          defaultValue = templateProps.couple?.brideData?.role || 'La Novia';
          break;
        case 'bride_description':
          defaultValue = templateProps.couple?.brideData?.description || 'Rosmery, eres mi amor eterno, mi compañera de vida y el sueño que quiero vivir cada día a tu lado.';
          break;
        case 'bride_imageUrl':
          defaultValue = templateProps.couple?.brideData?.imageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/bride.png';
          break;
        case 'groom_role':
          defaultValue = templateProps.couple?.groomData?.role || 'El Novio';
          break;
        case 'groom_description':
          defaultValue = templateProps.couple?.groomData?.description || 'Jefferson, eres mi fuerza, mi refugio y mi amor infinito, con quien deseo caminar siempre de la mano en esta vida.';
          break;
        case 'groom_imageUrl':
          defaultValue = templateProps.couple?.groomData?.imageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/groom.png';
          break;
        case 'welcomeText':
          defaultValue = templateProps.welcome?.welcomeText || 'Hola & Bienvenidos';
          break;
        case 'title':
          defaultValue = templateProps.welcome?.title || 'Nos Vamos a Casar!!!!';
          break;
        case 'description':
          defaultValue = templateProps.welcome?.description || 'Hoy y siempre, más allá del mañana, necesito que estés a mi lado como mi mejor amigo, amante y alma gemela; te prometo ternura, compañía y apoyo incondicional para construir juntos un hogar de confianza y cariño, celebrar el amor que nos une y cuidarnos mutuamente toda la vida.';
          break;
        case 'weddingDate':
          defaultValue = templateProps.countdown?.weddingDate || '2025-12-15T17:00:00';
          break;
        case 'backgroundImageUrl':
          defaultValue = templateProps.countdown?.backgroundImageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1.jpg';
          break;
        case 'preTitle':
          defaultValue = templateProps.countdown?.preTitle || 'DENTRO DE POCO SEREMOS UNA FAMILIA';
          break;
        case 'sectionTitle':
          defaultValue = templateProps.couple?.sectionTitle || 'Futuros Felices Esposos';
          break;
        case 'sectionSubtitle':
          defaultValue = templateProps.couple?.sectionSubtitle || 'MARIDO & MUJER';
          break;
        case 'copyrightText':
          defaultValue = templateProps.footer?.copyrightText || 'Hecho con Amor. All right reserved Amiras Gift.';
          break;

        // Story moment fields with defaults from Story1 component
        case 'story_moment_1_date':
          defaultValue = '20 DE JULIO, 2010';
          break;
        case 'story_moment_1_title':
          defaultValue = 'Así Nos Conocimos';
          break;
        case 'story_moment_1_description':
          defaultValue = 'La primera vez que nos vimos, un instante que marcó el inicio de nuestra historia. Un encuentro lleno de emoción y destino, donde sin saberlo comenzaba el amor que cambiaría nuestras vidas.';
          break;
        case 'story_moment_1_imageUrl':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4.jpg';
          break;
        case 'story_moment_2_date':
          defaultValue = '1 DE AGOSTO, 2016';
          break;
        case 'story_moment_2_title':
          defaultValue = 'Nuestra Primera Cita';
          break;
        case 'story_moment_2_description':
          defaultValue = 'Una noche maravillosa bajo las estrellas que marcó el inicio de nuestro camino juntos. La conversación fluyó tan fácil como el vino, y ambos supimos que aquello era algo especial y único.';
          break;
        case 'story_moment_2_imageUrl':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/2.jpg';
          break;
        case 'story_moment_3_date':
          defaultValue = '25 DE JUNIO, 2022';
          break;
        case 'story_moment_3_title':
          defaultValue = 'Nos Comprometimos';
          break;
        case 'story_moment_3_description':
          defaultValue = 'El día que decidimos pasar el resto de nuestras vidas juntos. Una propuesta llena de amor y nervios, con la certeza de que este era el momento perfecto para comenzar nuestra nueva aventura.';
          break;
        case 'story_moment_3_imageUrl':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/5-1.jpg';
          break;

        // Gallery image fields with defaults from Gallery1 component
        case 'gallery_image_1_url':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3-1.jpg';
          break;
        case 'gallery_image_1_alt':
          defaultValue = 'Romantic couple moment';
          break;
        case 'gallery_image_1_category':
          defaultValue = 'ceremony';
          break;
        case 'gallery_image_2_url':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3.jpg';
          break;
        case 'gallery_image_2_alt':
          defaultValue = 'Beautiful wedding ceremony';
          break;
        case 'gallery_image_2_category':
          defaultValue = 'ceremony';
          break;
        case 'gallery_image_3_url':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4-2.jpg';
          break;
        case 'gallery_image_3_alt':
          defaultValue = 'Celebration moments';
          break;
        case 'gallery_image_3_category':
          defaultValue = 'party';
          break;
        case 'gallery_image_4_url':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/5.jpg';
          break;
        case 'gallery_image_4_alt':
          defaultValue = 'Wedding rings';
          break;
        case 'gallery_image_4_category':
          defaultValue = 'ceremony';
          break;
        case 'gallery_image_5_url':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/6.jpg';
          break;
        case 'gallery_image_5_alt':
          defaultValue = 'Happy couple dancing';
          break;
        case 'gallery_image_5_category':
          defaultValue = 'party';
          break;
        case 'gallery_image_6_url':
          defaultValue = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1.jpg';
          break;
        case 'gallery_image_6_alt':
          defaultValue = 'Wedding bouquet';
          break;
        case 'gallery_image_6_category':
          defaultValue = 'ceremony';
          break;
        case 'gallery_image_7_url':
          defaultValue = '';
          break;
        case 'gallery_image_7_alt':
          defaultValue = '';
          break;
        case 'gallery_image_7_category':
          defaultValue = 'ceremony';
          break;
        case 'gallery_image_8_url':
          defaultValue = '';
          break;
        case 'gallery_image_8_alt':
          defaultValue = '';
          break;
        case 'gallery_image_8_category':
          defaultValue = 'ceremony';
          break;
        case 'gallery_image_9_url':
          defaultValue = '';
          break;
        case 'gallery_image_9_alt':
          defaultValue = '';
          break;
        case 'gallery_image_9_category':
          defaultValue = 'ceremony';
          break;
        case 'gallery_image_10_url':
          defaultValue = '';
          break;
        case 'gallery_image_10_alt':
          defaultValue = '';
          break;
        case 'gallery_image_10_category':
          defaultValue = 'ceremony';
          break;

        default:
          // Try to extract from template data or use field placeholder
          defaultValue = templateData[field.key] || field.placeholder || '';
      }

      extractedDefaults[field.key] = defaultValue;

      // Check if user has provided initial data for this field
      if (initialData[field.key] !== undefined && initialData[field.key] !== defaultValue) {
        initialMergedData[field.key] = initialData[field.key];
        initialTouchedFields[field.key] = true;
      } else {
        // Use template default for untouched fields
        initialMergedData[field.key] = defaultValue;
      }
    });

    setTemplateDefaults(extractedDefaults);
    setCustomizerData(initialMergedData);
    setTouchedFields(initialTouchedFields);
  }, [JSON.stringify(availableFields.map(f => f.key)), JSON.stringify(templateData), JSON.stringify(initialData)]);

  // Update a specific field with touch tracking
  const updateField = useCallback((fieldKey: string, value: string) => {
    setCustomizerData(prev => ({
      ...prev,
      [fieldKey]: value
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [fieldKey]: true
    }));
  }, []);

  // Bulk update multiple fields
  const updateFields = useCallback((updates: Partial<CustomizerData>) => {
    setCustomizerData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Reset all fields to template defaults
  const resetFields = useCallback(() => {
    setCustomizerData({ ...templateDefaults });
    setTouchedFields({});
  }, [templateDefaults]);

  // Reset a specific field to its template default
  const resetField = useCallback((fieldKey: string) => {
    setCustomizerData(prev => ({
      ...prev,
      [fieldKey]: templateDefaults[fieldKey] || ''
    }));

    setTouchedFields(prev => {
      const newTouched = { ...prev };
      delete newTouched[fieldKey];
      return newTouched;
    });
  }, [templateDefaults]);

  // Transform flat customizer data to template component props structure
  const transformToTemplateProps = useCallback((data: any) => {
    return {
      hero: {
        coupleNames: data.coupleNames || `${data.couple_bride_name || 'Bride'} & ${data.couple_groom_name || 'Groom'}`,
        eventDate: data.eventDate || (data.event_date ? new Date(data.event_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : '15 December, 2024'),
        eventLocation: data.eventLocation || data.event_venue_city || 'New York',
        heroImageUrl: data.heroImageUrl || data.gallery_hero_image || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/1-2.jpg',
      },
      welcome: {
        bannerImageUrl: data.bannerImageUrl || 'https://i.imgur.com/svWa52m.png',
        couplePhotoUrl: data.couplePhotoUrl || data.gallery_couple_image || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/couple.png',
        welcomeText: data.welcomeText || 'Hola & Bienvenidos',
        title: data.title || 'Nos Vamos a Casar!!!!',
        description: data.description || data.message_welcome_text || data.couple_story || 'Hoy y siempre, más allá del mañana, necesito que estés a mi lado como mi mejor amigo, amante y alma gemela; te prometo ternura, compañía y apoyo incondicional para construir juntos un hogar de confianza y cariño, celebrar el amor que nos une y cuidarnos mutuamente toda la vida.',
      },
      couple: {
        sectionTitle: data.sectionTitle || 'Futuros Felices Esposos',
        sectionSubtitle: data.sectionSubtitle || 'MARIDO & MUJER',
        brideData: {
          imageUrl: data.bride_imageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/bride.png',
          name: data.bride_name || data.couple_bride_name || 'Rosmery Guiterrez',
          role: data.bride_role || 'La Novia',
          description: data.bride_description || 'Rosmery, eres mi amor eterno, mi compañera de vida y el sueño que quiero vivir cada día a tu lado.',
          socialLinks: { facebook: '#', twitter: '#', instagram: '#' }
        },
        groomData: {
          imageUrl: data.groom_imageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/groom.png',
          name: data.groom_name || data.couple_groom_name || 'Jefferson Camacho',
          role: data.groom_role || 'El Novio',
          description: data.groom_description || 'Jefferson, eres mi fuerza, mi refugio y mi amor infinito, con quien deseo caminar siempre de la mano en esta vida.',
          socialLinks: { facebook: '#', twitter: '#', instagram: '#' }
        }
      },
      countdown: {
        weddingDate: data.weddingDate || data.event_date || '2025-12-15T17:00:00',
        backgroundImageUrl: data.backgroundImageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1.jpg',
        preTitle: data.preTitle || 'DENTRO DE POCO SEREMOS UNA FAMILIA',
        title: data.title || "Nos Casaremos en ..."
      },
      story: {
        sectionSubtitle: data.sectionSubtitle || 'JEFFERSON & ROSMERY',
        sectionTitle: data.sectionTitle || 'Nuestra Historia ♥',
        storyMoments: [
          // Moment 1 - only include if has data
          ...(data.story_moment_1_date || data.story_moment_1_title ? [{
            date: data.story_moment_1_date || '20 DE JULIO, 2010',
            title: data.story_moment_1_title || 'Así Nos Conocimos',
            description: data.story_moment_1_description || 'La primera vez que nos vimos, un instante que marcó el inicio de nuestra historia. Un encuentro lleno de emoción y destino, donde sin saberlo comenzaba el amor que cambiaría nuestras vidas.',
            imageUrl: data.story_moment_1_imageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4.jpg'
          }] : []),
          // Moment 2 - only include if has data
          ...(data.story_moment_2_date || data.story_moment_2_title ? [{
            date: data.story_moment_2_date || '1 DE AGOSTO, 2016',
            title: data.story_moment_2_title || 'Nuestra Primera Cita',
            description: data.story_moment_2_description || 'Una noche maravillosa bajo las estrellas que marcó el inicio de nuestro camino juntos. La conversación fluyó tan fácil como el vino, y ambos supimos que aquello era algo especial y único.',
            imageUrl: data.story_moment_2_imageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/2.jpg'
          }] : []),
          // Moment 3 - only include if has data
          ...(data.story_moment_3_date || data.story_moment_3_title ? [{
            date: data.story_moment_3_date || '25 DE JUNIO, 2022',
            title: data.story_moment_3_title || 'Nos Comprometimos',
            description: data.story_moment_3_description || 'El día que decidimos pasar el resto de nuestras vidas juntos. Una propuesta llena de amor y nervios, con la certeza de que este era el momento perfecto para comenzar nuestra nueva aventura.',
            imageUrl: data.story_moment_3_imageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/5-1.jpg'
          }] : [])
        ]
      },
      video: {
        backgroundImageUrl: data.backgroundImageUrl || 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/3-1.jpg',
        videoEmbedUrl: data.videoEmbedUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        preTitle: data.preTitle || 'INCIO NUESTRA HISTORIA',
        title: data.title || 'Mira nuestra Historia de Amor'
      },
      gallery: {
        sectionSubtitle: data.sectionSubtitle || 'Memorias',
        sectionTitle: data.sectionTitle || 'Galería de Novios',
        galleryImages: [
          // Image 1 - only include if has URL
          ...(data.gallery_image_1_url ? [{
            id: 1,
            url: data.gallery_image_1_url,
            alt: data.gallery_image_1_alt || 'Romantic couple moment',
            category: data.gallery_image_1_category || 'ceremony'
          }] : []),
          // Image 2 - only include if has URL
          ...(data.gallery_image_2_url ? [{
            id: 2,
            url: data.gallery_image_2_url,
            alt: data.gallery_image_2_alt || 'Beautiful wedding ceremony',
            category: data.gallery_image_2_category || 'ceremony'
          }] : []),
          // Image 3 - only include if has URL
          ...(data.gallery_image_3_url ? [{
            id: 3,
            url: data.gallery_image_3_url,
            alt: data.gallery_image_3_alt || 'Celebration moments',
            category: data.gallery_image_3_category || 'party'
          }] : []),
          // Image 4 - only include if has URL
          ...(data.gallery_image_4_url ? [{
            id: 4,
            url: data.gallery_image_4_url,
            alt: data.gallery_image_4_alt || 'Wedding rings',
            category: data.gallery_image_4_category || 'ceremony'
          }] : []),
          // Image 5 - only include if has URL
          ...(data.gallery_image_5_url ? [{
            id: 5,
            url: data.gallery_image_5_url,
            alt: data.gallery_image_5_alt || 'Happy couple dancing',
            category: data.gallery_image_5_category || 'party'
          }] : []),
          // Image 6 - only include if has URL
          ...(data.gallery_image_6_url ? [{
            id: 6,
            url: data.gallery_image_6_url,
            alt: data.gallery_image_6_alt || 'Wedding bouquet',
            category: data.gallery_image_6_category || 'ceremony'
          }] : []),
          // Image 7 - only include if has URL
          ...(data.gallery_image_7_url ? [{
            id: 7,
            url: data.gallery_image_7_url,
            alt: data.gallery_image_7_alt || 'Wedding moment',
            category: data.gallery_image_7_category || 'ceremony'
          }] : []),
          // Image 8 - only include if has URL
          ...(data.gallery_image_8_url ? [{
            id: 8,
            url: data.gallery_image_8_url,
            alt: data.gallery_image_8_alt || 'Wedding moment',
            category: data.gallery_image_8_category || 'ceremony'
          }] : []),
          // Image 9 - only include if has URL
          ...(data.gallery_image_9_url ? [{
            id: 9,
            url: data.gallery_image_9_url,
            alt: data.gallery_image_9_alt || 'Wedding moment',
            category: data.gallery_image_9_category || 'ceremony'
          }] : []),
          // Image 10 - only include if has URL
          ...(data.gallery_image_10_url ? [{
            id: 10,
            url: data.gallery_image_10_url,
            alt: data.gallery_image_10_alt || 'Wedding moment',
            category: data.gallery_image_10_category || 'ceremony'
          }] : [])
        ]
      },
      footer: {
        coupleNames: data.coupleNames || `${data.couple_bride_name || 'Jefferson'} & ${data.couple_groom_name || 'Rosmery'}`,
        eventDate: data.eventDate || '24 DECEMBER 2026',
        eventLocation: data.eventLocation || 'Lima, Peru',
        copyrightText: data.copyrightText || 'Hecho con Amor. All right reserved Amiras Gift.'
      }
    };
  }, []);

  // Get progressive merged data - only touched fields override template defaults
  const getProgressiveMergedData = useCallback(() => {
    const progressiveData: CustomizerData = {};

    availableFields.forEach(field => {
      const fieldKey = field.key;

      if (touchedFields[fieldKey]) {
        // Use user's modified value for touched fields
        progressiveData[fieldKey] = customizerData[fieldKey];
      } else {
        // Use template default for untouched fields
        progressiveData[fieldKey] = templateDefaults[fieldKey];
      }
    });

    // Merge with original template data and apply transformations
    const mergedData = {
      ...templateData,
      ...progressiveData
    };

    return transformToTemplateProps(mergedData);
  }, [availableFields, touchedFields, customizerData, templateDefaults, templateData, transformToTemplateProps]);

  // Legacy method for backward compatibility
  const getMergedData = getProgressiveMergedData;

  // Toggle customizer panel
  const toggleCustomizer = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close customizer
  const closeCustomizer = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Open customizer
  const openCustomizer = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Check if any fields have been touched/modified
  const hasChanges = useMemo(() => {
    return Object.keys(touchedFields).length > 0;
  }, [touchedFields]);

  // Get touched fields count
  const touchedFieldsCount = useMemo(() => {
    return Object.keys(touchedFields).length;
  }, [touchedFields]);

  // Get fields grouped by ordered sections instead of categories
  const fieldsBySection = useMemo(() => {
    const result = getFieldsByOrderedSections(availableFields, activeSections);
    return result;
  }, [availableFields, activeSections]);

  // Legacy support: alias for backward compatibility
  const fieldsByCategory = fieldsBySection;

  // Get current value for a field
  const getFieldValue = useCallback((fieldKey: string): string => {
    return customizerData[fieldKey] || '';
  }, [customizerData]);

  // Get section configuration for a section name
  const getSectionConfig = useCallback((sectionName: string) => {
    return SECTION_FIELDS_MAP[sectionName];
  }, []);

  // Get field state for progressive override UI
  const getFieldState = useCallback((fieldKey: string): FieldState => {
    const currentValue = customizerData[fieldKey] || '';
    const defaultValue = templateDefaults[fieldKey] || '';
    const isTouched = touchedFields[fieldKey] || false;
    const isModified = currentValue !== defaultValue;

    return {
      value: currentValue,
      isTouched,
      isModified,
      defaultValue,
      canReset: isTouched
    };
  }, [customizerData, templateDefaults, touchedFields]);

  // Get all field states
  const fieldStates = useMemo(() => {
    const states: Record<string, FieldState> = {};

    availableFields.forEach(field => {
      states[field.key] = getFieldState(field.key);
    });

    return states;
  }, [availableFields, getFieldState]);

  // Get progressive data structure
  const progressiveData = useMemo((): ProgressiveData => {
    const userData: CustomizerData = {};

    // Extract only touched fields as user data
    Object.keys(touchedFields).forEach(fieldKey => {
      userData[fieldKey] = customizerData[fieldKey];
    });

    return {
      userData,
      templateDefaults,
      touchedFields
    };
  }, [touchedFields, customizerData, templateDefaults]);

  // Check if customizer has any fields to show
  const hasFields = availableFields.length > 0;

  return {
    // State
    isOpen,
    customizerData,
    availableFields,
    activeSections,
    fieldsByCategory, // Legacy: now grouped by sections
    fieldsBySection,  // New: explicitly grouped by sections
    hasChanges,
    hasFields,

    // Progressive override state
    touchedFields,
    templateDefaults,
    progressiveData,
    fieldStates,
    touchedFieldsCount,

    // Actions
    updateField,
    updateFields,
    resetFields,
    resetField,
    toggleCustomizer,
    openCustomizer,
    closeCustomizer,

    // Data access
    getMergedData,
    getProgressiveMergedData,
    getFieldValue,
    getFieldState,
    getSectionConfig,

    // Computed
    sectionsCount: activeSections.length,
    fieldsCount: availableFields.length
  };
}