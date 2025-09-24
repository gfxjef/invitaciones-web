/**
 * Wedding Section Registry
 *
 * WHY: Central registry for wedding-specific sections. This enables dynamic loading
 * and infinite combinations of wedding template sections.
 *
 * USAGE:
 * - Each wedding section type (hero, welcome, couple, etc.) has multiple variations
 * - Section keys follow the pattern: sectionType_number (e.g., 'hero_1', 'welcome_1')
 * - Wedding-specific sections are isolated from other categories
 *
 * BENEFITS:
 * - Infinite wedding template combinations
 * - Category isolation (wedding sections don't interfere with kids/corporate)
 * - Easy to maintain and extend
 * - Type-safe section selection
 */

import { ComponentType } from 'react';

// Import Wedding Hero Sections
import { Hero1 } from '../hero/Hero1';
import { Hero2 } from '../hero/Hero2';

// Import Wedding Welcome Sections
import { Welcome1 } from '../welcome/Welcome1';
import { Welcome2 } from '../welcome/Welcome2';

// Import Wedding Couple Sections
import { Couple1 } from '../couple/Couple1';

// Import Wedding Countdown Sections
import { Countdown1 } from '../countdown/Countdown1';

// Import Wedding Story Sections
import { Story1 } from '../story/Story1';

// Import Wedding Video Sections
import { Video1 } from '../video/Video1';

// Import Wedding Gallery Sections
import { Gallery1 } from '../gallery/Gallery1';
import { Gallery2 } from '../gallery/Gallery2';

// Import Wedding Itinerary Sections
import { Itinerary1 } from '../itinerary/Itinerary1';

// Import Wedding Familiares Sections
import { Familiares1 } from '../familiares/Familiares1';

// Import Wedding PlaceReligioso Sections
import { PlaceReligioso1 } from '../place_religioso/PlaceReligioso1';

// Import Wedding PlaceCeremonia Sections
import { PlaceCeremonia1 } from '../place_ceremonia/PlaceCeremonia1';

// Import Wedding Vestimenta Sections
import { Vestimenta1 } from '../vestimenta/Vestimenta1';

// Import Wedding Footer Sections
import { Footer1 } from '../footer/Footer1';

// Types for wedding section registry
export interface WeddingSectionRegistry {
  [key: string]: ComponentType<any>;
}

export interface WeddingSectionsByType {
  hero: { [key: string]: ComponentType<any> };
  welcome: { [key: string]: ComponentType<any> };
  couple: { [key: string]: ComponentType<any> };
  countdown: { [key: string]: ComponentType<any> };
  story: { [key: string]: ComponentType<any> };
  video: { [key: string]: ComponentType<any> };
  gallery: { [key: string]: ComponentType<any> };
  itinerary: { [key: string]: ComponentType<any> };
  familiares: { [key: string]: ComponentType<any> };
  place_religioso: { [key: string]: ComponentType<any> };
  place_ceremonia: { [key: string]: ComponentType<any> };
  vestimenta: { [key: string]: ComponentType<any> };
  footer: { [key: string]: ComponentType<any> };
}

/**
 * Wedding Section Registry Mapping
 *
 * Key: section_type + '_' + number (e.g., 'hero_1', 'welcome_1')
 * Value: React component for that wedding section
 */
export const weddingSectionRegistry: WeddingSectionRegistry = {
  // Hero Sections
  'hero_1': Hero1,
  'hero_2': Hero2,

  // Welcome Sections
  'welcome_1': Welcome1,
  'welcome_2': Welcome2,

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
  'gallery_2': Gallery2,

  // Itinerary Sections
  'itinerary_1': Itinerary1,

  // Familiares Sections
  'familiares_1': Familiares1,

  // PlaceReligioso Sections
  'place_religioso_1': PlaceReligioso1,

  // PlaceCeremonia Sections
  'place_ceremonia_1': PlaceCeremonia1,

  // Vestimenta Sections
  'vestimenta_1': Vestimenta1,

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
 * Organized wedding sections by type for easier access
 */
export const weddingSectionsByType: WeddingSectionsByType = {
  hero: {
    'hero_1': Hero1,
    'hero_2': Hero2,
    // 'hero_3': Hero3,
  },
  welcome: {
    'welcome_1': Welcome1,
    'welcome_2': Welcome2,
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
    'gallery_2': Gallery2,
    // 'gallery_3': Gallery3,
  },
  itinerary: {
    'itinerary_1': Itinerary1,
    // 'itinerary_2': Itinerary2,
    // 'itinerary_3': Itinerary3,
  },
  familiares: {
    'familiares_1': Familiares1,
    // 'familiares_2': Familiares2,
    // 'familiares_3': Familiares3,
  },
  place_religioso: {
    'place_religioso_1': PlaceReligioso1,
    // 'place_religioso_2': PlaceReligioso2,
    // 'place_religioso_3': PlaceReligioso3,
  },
  place_ceremonia: {
    'place_ceremonia_1': PlaceCeremonia1,
    // 'place_ceremonia_2': PlaceCeremonia2,
    // 'place_ceremonia_3': PlaceCeremonia3,
  },
  vestimenta: {
    'vestimenta_1': Vestimenta1,
    // 'vestimenta_2': Vestimenta2,
    // 'vestimenta_3': Vestimenta3,
  },
  footer: {
    'footer_1': Footer1,
    // 'footer_2': Footer2,
    // 'footer_3': Footer3,
  },
};

/**
 * Get available wedding section keys for a specific type
 */
export const getAvailableWeddingSections = (sectionType: keyof WeddingSectionsByType): string[] => {
  return Object.keys(weddingSectionsByType[sectionType]);
};

/**
 * Get all available wedding section types
 */
export const getWeddingSectionTypes = (): Array<keyof WeddingSectionsByType> => {
  return Object.keys(weddingSectionsByType) as Array<keyof WeddingSectionsByType>;
};

/**
 * Check if a wedding section exists in the registry
 */
export const isWeddingSectionAvailable = (sectionKey: string): boolean => {
  return sectionKey in weddingSectionRegistry;
};

/**
 * Get wedding section component by key
 */
export const getWeddingSectionComponent = (sectionKey: string): ComponentType<any> | null => {
  return weddingSectionRegistry[sectionKey] || null;
};

/**
 * Wedding Template Configuration Interface
 *
 * Defines the structure for configuring which wedding sections to use in a template
 */
export interface WeddingTemplateConfig {
  sections: {
    hero: string;      // e.g., 'hero_1'
    welcome: string;   // e.g., 'welcome_1'
    couple: string;    // e.g., 'couple_1'
    countdown: string; // e.g., 'countdown_1'
    story: string;     // e.g., 'story_1'
    video: string;     // e.g., 'video_1'
    gallery: string;   // e.g., 'gallery_1'
    itinerary: string; // e.g., 'itinerary_1'
    familiares: string; // e.g., 'familiares_1'
    place_religioso: string;  // e.g., 'place_religioso_1'
    place_ceremonia: string;  // e.g., 'place_ceremonia_1'
    vestimenta: string; // e.g., 'vestimenta_1'
    footer: string;    // e.g., 'footer_1'
  };
}

/**
 * Example wedding template configurations
 */
export const exampleWeddingTemplateConfigs: { [key: string]: WeddingTemplateConfig } = {
  'elegante_romance': {
    sections: {
      hero: 'hero_1',
      welcome: 'welcome_1',
      couple: 'couple_1',
      countdown: 'countdown_1',
      story: 'story_1',
      video: 'video_1',
      gallery: 'gallery_1',
      itinerary: 'itinerary_1',
      familiares: 'familiares_1',
      place_religioso: 'place_religioso_1',
      place_ceremonia: 'place_ceremonia_1',
      vestimenta: 'vestimenta_1',
      footer: 'footer_1',
    }
  },
  // Future wedding combinations:
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