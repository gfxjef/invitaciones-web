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
  ProgressiveData,
  CustomizerMode,
  GalleryImage
} from '@/components/customizer/types';
import { detectActiveSections, getFieldsByOrderedSections } from '@/components/customizer/sectionFieldsMap';
// TODO: This file should be refactored to use category-specific configurations
// Currently using wedding-specific imports as fallback for legacy compatibility
import { getAvailableFields, WEDDING_SECTION_FIELDS_MAP as SECTION_FIELDS_MAP, FIELD_DEFINITIONS, getWeddingFieldsByMode, WEDDING_BASIC_FIELDS } from '@/components/templates/categories/weddings/customizer/sectionFieldsMap';

// Import default props from wedding section components (single source of truth)
import { Hero1DefaultProps } from '@/components/templates/categories/weddings/sections/hero/Hero1';
import { Welcome1DefaultProps } from '@/components/templates/categories/weddings/sections/welcome/Welcome1';
import { Couple1DefaultProps } from '@/components/templates/categories/weddings/sections/couple/Couple1';
import { Countdown1DefaultProps } from '@/components/templates/categories/weddings/sections/countdown/Countdown1';
import { Gallery1DefaultProps } from '@/components/templates/categories/weddings/sections/gallery/Gallery1';
import { Gallery2DefaultProps } from '@/components/templates/categories/weddings/sections/gallery/Gallery2';
import { Story1DefaultProps } from '@/components/templates/categories/weddings/sections/story/Story1';
import { Video1DefaultProps } from '@/components/templates/categories/weddings/sections/video/Video1';
import { Itinerary1DefaultProps } from '@/components/templates/categories/weddings/sections/itinerary/Itinerary1';
import { Footer1DefaultProps } from '@/components/templates/categories/weddings/sections/footer/Footer1';

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

  // Helper function to get the specific section variant being used
  const getSectionVariant = useCallback((sectionType: string): string => {
    if (!sectionsConfig) return `${sectionType}_1`; // Default to variant 1

    // Check if sectionsConfig has the specific variant (e.g., "gallery_2")
    const configKeys = Object.keys(sectionsConfig);
    const sectionVariant = configKeys.find(key => key.startsWith(`${sectionType}_`));

    return sectionVariant || `${sectionType}_1`; // Default to variant 1
  }, [sectionsConfig]);

  // Helper function to get default props for a section variant
  const getSectionDefaultProps = useCallback((sectionType: string) => {
    const variant = getSectionVariant(sectionType);

    switch (variant) {
      case 'hero_1': return Hero1DefaultProps;
      case 'welcome_1': return Welcome1DefaultProps;
      case 'couple_1': return Couple1DefaultProps;
      case 'countdown_1': return Countdown1DefaultProps;
      case 'gallery_1': return Gallery1DefaultProps;
      case 'gallery_2': return Gallery2DefaultProps;
      case 'story_1': return Story1DefaultProps;
      case 'video_1': return Video1DefaultProps;
      case 'itinerary_1': return Itinerary1DefaultProps;
      case 'footer_1': return Footer1DefaultProps;
      default:
        // Fallback to variant 1 defaults
        switch (sectionType) {
          case 'hero': return Hero1DefaultProps;
          case 'welcome': return Welcome1DefaultProps;
          case 'couple': return Couple1DefaultProps;
          case 'countdown': return Countdown1DefaultProps;
          case 'gallery': return Gallery1DefaultProps; // Always fallback to Gallery1
          case 'story': return Story1DefaultProps;
          case 'video': return Video1DefaultProps;
          case 'itinerary': return Itinerary1DefaultProps;
          case 'footer': return Footer1DefaultProps;
          default: return Gallery1DefaultProps; // Safe fallback for gallery type checking
        }
    }
  }, [getSectionVariant]);

  // Main customizer state
  const [isOpen, setIsOpen] = useState(false);
  const [customizerData, setCustomizerData] = useState<CustomizerData>({});

  // Mode selection state
  const [selectedMode, setSelectedMode] = useState<CustomizerMode>('basic');

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
        case 'groom_name':
          defaultValue = templateProps.couple?.groom_name || Hero1DefaultProps.groom_name || 'Jefferson';
          break;
        case 'bride_name':
          defaultValue = templateProps.couple?.bride_name || Hero1DefaultProps.bride_name || 'Rosmery';
          break;
        case 'weddingDate':
          defaultValue = templateProps.hero?.weddingDate || templateProps.footer?.weddingDate || templateProps.countdown?.weddingDate || Hero1DefaultProps.weddingDate;
          break;
        case 'eventLocation':
          defaultValue = templateProps.hero?.eventLocation || templateProps.footer?.eventLocation || Hero1DefaultProps.eventLocation;
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

        // Note: bride_name and groom_name are handled above as shared fields
        // Couple Section Defaults - Other fields
        case 'bride_role':
          defaultValue = templateProps.couple?.bride_role || Couple1DefaultProps.bride_role;
          break;
        case 'bride_description':
          defaultValue = templateProps.couple?.bride_description || Couple1DefaultProps.bride_description;
          break;
        case 'bride_imageUrl':
          defaultValue = templateProps.couple?.bride_imageUrl || Couple1DefaultProps.bride_imageUrl;
          break;
        case 'groom_role':
          defaultValue = templateProps.couple?.groom_role || Couple1DefaultProps.groom_role;
          break;
        case 'groom_description':
          defaultValue = templateProps.couple?.groom_description || Couple1DefaultProps.groom_description;
          break;
        case 'groom_imageUrl':
          defaultValue = templateProps.couple?.groom_imageUrl || Couple1DefaultProps.groom_imageUrl;
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

        // Gallery unified field - array of images
        case 'gallery_images': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages || galleryDefaults.galleryImages || [];
          break;
        }

        // Gallery image fields with defaults from the active Gallery component variant (legacy support)
        case 'gallery_image_1_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[0]?.url ||
                        (galleryDefaults.galleryImages?.[0] as any)?.src ||
                        (galleryDefaults.galleryImages?.[0] as any)?.url;
          break;
        }
        case 'gallery_image_1_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[0]?.alt || galleryDefaults.galleryImages?.[0]?.alt;
          break;
        }
        case 'gallery_image_1_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[0]?.category || galleryDefaults.galleryImages?.[0]?.category;
          break;
        }
        case 'gallery_image_2_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[1]?.url ||
                        (galleryDefaults.galleryImages?.[1] as any)?.src ||
                        (galleryDefaults.galleryImages?.[1] as any)?.url;
          break;
        }
        case 'gallery_image_2_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[1]?.alt || galleryDefaults.galleryImages?.[1]?.alt;
          break;
        }
        case 'gallery_image_2_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[1]?.category || galleryDefaults.galleryImages?.[1]?.category;
          break;
        }
        case 'gallery_image_3_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[2]?.url ||
                        (galleryDefaults.galleryImages?.[2] as any)?.src ||
                        (galleryDefaults.galleryImages?.[2] as any)?.url;
          break;
        }
        case 'gallery_image_3_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[2]?.alt || galleryDefaults.galleryImages?.[2]?.alt;
          break;
        }
        case 'gallery_image_3_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[2]?.category || galleryDefaults.galleryImages?.[2]?.category;
          break;
        }
        case 'gallery_image_4_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[3]?.url ||
                        (galleryDefaults.galleryImages?.[3] as any)?.src ||
                        (galleryDefaults.galleryImages?.[3] as any)?.url;
          break;
        }
        case 'gallery_image_4_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[3]?.alt || galleryDefaults.galleryImages?.[3]?.alt;
          break;
        }
        case 'gallery_image_4_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[3]?.category || galleryDefaults.galleryImages?.[3]?.category;
          break;
        }
        case 'gallery_image_5_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[4]?.url ||
                        (galleryDefaults.galleryImages?.[4] as any)?.src ||
                        (galleryDefaults.galleryImages?.[4] as any)?.url;
          break;
        }
        case 'gallery_image_5_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[4]?.alt || galleryDefaults.galleryImages?.[4]?.alt;
          break;
        }
        case 'gallery_image_5_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[4]?.category || galleryDefaults.galleryImages?.[4]?.category;
          break;
        }
        case 'gallery_image_6_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[5]?.url ||
                        (galleryDefaults.galleryImages?.[5] as any)?.src ||
                        (galleryDefaults.galleryImages?.[5] as any)?.url;
          break;
        }
        case 'gallery_image_6_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[5]?.alt || galleryDefaults.galleryImages?.[5]?.alt;
          break;
        }
        case 'gallery_image_6_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[5]?.category || galleryDefaults.galleryImages?.[5]?.category;
          break;
        }
        case 'gallery_image_7_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[6]?.url ||
                        (galleryDefaults.galleryImages?.[6] as any)?.src ||
                        (galleryDefaults.galleryImages?.[6] as any)?.url || '';
          break;
        }
        case 'gallery_image_7_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[6]?.alt || galleryDefaults.galleryImages?.[6]?.alt || '';
          break;
        }
        case 'gallery_image_7_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[6]?.category || galleryDefaults.galleryImages?.[6]?.category || 'ceremony';
          break;
        }
        case 'gallery_image_8_url': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[7]?.url ||
                        (galleryDefaults.galleryImages?.[7] as any)?.src ||
                        (galleryDefaults.galleryImages?.[7] as any)?.url || '';
          break;
        }
        case 'gallery_image_8_alt': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[7]?.alt || galleryDefaults.galleryImages?.[7]?.alt || '';
          break;
        }
        case 'gallery_image_8_category': {
          const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
          defaultValue = templateProps.gallery?.galleryImages?.[7]?.category || galleryDefaults.galleryImages?.[7]?.category || 'ceremony';
          break;
        }
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

        // Itinerary Section Defaults
        case 'itinerary_title':
          defaultValue = templateProps.itinerary?.title || Itinerary1DefaultProps.title;
          break;
        case 'itinerary_event_ceremonia_enabled':
          defaultValue = templateProps.itinerary?.event_ceremonia_enabled || Itinerary1DefaultProps.event_ceremonia_enabled;
          break;
        case 'itinerary_event_ceremonia_time':
          defaultValue = templateProps.itinerary?.event_ceremonia_time || Itinerary1DefaultProps.event_ceremonia_time;
          break;
        case 'itinerary_event_recepcion_enabled':
          defaultValue = templateProps.itinerary?.event_recepcion_enabled || Itinerary1DefaultProps.event_recepcion_enabled;
          break;
        case 'itinerary_event_recepcion_time':
          defaultValue = templateProps.itinerary?.event_recepcion_time || Itinerary1DefaultProps.event_recepcion_time;
          break;
        case 'itinerary_event_entrada_enabled':
          defaultValue = templateProps.itinerary?.event_entrada_enabled || Itinerary1DefaultProps.event_entrada_enabled;
          break;
        case 'itinerary_event_entrada_time':
          defaultValue = templateProps.itinerary?.event_entrada_time || Itinerary1DefaultProps.event_entrada_time;
          break;
        case 'itinerary_event_comida_enabled':
          defaultValue = templateProps.itinerary?.event_comida_enabled || Itinerary1DefaultProps.event_comida_enabled;
          break;
        case 'itinerary_event_comida_time':
          defaultValue = templateProps.itinerary?.event_comida_time || Itinerary1DefaultProps.event_comida_time;
          break;
        case 'itinerary_event_fiesta_enabled':
          defaultValue = templateProps.itinerary?.event_fiesta_enabled || Itinerary1DefaultProps.event_fiesta_enabled;
          break;
        case 'itinerary_event_fiesta_time':
          defaultValue = templateProps.itinerary?.event_fiesta_time || Itinerary1DefaultProps.event_fiesta_time;
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
  const updateField = useCallback((fieldKey: string, value: string | boolean | GalleryImage[]) => {
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
        // Generate coupleNames from individual names or use the computed one
        coupleNames: data.coupleNames ||
                    (data.groom_name && data.bride_name ? `${data.groom_name} & ${data.bride_name}` :
                     `${data.groom_name || 'Jefferson'} & ${data.bride_name || 'Rosmery'}`),
        // Individual fields needed by Hero1 component
        groom_name: data.groom_name || Hero1DefaultProps.groom_name,
        bride_name: data.bride_name || Hero1DefaultProps.bride_name,
        weddingDate: data.weddingDate || data.event_date || Hero1DefaultProps.weddingDate,
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
        // Use individual fields instead of legacy brideData/groomData
        bride_name: data.bride_name || data.couple_bride_name || Couple1DefaultProps.bride_name,
        bride_role: data.bride_role || Couple1DefaultProps.bride_role,
        bride_description: data.bride_description || Couple1DefaultProps.bride_description,
        bride_imageUrl: data.bride_imageUrl || Couple1DefaultProps.bride_imageUrl,
        groom_name: data.groom_name || data.couple_groom_name || Couple1DefaultProps.groom_name,
        groom_role: data.groom_role || Couple1DefaultProps.groom_role,
        groom_description: data.groom_description || Couple1DefaultProps.groom_description,
        groom_imageUrl: data.groom_imageUrl || Couple1DefaultProps.groom_imageUrl
      },
      countdown: {
        weddingDate: data.weddingDate || data.event_date || Countdown1DefaultProps.weddingDate,
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
        sectionSubtitle: (getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps).sectionSubtitle,
        sectionTitle: (getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps).sectionTitle,
        galleryImages: (() => {
          // Use unified gallery_images field if available
          if (data.gallery_images && Array.isArray(data.gallery_images)) {
            return data.gallery_images.map((image: any, index: number) => ({
              id: index + 1,
              url: image.url || '',
              alt: image.alt || `Imagen ${index + 1}`,
              category: image.category || 'ceremony'
            }));
          }

          // Fallback to legacy individual fields for backward compatibility
          const legacyImages = [];
          for (let i = 1; i <= 10; i++) {
            const urlKey = `gallery_image_${i}_url`;
            const altKey = `gallery_image_${i}_alt`;
            const categoryKey = `gallery_image_${i}_category`;

            if (data[urlKey]) {
              legacyImages.push({
                id: i,
                url: data[urlKey],
                alt: data[altKey] || `Imagen ${i}`,
                category: data[categoryKey] || 'ceremony'
              });
            }
          }

          // If no images from either method, use defaults
          if (legacyImages.length === 0) {
            const galleryDefaults = getSectionVariant('gallery') === 'gallery_2' ? Gallery2DefaultProps : Gallery1DefaultProps;
            return galleryDefaults.galleryImages || [];
          }

          return legacyImages;
        })()
      },
      itinerary: {
        title: data.itinerary_title || Itinerary1DefaultProps.title,
        event_ceremonia_enabled: data.itinerary_event_ceremonia_enabled !== undefined ?
          data.itinerary_event_ceremonia_enabled : Itinerary1DefaultProps.event_ceremonia_enabled,
        event_ceremonia_time: data.itinerary_event_ceremonia_time || Itinerary1DefaultProps.event_ceremonia_time,
        event_recepcion_enabled: data.itinerary_event_recepcion_enabled !== undefined ?
          data.itinerary_event_recepcion_enabled : Itinerary1DefaultProps.event_recepcion_enabled,
        event_recepcion_time: data.itinerary_event_recepcion_time || Itinerary1DefaultProps.event_recepcion_time,
        event_entrada_enabled: data.itinerary_event_entrada_enabled !== undefined ?
          data.itinerary_event_entrada_enabled : Itinerary1DefaultProps.event_entrada_enabled,
        event_entrada_time: data.itinerary_event_entrada_time || Itinerary1DefaultProps.event_entrada_time,
        event_comida_enabled: data.itinerary_event_comida_enabled !== undefined ?
          data.itinerary_event_comida_enabled : Itinerary1DefaultProps.event_comida_enabled,
        event_comida_time: data.itinerary_event_comida_time || Itinerary1DefaultProps.event_comida_time,
        event_fiesta_enabled: data.itinerary_event_fiesta_enabled !== undefined ?
          data.itinerary_event_fiesta_enabled : Itinerary1DefaultProps.event_fiesta_enabled,
        event_fiesta_time: data.itinerary_event_fiesta_time || Itinerary1DefaultProps.event_fiesta_time
      },
      footer: {
        // Use same logic as hero for consistency
        coupleNames: data.coupleNames ||
                    (data.groom_name && data.bride_name ? `${data.groom_name} & ${data.bride_name}` :
                     `${data.groom_name || 'Jefferson'} & ${data.bride_name || 'Rosmery'}`),
        // Individual fields needed by Footer1 component
        groom_name: data.groom_name || Footer1DefaultProps.groom_name,
        bride_name: data.bride_name || Footer1DefaultProps.bride_name,
        weddingDate: data.weddingDate || data.event_date || Footer1DefaultProps.weddingDate,
        eventLocation: data.eventLocation || data.event_venue_city || Footer1DefaultProps.eventLocation,
        copyrightText: data.footer_copyrightText || Footer1DefaultProps.copyrightText
      }
    };
  }, []);

  // Auto-generate computed fields from individual values
  const getComputedFields = useCallback((data: CustomizerData): CustomizerData => {
    const computed = { ...data };

    // Auto-generate coupleNames for Hero and Footer from individual names
    if (data.groom_name && data.bride_name) {
      computed.coupleNames = `${data.groom_name} & ${data.bride_name}`;
    }

    // Auto-generate eventDate and footer_eventDate from weddingDate
    if (data.weddingDate && typeof data.weddingDate === 'string') {
      const formatWeddingDate = (weddingDateTime: string): string => {
        if (!weddingDateTime) return 'Tu Fecha Especial';

        try {
          const date = new Date(weddingDateTime);
          return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        } catch (error) {
          return 'Tu Fecha Especial';
        }
      };

      // Generate eventDate for Hero section
      computed.eventDate = formatWeddingDate(data.weddingDate);

      // Generate footer_eventDate for Footer section (uppercase)
      computed.footer_eventDate = formatWeddingDate(data.weddingDate).toUpperCase();
    }

    return computed;
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

    // Apply computed fields (like auto-generated coupleNames)
    const finalMergedData = getComputedFields(mergedData);

    return transformToTemplateProps(finalMergedData);
  }, [availableFields, touchedFields, customizerData, templateDefaults, templateData, transformToTemplateProps, getComputedFields]);

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

  // Get fields grouped by ordered sections with mode filtering
  const fieldsBySection = useMemo(() => {
    // 🚨 DEBUG: Log mode filtering process
    console.log('🔍 useDynamicCustomizer fieldsBySection calculation:', {
      selectedMode,
      totalAvailableFields: availableFields.length,
      activeSections,
      basicFieldsCount: WEDDING_BASIC_FIELDS.length,
      galleryInBasicFields: WEDDING_BASIC_FIELDS.includes('gallery_images')
    });

    // Filter fields by selected mode first
    const filteredFields = selectedMode === 'basic'
      ? availableFields.filter(field => WEDDING_BASIC_FIELDS.includes(field.key))
      : availableFields;

    // 🚨 DEBUG: Log filtering result
    console.log('🔍 After mode filtering:', {
      filteredFieldsCount: filteredFields.length,
      galleryImagesIncluded: filteredFields.some(f => f.key === 'gallery_images'),
      filteredFieldKeys: filteredFields.map(f => f.key)
    });

    // Then group by sections
    const result = getFieldsByOrderedSections(filteredFields, activeSections);

    // 🚨 DEBUG: Log final result from useDynamicCustomizer
    console.log('🎯 useDynamicCustomizer final fieldsBySection:', {
      sections: Object.keys(result),
      gallerySection: result.gallery || 'NO GALLERY SECTION',
      galleryFieldsCount: result.gallery?.length || 0
    });

    return result;
  }, [availableFields, activeSections, selectedMode]);

  // Legacy support: alias for backward compatibility
  const fieldsByCategory = fieldsBySection;

  // Get current value for a field
  const getFieldValue = useCallback((fieldKey: string): string | boolean | GalleryImage[] => {
    // If field has been touched, use the customizer value
    if (touchedFields[fieldKey]) {
      return customizerData[fieldKey] || (fieldKey === 'gallery_images' ? [] : '');
    }

    // If field hasn't been touched, use the template default
    return templateDefaults[fieldKey] !== undefined ? templateDefaults[fieldKey] : (fieldKey === 'gallery_images' ? [] : '');
  }, [customizerData, touchedFields, templateDefaults]);

  // Get section configuration for a section name
  const getSectionConfig = useCallback((sectionName: string) => {
    return SECTION_FIELDS_MAP[sectionName];
  }, []);

  // Get field state for progressive override UI
  const getFieldState = useCallback((fieldKey: string): FieldState => {
    const currentValue = customizerData[fieldKey] || (fieldKey === 'gallery_images' ? [] : '');
    const defaultValue = templateDefaults[fieldKey] || (fieldKey === 'gallery_images' ? [] : '');
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

  // Mode switching function
  const switchMode = useCallback((mode: CustomizerMode) => {
    setSelectedMode(mode);
  }, []);

  return {
    // State
    isOpen,
    customizerData,
    availableFields,
    activeSections,
    fieldsByCategory, // Legacy: now grouped by sections with mode filtering
    fieldsBySection,  // New: explicitly grouped by sections with mode filtering
    hasChanges,
    hasFields,
    selectedMode,

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
    switchMode,

    // Data access
    getMergedData,
    getProgressiveMergedData,
    getFieldValue,
    getFieldState,
    getSectionConfig,

    // Computed
    sectionsCount: activeSections.length,
    fieldsCount: availableFields.length,

    // Category-specific configuration
    basicFields: WEDDING_BASIC_FIELDS // TODO: Make this dynamic per category
  };
}