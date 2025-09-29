/**
 * localStorage to Sections Transformer
 *
 * WHY: Transforms flat localStorage customizer data into section-grouped
 * structure required by the backend API endpoint /api/invitations/create
 *
 * WHAT: Takes the flat object structure from localStorage and groups
 * fields by their corresponding sections based on field names and prefixes.
 */

import { CustomizerData } from '@/components/customizer/types';

/**
 * Map customizer mode to plan ID
 *
 * @param mode - Customizer mode ('basic' or 'full')
 * @returns Plan ID for backend (3 = Basic, 4 = Complete/Premium)
 */
export function getPlanIdFromMode(mode: 'basic' | 'full' | undefined): number {
  switch (mode) {
    case 'basic':
      return 3; // Plan Básico
    case 'full':
      return 4; // Plan Completo/Premium
    default:
      return 3; // Default to basic
  }
}

/**
 * Section mapping configuration
 * Maps specific fields to their sections when prefix detection isn't enough
 */
const FIELD_TO_SECTION_MAP: Record<string, string> = {
  // Hero section - fields without prefixes
  'groom_name': 'hero',
  'bride_name': 'hero',
  'weddingDate': 'hero',
  'eventLocation': 'hero',
  'heroImageUrl': 'hero',

  // Shared fields that appear in multiple sections
  'sectionTitle': 'story',  // Default to story, but could be overridden
  'sectionSubtitle': 'story',
};

/**
 * Prefix-based section detection
 * These prefixes clearly indicate which section a field belongs to
 */
const PREFIX_TO_SECTION_MAP: Record<string, string> = {
  'familiares_': 'familiares',
  'welcome_': 'welcome',
  'place_religioso_': 'place_religioso',
  'place_ceremonia_': 'place_ceremonia',
  'vestimenta_': 'vestimenta',
  'countdown_': 'countdown',
  'gallery_': 'gallery',
  'story_': 'story',
  'itinerary_': 'itinerary',
  'couple_': 'couple',
  'video_': 'video',
  'footer_': 'footer',
};

/**
 * Groups flat customizer data into sections
 *
 * @param customizerData - Flat object with all customizer fields
 * @returns Object grouped by sections for backend API
 */
export function groupCustomizerDataBySections(
  customizerData: CustomizerData | Record<string, any>
): Record<string, Record<string, any>> {

  const sections: Record<string, Record<string, any>> = {};

  // Process each field in the customizer data
  Object.entries(customizerData).forEach(([fieldKey, fieldValue]) => {
    let sectionName: string | null = null;

    // 1. First check explicit field mapping
    if (FIELD_TO_SECTION_MAP[fieldKey]) {
      sectionName = FIELD_TO_SECTION_MAP[fieldKey];
    }

    // 2. If not found, check prefix-based mapping
    if (!sectionName) {
      for (const [prefix, section] of Object.entries(PREFIX_TO_SECTION_MAP)) {
        if (fieldKey.startsWith(prefix)) {
          sectionName = section;
          break;
        }
      }
    }

    // 3. If still not found, try to detect special cases
    if (!sectionName) {
      // Handle fields that might not have clear prefixes
      if (fieldKey.includes('bride') || fieldKey.includes('groom')) {
        sectionName = fieldKey.startsWith('couple_') ? 'couple' : 'hero';
      }
    }

    // 4. Add field to the appropriate section
    if (sectionName) {
      if (!sections[sectionName]) {
        sections[sectionName] = {};
      }
      sections[sectionName][fieldKey] = fieldValue;
    } else {
      // Log unmapped fields for debugging
      console.warn(`⚠️ Field "${fieldKey}" could not be mapped to any section`);
    }
  });

  return sections;
}

/**
 * Get localStorage data for a specific template
 *
 * @param templateId - The template ID to retrieve data for
 * @returns The stored customizer state or null if not found
 */
export function getCustomizerDataFromLocalStorage(
  templateId: number | string
): { customizerData: any; touchedFields: any; selectedMode?: 'basic' | 'full'; timestamp: number } | null {

  const storageKey = `demo-customizer-${templateId}`;

  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      console.log(`📭 No localStorage data found for template ${templateId}`);
      return null;
    }

    const state = JSON.parse(saved);

    // Verify the data is valid and recent (within 24 hours)
    const isRecent = Date.now() - (state.timestamp || 0) < 24 * 60 * 60 * 1000;

    if (!isRecent) {
      console.warn(`⏰ localStorage data for template ${templateId} is older than 24 hours`);
    }

    console.log(`📦 Retrieved localStorage data for template ${templateId}:`, {
      fieldsCount: Object.keys(state.customizerData || {}).length,
      touchedCount: Object.keys(state.touchedFields || {}).length,
      age: Math.round((Date.now() - state.timestamp) / 1000 / 60) + ' minutes'
    });

    return state;

  } catch (error) {
    console.error('❌ Failed to retrieve localStorage data:', error);
    return null;
  }
}

/**
 * Prepare complete invitation data for backend API
 *
 * @param templateId - Template ID
 * @param userData - User information (email, name, phone)
 * @param planId - Selected plan ID
 * @returns Complete request structure for /api/invitations/create
 */
export function prepareInvitationCreateRequest(
  templateId: number,
  userData: {
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  },
  planId?: number
) {

  // Get customizer data from localStorage
  const localStorageData = getCustomizerDataFromLocalStorage(templateId);

  if (!localStorageData) {
    throw new Error('No customizer data found in localStorage');
  }

  const { customizerData, selectedMode } = localStorageData;

  // Use planId if provided, otherwise derive from selectedMode
  const finalPlanId = planId !== undefined ? planId : getPlanIdFromMode(selectedMode);

  // Group fields by sections
  const sectionsData = groupCustomizerDataBySections(customizerData);

  // Build complete request
  const requestData = {
    user_data: {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName || '',
      phone: userData.phone || ''
    },
    invitation_basic: {
      template_id: templateId,
      plan_id: finalPlanId,
      event_date: customizerData.weddingDate || new Date().toISOString(),
      event_location: customizerData.eventLocation || 'Por definir'
    },
    sections_data: sectionsData
  };

  console.log('📤 Prepared invitation create request:', {
    userEmail: userData.email,
    templateId,
    planId: finalPlanId,
    mode: selectedMode || 'basic',
    sectionsCount: Object.keys(sectionsData).length,
    totalFields: Object.values(sectionsData).reduce(
      (sum, section) => sum + Object.keys(section).length, 0
    )
  });

  return requestData;
}

/**
 * Prepare invitation data using authenticated user data
 * Automatically gets user data from localStorage
 *
 * @param templateId - Template ID
 * @param planId - Selected plan ID (optional, will use selectedMode if not provided)
 * @returns Complete request structure for /api/invitations/create
 */
export function prepareInvitationCreateRequestFromAuth(
  templateId: number,
  planId?: number
) {

  // Get user data from localStorage (saved by auth system)
  const userDataString = localStorage.getItem('user_data');

  if (!userDataString) {
    throw new Error('No authenticated user data found. Please login first.');
  }

  const userData = JSON.parse(userDataString);

  // Use the existing function with user data
  return prepareInvitationCreateRequest(
    templateId,
    {
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      phone: userData.phone
    },
    planId
  );
}

/**
 * Debug helper: Log current localStorage structure
 *
 * @param templateId - Template ID to inspect
 */
export function debugLocalStorageStructure(templateId: number | string) {
  const data = getCustomizerDataFromLocalStorage(templateId);

  if (!data) {
    console.log('❌ No data found for template', templateId);
    return;
  }

  const { customizerData } = data;
  const sections = groupCustomizerDataBySections(customizerData);

  console.group('🔍 localStorage Structure Analysis');
  console.log('📊 Original flat structure:', customizerData);
  console.log('📦 Grouped by sections:', sections);

  console.group('📈 Statistics');
  console.log('Total fields:', Object.keys(customizerData).length);
  console.log('Sections created:', Object.keys(sections).length);

  Object.entries(sections).forEach(([sectionName, fields]) => {
    console.log(`  ${sectionName}: ${Object.keys(fields).length} fields`);
  });
  console.groupEnd();

  console.groupEnd();
}