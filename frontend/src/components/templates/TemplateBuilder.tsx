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

import React, { useEffect, useState, useRef } from 'react';
import { TemplateProps } from '@/types/template';
import { getWeddingSectionComponent } from './categories/weddings/sections/registry';
import { apiClient } from '@/lib/api';
import { LoaderOverlay } from '@/components/ui/LoaderOverlay';

// Import default props from wedding section components (single source of truth)
import { Hero1DefaultProps } from './categories/weddings/sections/hero/Hero1';

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
  category?: 'weddings' | 'kids' | 'corporate';
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
  category: 'weddings' | 'kids' | 'corporate';
  children?: React.ReactNode;
}

// Get section component based on category
const getSectionComponentByCategory = (sectionKey: string, category: 'weddings' | 'kids' | 'corporate') => {
  switch (category) {
    case 'weddings':
      return getWeddingSectionComponent(sectionKey);
    case 'kids':
      // TODO: Import and use kids section registry
      return null;
    case 'corporate':
      // TODO: Import and use corporate section registry
      return null;
    default:
      return getWeddingSectionComponent(sectionKey); // Default to weddings
  }
};

// Error boundary wrapper for individual sections
const SectionWrapper: React.FC<SectionWrapperProps> = ({
  sectionKey,
  sectionType,
  props,
  category
}) => {
  try {
    const SectionComponent = getSectionComponentByCategory(sectionKey, category);

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
  sectionsConfig,
  category = 'weddings'
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

  // Update modular data when customizer data changes
  useEffect(() => {
    if (isTransformedData && data) {
      setModularData(data as ModularData);
      setLoading(false);
      setError(null);
    } else if (isDevelopmentMode && !isTransformedData) {
      setModularData(null);
      setLoading(false);
      setError(null);
    }
  }, [data, isTransformedData, isDevelopmentMode]);

  // Fetch from API only once for non-development mode
  useEffect(() => {
    // Skip if in development mode or data is already transformed
    if (isDevelopmentMode || isTransformedData) {
      return;
    }

    if (!invitation?.id) {
      setError('No invitation ID provided');
      setLoading(false);
      return;
    }

    const fetchModularData = async () => {
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
  }, [invitation?.id, isDevelopmentMode, isTransformedData]);


  // Error state - only show if error AND no fallback data
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
    <div className="relative">
      {/* Loading overlay - sits on top of content while loading */}
      <LoaderOverlay
        isLoading={loading}
        category={category}
        message="Cargando template..."
        zIndex={60}
      />

      {/* Template content - renders underneath the overlay */}
      <div className="font-serif bg-white" data-template-renderer="true">

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

        // 🔍 DEBUG: Log props for each section
        const sectionProps = modularData?.[sectionType] || {};
        return (
          <div key={sectionType} data-section={sectionType}>
            <SectionWrapper
              sectionKey={sectionKey}
              sectionType={sectionType}
              props={sectionProps}
              category={category}
            />
          </div>
        );
      })}

      </div>
    </div>
  );
};