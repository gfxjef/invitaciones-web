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

// Import default props from section components (single source of truth)
import { Hero1DefaultProps } from '@/components/templates/sections/hero/Hero1';
import { Welcome1DefaultProps } from '@/components/templates/sections/welcome/Welcome1';
import { Couple1DefaultProps } from '@/components/templates/sections/couple/Couple1';
import { Countdown1DefaultProps } from '@/components/templates/sections/countdown/Countdown1';
import { Gallery1DefaultProps } from '@/components/templates/sections/gallery/Gallery1';
import { Story1DefaultProps } from '@/components/templates/sections/story/Story1';
import { Video1DefaultProps } from '@/components/templates/sections/video/Video1';
import { Footer1DefaultProps } from '@/components/templates/sections/footer/Footer1';

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

      // Extract default values from template props or use component defaults (single source of truth)
      switch (field.key) {
        // Hero Section Defaults
        case 'coupleNames':
          defaultValue = templateProps.hero?.coupleNames || Hero1DefaultProps.coupleNames;
          break;
        case 'eventDate':
          defaultValue = templateProps.hero?.eventDate || Hero1DefaultProps.eventDate;
          break;
        case 'eventLocation':
          defaultValue = templateProps.hero?.eventLocation || Hero1DefaultProps.eventLocation;
          break;
        case 'heroImageUrl':
          defaultValue = templateProps.hero?.heroImageUrl || Hero1DefaultProps.heroImageUrl;
          break;

        // Welcome Section Defaults
        case 'bannerImageUrl':
          defaultValue = templateProps.welcome?.bannerImageUrl || Welcome1DefaultProps.bannerImageUrl;
          break;
        case 'couplePhotoUrl':
          defaultValue = templateProps.welcome?.couplePhotoUrl || Welcome1DefaultProps.couplePhotoUrl;
          break;
        case 'welcomeText':
          defaultValue = templateProps.welcome?.welcomeText || Welcome1DefaultProps.welcomeText;
          break;
        case 'title':
          defaultValue = templateProps.welcome?.title || Welcome1DefaultProps.title;
          break;
        case 'description':
          defaultValue = templateProps.welcome?.description || Welcome1DefaultProps.description;
          break;

        // Couple Section Defaults
        case 'bride_name':
          defaultValue = templateProps.couple?.brideData?.name || Couple1DefaultProps.brideData.name;
          break;
        case 'groom_name':
          defaultValue = templateProps.couple?.groomData?.name || Couple1DefaultProps.groomData.name;
          break;
        case 'bride_role':
          defaultValue = templateProps.couple?.brideData?.role || Couple1DefaultProps.brideData.role;
          break;
        case 'bride_description':
          defaultValue = templateProps.couple?.brideData?.description || Couple1DefaultProps.brideData.description;
          break;
        case 'bride_imageUrl':
          defaultValue = templateProps.couple?.brideData?.imageUrl || Couple1DefaultProps.brideData.imageUrl;
          break;
        case 'groom_role':
          defaultValue = templateProps.couple?.groomData?.role || Couple1DefaultProps.groomData.role;
          break;
        case 'groom_description':
          defaultValue = templateProps.couple?.groomData?.description || Couple1DefaultProps.groomData.description;
          break;
        case 'groom_imageUrl':
          defaultValue = templateProps.couple?.groomData?.imageUrl || Couple1DefaultProps.groomData.imageUrl;
          break;
        // Countdown Section Defaults
        case 'weddingDate':
          defaultValue = templateProps.countdown?.weddingDate || Countdown1DefaultProps.weddingDate;
          break;
        case 'backgroundImageUrl':
          defaultValue = templateProps.countdown?.backgroundImageUrl || Countdown1DefaultProps.backgroundImageUrl;
          break;
        case 'preTitle':
          defaultValue = templateProps.countdown?.preTitle || Countdown1DefaultProps.preTitle;
          break;

        // Additional Couple Section Fields
        case 'sectionTitle':
          defaultValue = templateProps.couple?.sectionTitle || Couple1DefaultProps.sectionTitle;
          break;
        case 'sectionSubtitle':
          defaultValue = templateProps.couple?.sectionSubtitle || Couple1DefaultProps.sectionSubtitle;
          break;

        // Footer Section Defaults
        case 'copyrightText':
          defaultValue = templateProps.footer?.copyrightText || Footer1DefaultProps.copyrightText;
          break;

        // Story moment fields with defaults from Story1 component
        case 'story_moment_1_date':
          defaultValue = templateProps.story?.storyMoments?.[0]?.date || Story1DefaultProps.storyMoments[0].date;
          break;
        case 'story_moment_1_title':
          defaultValue = templateProps.story?.storyMoments?.[0]?.title || Story1DefaultProps.storyMoments[0].title;
          break;
        case 'story_moment_1_description':
          defaultValue = templateProps.story?.storyMoments?.[0]?.description || Story1DefaultProps.storyMoments[0].description;
          break;
        case 'story_moment_1_imageUrl':
          defaultValue = templateProps.story?.storyMoments?.[0]?.imageUrl || Story1DefaultProps.storyMoments[0].imageUrl;
          break;
        case 'story_moment_2_date':
          defaultValue = templateProps.story?.storyMoments?.[1]?.date || Story1DefaultProps.storyMoments[1].date;
          break;
        case 'story_moment_2_title':
          defaultValue = templateProps.story?.storyMoments?.[1]?.title || Story1DefaultProps.storyMoments[1].title;
          break;
        case 'story_moment_2_description':
          defaultValue = templateProps.story?.storyMoments?.[1]?.description || Story1DefaultProps.storyMoments[1].description;
          break;
        case 'story_moment_2_imageUrl':
          defaultValue = templateProps.story?.storyMoments?.[1]?.imageUrl || Story1DefaultProps.storyMoments[1].imageUrl;
          break;
        case 'story_moment_3_date':
          defaultValue = templateProps.story?.storyMoments?.[2]?.date || Story1DefaultProps.storyMoments[2].date;
          break;
        case 'story_moment_3_title':
          defaultValue = templateProps.story?.storyMoments?.[2]?.title || Story1DefaultProps.storyMoments[2].title;
          break;
        case 'story_moment_3_description':
          defaultValue = templateProps.story?.storyMoments?.[2]?.description || Story1DefaultProps.storyMoments[2].description;
          break;
        case 'story_moment_3_imageUrl':
          defaultValue = templateProps.story?.storyMoments?.[2]?.imageUrl || Story1DefaultProps.storyMoments[2].imageUrl;
          break;

        // Gallery image fields with defaults from Gallery1 component
        case 'gallery_image_1_url':
          defaultValue = templateProps.gallery?.galleryImages?.[0]?.url || Gallery1DefaultProps.galleryImages[0].src;
          break;
        case 'gallery_image_1_alt':
          defaultValue = templateProps.gallery?.galleryImages?.[0]?.alt || Gallery1DefaultProps.galleryImages[0].alt;
          break;
        case 'gallery_image_1_category':
          defaultValue = templateProps.gallery?.galleryImages?.[0]?.category || Gallery1DefaultProps.galleryImages[0].category;
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

        // Video Section Defaults
        case 'videoEmbedUrl':
          defaultValue = templateProps.video?.videoEmbedUrl || Video1DefaultProps.videoEmbedUrl;
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
        // Leave fields empty - values will show only as placeholders
        initialMergedData[field.key] = '';
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
        coupleNames: data.coupleNames || Hero1DefaultProps.coupleNames,
        eventDate: data.eventDate || (data.event_date ? new Date(data.event_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : Hero1DefaultProps.eventDate),
        eventLocation: data.eventLocation || data.event_venue_city || Hero1DefaultProps.eventLocation,
        heroImageUrl: data.heroImageUrl || data.gallery_hero_image || Hero1DefaultProps.heroImageUrl,
      },
      welcome: {
        bannerImageUrl: data.welcome_bannerImageUrl || Welcome1DefaultProps.bannerImageUrl,
        couplePhotoUrl: data.welcome_couplePhotoUrl || data.gallery_couple_image || Welcome1DefaultProps.couplePhotoUrl,
        welcomeText: data.welcome_welcomeText || Welcome1DefaultProps.welcomeText,
        title: data.welcome_title || Welcome1DefaultProps.title,
        description: data.welcome_description || data.message_welcome_text || data.couple_story || Welcome1DefaultProps.description,
      },
      couple: {
        sectionTitle: data.couple_sectionTitle || Couple1DefaultProps.sectionTitle,
        sectionSubtitle: data.couple_sectionSubtitle || Couple1DefaultProps.sectionSubtitle,
        brideData: {
          imageUrl: data.bride_imageUrl || Couple1DefaultProps.brideData.imageUrl,
          name: data.bride_name || data.couple_bride_name || Couple1DefaultProps.brideData.name,
          role: data.bride_role || Couple1DefaultProps.brideData.role,
          description: data.bride_description || Couple1DefaultProps.brideData.description,
          socialLinks: { facebook: '#', twitter: '#', instagram: '#' }
        },
        groomData: {
          imageUrl: data.groom_imageUrl || Couple1DefaultProps.groomData.imageUrl,
          name: data.groom_name || data.couple_groom_name || Couple1DefaultProps.groomData.name,
          role: data.groom_role || Couple1DefaultProps.groomData.role,
          description: data.groom_description || Couple1DefaultProps.groomData.description,
          socialLinks: { facebook: '#', twitter: '#', instagram: '#' }
        }
      },
      countdown: {
        weddingDate: data.countdown_weddingDate || data.event_date || Countdown1DefaultProps.weddingDate,
        backgroundImageUrl: data.countdown_backgroundImageUrl || Countdown1DefaultProps.backgroundImageUrl,
        preTitle: data.countdown_preTitle || Countdown1DefaultProps.preTitle,
        title: data.countdown_title || Countdown1DefaultProps.title
      },
      story: {
        sectionSubtitle: Story1DefaultProps.sectionSubtitle,
        sectionTitle: Story1DefaultProps.sectionTitle,
        storyMoments: [
          // Moment 1 - only include if has data
          ...(data.story_moment_1_date || data.story_moment_1_title ? [{
            date: data.story_moment_1_date || Story1DefaultProps.storyMoments[0].date,
            title: data.story_moment_1_title || Story1DefaultProps.storyMoments[0].title,
            description: data.story_moment_1_description || Story1DefaultProps.storyMoments[0].description,
            imageUrl: data.story_moment_1_imageUrl || Story1DefaultProps.storyMoments[0].imageUrl
          }] : []),
          // Moment 2 - only include if has data
          ...(data.story_moment_2_date || data.story_moment_2_title ? [{
            date: data.story_moment_2_date || Story1DefaultProps.storyMoments[1].date,
            title: data.story_moment_2_title || Story1DefaultProps.storyMoments[1].title,
            description: data.story_moment_2_description || Story1DefaultProps.storyMoments[1].description,
            imageUrl: data.story_moment_2_imageUrl || Story1DefaultProps.storyMoments[1].imageUrl
          }] : []),
          // Moment 3 - only include if has data
          ...(data.story_moment_3_date || data.story_moment_3_title ? [{
            date: data.story_moment_3_date || Story1DefaultProps.storyMoments[2].date,
            title: data.story_moment_3_title || Story1DefaultProps.storyMoments[2].title,
            description: data.story_moment_3_description || Story1DefaultProps.storyMoments[2].description,
            imageUrl: data.story_moment_3_imageUrl || Story1DefaultProps.storyMoments[2].imageUrl
          }] : [])
        ]
      },
      video: {
        backgroundImageUrl: data.video_backgroundImageUrl || Video1DefaultProps.backgroundImageUrl,
        videoEmbedUrl: data.video_videoEmbedUrl || Video1DefaultProps.videoEmbedUrl,
        preTitle: data.video_preTitle || Video1DefaultProps.preTitle,
        title: data.video_title || Video1DefaultProps.title
      },
      gallery: {
        sectionSubtitle: Gallery1DefaultProps.sectionSubtitle,
        sectionTitle: Gallery1DefaultProps.sectionTitle,
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
        coupleNames: data.footer_coupleNames || `${data.couple_bride_name || 'Jefferson'} & ${data.couple_groom_name || 'Rosmery'}`,
        eventDate: data.footer_eventDate || (data.event_date ? new Date(data.event_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : Footer1DefaultProps.eventDate),
        eventLocation: data.footer_eventLocation || data.event_venue_city || Footer1DefaultProps.eventLocation,
        copyrightText: data.footer_copyrightText || Footer1DefaultProps.copyrightText
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