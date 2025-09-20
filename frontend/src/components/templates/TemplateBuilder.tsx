/**
 * Template Builder Component - UPDATED FOR DYNAMIC DATA
 *
 * WHY: Renders modular templates by dynamically loading and combining individual
 * section components based on sections_config from the database. Now uses real
 * data from InvitationData via the modular templates API.
 *
 * FEATURES:
 * - Dynamic section loading from registry
 * - Real invitation data from database
 * - Fallback handling for missing sections
 * - Error boundaries for section failures
 * - API-driven prop configuration
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TemplateProps } from '@/types/template';
import { getSectionComponent } from './sections/registry';
import { apiClient } from '@/lib/api';

interface SectionsConfig {
  hero?: string;
  welcome?: string;
  couple?: string;
  countdown?: string;
  story?: string;
  video?: string;
  gallery?: string;
  footer?: string;
}

interface TemplateBuilderProps extends TemplateProps {
  sectionsConfig: SectionsConfig;
}

interface ModularData {
  [sectionType: string]: any;
}

interface ApiResponse {
  invitation_id: number;
  template_props: {
    section_props: ModularData;
    config: {
      colors: any;
      sections_enabled: any;
      custom_css: string;
    };
  };
}

interface SectionWrapperProps {
  sectionKey: string;
  sectionType: string;
  props: any;
  children?: React.ReactNode;
}

// Error boundary wrapper for individual sections
const SectionWrapper: React.FC<SectionWrapperProps> = ({
  sectionKey,
  sectionType,
  props
}) => {
  try {
    const SectionComponent = getSectionComponent(sectionKey);

    if (!SectionComponent) {
      console.warn(`Section component "${sectionKey}" not found in registry`);
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Section not available:</strong> {sectionKey}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Please check the section registry or select a different {sectionType} section.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <SectionComponent {...props} />;
  } catch (error) {
    console.error(`Error rendering section ${sectionKey}:`, error);
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Section error:</strong> {sectionKey}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Failed to render this section. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  invitation,
  data,
  template,
  colors,
  features,
  media,
  events,
  isPreview = false,
  isEditing = false,
  sectionsConfig
}) => {

  const [modularData, setModularData] = useState<ModularData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if data is already transformed (from customizer)
  const isTransformedData = data && typeof data === 'object' &&
    ('hero' in data || 'welcome' in data || 'couple' in data);

  // Detect development mode - when URL contains /demo/ or no real invitation ID
  const isDevelopmentMode = typeof window !== 'undefined' && (
    window.location.pathname.includes('/demo/') ||
    !invitation?.id ||
    invitation?.id === 7 // Demo invitation
  );

  // Fetch modular data from API ONLY if NOT in development mode and data is not already transformed
  useEffect(() => {
    const fetchModularData = async () => {
      // If data is already transformed (from customizer), use it directly
      if (isTransformedData) {
        console.log('🎨 Customizer Mode: Using transformed data');
        setModularData(data as ModularData);
        setLoading(false);
        setError(null);
        return;
      }

      // In development mode, skip API and use component defaults
      if (isDevelopmentMode) {
        console.log('🔧 Development Mode: Using component defaults for hot reload');
        setModularData(null); // Will trigger component defaults
        setLoading(false);
        setError(null);
        return;
      }

      if (!invitation?.id) {
        setError('No invitation ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/modular-templates/invitation/${invitation.id}/template-props`);

        const apiData: ApiResponse = response.data;
        setModularData(apiData.template_props.section_props);
        setError(null);
      } catch (err) {
        console.error('Error fetching modular data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');

        // Fallback to component defaults in case of API error
        setModularData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModularData();
  }, [invitation?.id, isDevelopmentMode, isTransformedData, data]);

  // Create fallback props using legacy data (backup plan)
  const createFallbackProps = (): ModularData => {
    return {
      hero: {
        coupleNames: `${data.couple_bride_name || 'Bride'} & ${data.couple_groom_name || 'Groom'}`,
        eventDate: data.event_date ? new Date(data.event_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : '15 December, 2024',
        eventLocation: data.event_venue_city || 'Ciudad',
        heroImageUrl: data.gallery_hero_image || media?.[0]?.file_path || 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260',
      },
      welcome: {
        bannerImageUrl: 'https://i.imgur.com/svWa52m.png',
        couplePhotoUrl: data.gallery_couple_image || media?.[1]?.file_path || 'https://i.imgur.com/OFaT2vQ.png',
        welcomeText: 'HELLO & WELCOME',
        title: "We're getting married!",
        description: data.message_welcome_text || data.couple_story || 'Join us for our special day',
      },
      couple: {
        sectionTitle: 'Happy Couple',
        sectionSubtitle: 'BRIDE & GROOM',
        brideData: {
          imageUrl: 'https://i.imgur.com/u1wA4oo.png',
          name: data.couple_bride_name || 'Bride',
          role: 'The Bride',
          description: 'A beautiful soul with a heart full of love and dreams.',
          socialLinks: { facebook: '#', twitter: '#', instagram: '#' }
        },
        groomData: {
          imageUrl: 'https://i.imgur.com/qL42vPA.png',
          name: data.couple_groom_name || 'Groom',
          role: 'The Groom',
          description: 'A loving partner ready to start this new journey together.',
          socialLinks: { facebook: '#', twitter: '#', instagram: '#' }
        }
      },
      countdown: {
        weddingDate: data.event_date || new Date().toISOString(),
        backgroundImageUrl: 'https://i.imgur.com/7p4m1iH.png',
        preTitle: 'WE WILL BECOME A FAMILY IN',
        title: "We're getting married in"
      },
      story: {
        sectionSubtitle: `${data.couple_bride_name?.toUpperCase() || 'BRIDE'} & ${data.couple_groom_name?.toUpperCase() || 'GROOM'}`,
        sectionTitle: 'Our Love Story',
        storyMoments: []
      },
      video: {
        backgroundImageUrl: 'https://i.imgur.com/KxT5vJM.png',
        videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        preTitle: 'A LOVE STORY BEGINNING',
        title: 'Watch our love story'
      },
      gallery: {
        sectionSubtitle: 'MEMORIES',
        sectionTitle: 'Wedding Gallery',
        galleryImages: media?.map((m, index) => ({
          id: m.id || index,
          url: m.file_path,
          alt: m.title || `Wedding photo ${index + 1}`,
          category: m.media_type === 'hero' ? 'ceremony' : 'party'
        })) || []
      },
      footer: {
        coupleNames: `${data.couple_bride_name || 'Bride'} & ${data.couple_groom_name || 'Groom'}`,
        eventDate: data.event_date ? new Date(data.event_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).toUpperCase() : '15 DECEMBER, 2024',
        eventLocation: data.event_venue_city?.toUpperCase() || 'CIUDAD',
        copyrightText: 'Made with love. All rights reserved.'
      }
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modular template...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !modularData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Template Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please check the API connection or try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-serif bg-white">

      {/* Render sections in order based on database configuration - DYNAMIC ORDER */}
      {(() => {
        // If template has sections_config_ordered (from backend), use that for correct order
        const templateData = template as any;
        let sectionOrder: string[];

        if (templateData?.sections_config_ordered) {
          // Use the ordered list from backend that preserves database order
          sectionOrder = templateData.sections_config_ordered.map((item: [string, string]) => item[0]);
        } else {
          // Fallback to Object.keys (which may be alphabetical due to JSON serialization)
          sectionOrder = Object.keys(sectionsConfig);
        }

        return sectionOrder;
      })().map((sectionType) => {
        const sectionKey = sectionsConfig[sectionType as keyof SectionsConfig];

        // Only render if section is configured
        if (!sectionKey) return null;

        return (
          <SectionWrapper
            key={sectionType}
            sectionKey={sectionKey}
            sectionType={sectionType}
            props={modularData?.[sectionType] || {}} // Empty object will trigger component defaults
          />
        );
      })}

      {/* Debug info for development */}
      {isPreview && process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
          <div className="text-sm text-blue-700">
            <strong>🔧 Debug Info:</strong>
            <br />
            <strong>Invitation ID:</strong> {invitation?.id}
            <br />
            <strong>Sections Loaded:</strong> {modularData ? Object.keys(modularData).join(', ') : 'None'}
            <br />
            <strong>API Status:</strong> {error ? `Error: ${error}` : 'Success'}
          </div>
        </div>
      )}
    </div>
  );
};