/**
 * Section Registry
 *
 * WHY: Central registry that maps section keys to their corresponding React components.
 * This enables dynamic loading and infinite combinations of template sections.
 *
 * USAGE:
 * - Each section type (hero, welcome, couple, etc.) has multiple variations
 * - Section keys follow the pattern: sectionType_number (e.g., 'hero_1', 'welcome_1')
 * - New sections can be easily added by importing and registering them
 *
 * BENEFITS:
 * - Infinite template combinations (Hero1 + Welcome1 + Couple2 + etc.)
 * - Easy to maintain and extend
 * - Type-safe section selection
 * - Scalable architecture for future sections
 */

import { ComponentType } from 'react';

// Import Hero Sections
import { Hero1 } from '../hero/Hero1';

// Import Welcome Sections
import { Welcome1 } from '../welcome/Welcome1';

// Import Couple Sections
import { Couple1 } from '../couple/Couple1';

// Import Countdown Sections
import { Countdown1 } from '../countdown/Countdown1';

// Import Story Sections
import { Story1 } from '../story/Story1';

// Import Video Sections
import { Video1 } from '../video/Video1';

// Import Gallery Sections
import { Gallery1 } from '../gallery/Gallery1';

// Import Footer Sections
import { Footer1 } from '../footer/Footer1';

// Types for section registry
export interface SectionRegistry {
  [key: string]: ComponentType<any>;
}

export interface SectionsByType {
  hero: { [key: string]: ComponentType<any> };
  welcome: { [key: string]: ComponentType<any> };
  couple: { [key: string]: ComponentType<any> };
  countdown: { [key: string]: ComponentType<any> };
  story: { [key: string]: ComponentType<any> };
  video: { [key: string]: ComponentType<any> };
  gallery: { [key: string]: ComponentType<any> };
  footer: { [key: string]: ComponentType<any> };
}

/**
 * Section Registry Mapping
 *
 * Key: section_type + '_' + number (e.g., 'hero_1', 'welcome_1')
 * Value: React component for that section
 */
export const sectionRegistry: SectionRegistry = {
  // Hero Sections
  'hero_1': Hero1,

  // Welcome Sections
  'welcome_1': Welcome1,

  // Couple Sections
  'couple_1': Couple1,

  // Countdown Sections
  'countdown_1': Countdown1,

  // Story Sections
  'story_1': Story1,

  // Video Sections
  'video_1': Video1,

  // Gallery Sections
  'gallery_1': Gallery1,

  // Footer Sections
  'footer_1': Footer1,

  // Future sections will be added here:
  // 'hero_2': Hero2,
  // 'hero_3': Hero3,
  // 'welcome_2': Welcome2,
  // 'couple_2': Couple2,
  // etc.
};

/**
 * Organized sections by type for easier access
 */
export const sectionsByType: SectionsByType = {
  hero: {
    'hero_1': Hero1,
    // 'hero_2': Hero2,
    // 'hero_3': Hero3,
  },
  welcome: {
    'welcome_1': Welcome1,
    // 'welcome_2': Welcome2,
    // 'welcome_3': Welcome3,
  },
  couple: {
    'couple_1': Couple1,
    // 'couple_2': Couple2,
    // 'couple_3': Couple3,
  },
  countdown: {
    'countdown_1': Countdown1,
    // 'countdown_2': Countdown2,
    // 'countdown_3': Countdown3,
  },
  story: {
    'story_1': Story1,
    // 'story_2': Story2,
    // 'story_3': Story3,
  },
  video: {
    'video_1': Video1,
    // 'video_2': Video2,
    // 'video_3': Video3,
  },
  gallery: {
    'gallery_1': Gallery1,
    // 'gallery_2': Gallery2,
    // 'gallery_3': Gallery3,
  },
  footer: {
    'footer_1': Footer1,
    // 'footer_2': Footer2,
    // 'footer_3': Footer3,
  },
};

/**
 * Get available section keys for a specific type
 */
export const getAvailableSections = (sectionType: keyof SectionsByType): string[] => {
  return Object.keys(sectionsByType[sectionType]);
};

/**
 * Get all available section types
 */
export const getSectionTypes = (): Array<keyof SectionsByType> => {
  return Object.keys(sectionsByType) as Array<keyof SectionsByType>;
};

/**
 * Check if a section exists in the registry
 */
export const isSectionAvailable = (sectionKey: string): boolean => {
  return sectionKey in sectionRegistry;
};

/**
 * Get section component by key
 */
export const getSectionComponent = (sectionKey: string): ComponentType<any> | null => {
  return sectionRegistry[sectionKey] || null;
};

/**
 * Template Configuration Interface
 *
 * Defines the structure for configuring which sections to use in a template
 */
export interface TemplateConfig {
  sections: {
    hero: string;      // e.g., 'hero_1'
    welcome: string;   // e.g., 'welcome_1'
    couple: string;    // e.g., 'couple_1'
    countdown: string; // e.g., 'countdown_1'
    story: string;     // e.g., 'story_1'
    video: string;     // e.g., 'video_1'
    gallery: string;   // e.g., 'gallery_1'
    footer: string;    // e.g., 'footer_1'
  };
}

/**
 * Example template configurations for inspiration
 */
export const exampleTemplateConfigs: { [key: string]: TemplateConfig } = {
  'elegante_romance': {
    sections: {
      hero: 'hero_1',
      welcome: 'welcome_1',
      couple: 'couple_1',
      countdown: 'countdown_1',
      story: 'story_1',
      video: 'video_1',
      gallery: 'gallery_1',
      footer: 'footer_1',
    }
  },
  // Future combinations:
  // 'modern_minimalist': {
  //   sections: {
  //     hero: 'hero_2',
  //     welcome: 'welcome_2',
  //     couple: 'couple_2',
  //     countdown: 'countdown_2',
  //     story: 'story_2',
  //     video: 'video_2',
  //     gallery: 'gallery_2',
  //     footer: 'footer_2',
  //   }
  // },
};