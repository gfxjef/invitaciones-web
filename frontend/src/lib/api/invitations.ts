/**
 * Invitation API Functions
 *
 * WHY: Handles invitation-related operations including creating invitations
 * from localStorage data after successful payment.
 */

import { apiClient } from '../api';

interface SectionData {
  [key: string]: any;
}

interface InvitationFromOrderPayload {
  order_id: number;
  template_id: number;
  plan_id: number;
  sections_data: {
    [sectionType: string]: SectionData;
  };
  event_date?: string;
  title?: string;
  groom_name?: string;
  bride_name?: string;
}

interface InvitationResponse {
  success: boolean;
  invitation_id: number;
  invitation_url: string;
}

/**
 * Group flat localStorage customizer data by sections
 *
 * WHY: Transform flat object with prefixed keys into nested structure
 * Example: { hero_title: "X", hero_date: "Y", gallery_images: [...] }
 *       => { hero: { title: "X", date: "Y" }, gallery: { images: [...] } }
 */
export function groupCustomizerDataBySections(flatData: Record<string, any>): Record<string, SectionData> {
  const sectionsData: Record<string, SectionData> = {};

  // Define known section types based on template structure
  // INCLUDES: Template 9 sections (familiares, place_religioso, place_ceremonia, vestimenta, itinerary)
  const sectionTypes = [
    'hero',
    'welcome',
    'couple',
    'countdown',
    'story',
    'video',
    'gallery',
    'footer',
    // Template 9 specific sections
    'familiares',
    'place_religioso',
    'place_ceremonia',
    'vestimenta',
    'itinerary'
  ];

  // Map generic field names to their proper section-prefixed equivalents
  // WHY: Customizer uses generic names (groom_name) but backend expects prefixed names (hero_groom_name)
  const fieldMapping: Record<string, string> = {
    'groom_name': 'hero_groom_name',
    'bride_name': 'hero_bride_name',
    'eventLocation': 'hero_location',
    'weddingDate': 'hero_date',
    'heroImageUrl': 'hero_image',
  };

  // Initialize empty objects for each section
  sectionTypes.forEach(section => {
    sectionsData[section] = {};
  });

  // Group variables by section prefix
  Object.entries(flatData).forEach(([key, value]) => {
    // Skip null, undefined, or empty values
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Apply field mapping if generic name exists
    let processedKey = key;
    if (fieldMapping[key]) {
      processedKey = fieldMapping[key];
      console.log(`🔄 Mapped generic field: ${key} → ${processedKey}`);
    }

    // Find which section this key belongs to
    const matchedSection = sectionTypes.find(section => processedKey.startsWith(`${section}_`));

    if (matchedSection) {
      // Remove section prefix to get variable name
      // Example: "hero_title" => "title"
      const variableName = processedKey.substring(matchedSection.length + 1);
      sectionsData[matchedSection][variableName] = value;
    } else {
      // Handle keys without section prefix (store in 'general' section)
      if (!sectionsData.general) {
        sectionsData.general = {};
      }
      sectionsData.general[processedKey] = value;
    }
  });

  // Remove sections with no data
  Object.keys(sectionsData).forEach(section => {
    if (Object.keys(sectionsData[section]).length === 0) {
      delete sectionsData[section];
    }
  });

  return sectionsData;
}

/**
 * Create invitation from order after successful payment
 *
 * WHY: Saves localStorage customizer data to database after payment is complete.
 * Preserves original variable names in InvitationSectionsData.
 *
 * @param orderId - Order ID from successful payment
 * @param templateId - Template ID from localStorage
 * @param customizerData - Flat customizer data from localStorage
 * @param additionalData - Optional metadata (event_date, title, names)
 */
export async function createInvitationFromOrder(
  orderId: number,
  templateId: number,
  customizerData: Record<string, any>,
  additionalData?: {
    event_date?: string;
    title?: string;
    groom_name?: string;
    bride_name?: string;
  }
): Promise<InvitationResponse> {
  console.log('🚀 [API] createInvitationFromOrder called');
  console.log('   orderId:', orderId);
  console.log('   templateId:', templateId);
  console.log('   customizerData keys:', Object.keys(customizerData));

  try {
    // Transform flat data to grouped sections
    const sectionsData = groupCustomizerDataBySections(customizerData);
    console.log('=' .repeat(80));
    console.log('🔍 [API] DEBUGGING SECTIONS DATA TRANSFORMATION');
    console.log('=' .repeat(80));
    console.log('📦 [API] Sections data grouped:', sectionsData);
    console.log('   Sections count:', Object.keys(sectionsData).length);
    console.log('   Section types:', Object.keys(sectionsData));

    // Log each section in detail
    Object.entries(sectionsData).forEach(([sectionType, variables]) => {
      console.log(`\n--- Section: ${sectionType} ---`);
      console.log(`  Variables count: ${Object.keys(variables).length}`);
      console.log(`  Variables:`, variables);
    });

    // Determine plan_id from template data or localStorage
    // Priority: customizerData.template?.plan_id > customizerData.plan_id > 1 (default)
    let planId = 1; // Default to Standard plan

    if (customizerData.template?.plan_id) {
      planId = customizerData.template.plan_id;
    } else if (customizerData.plan_id) {
      planId = customizerData.plan_id;
    }
    console.log('🎫 [API] Plan ID determined:', planId);

    // Build payload
    const payload: InvitationFromOrderPayload = {
      order_id: orderId,
      template_id: templateId,
      plan_id: planId,
      sections_data: sectionsData,
      ...additionalData
    };
    console.log('\n📤 [API] FINAL PAYLOAD TO BACKEND:');
    console.log('  order_id:', payload.order_id);
    console.log('  template_id:', payload.template_id);
    console.log('  plan_id:', payload.plan_id);
    console.log('  sections_data:', payload.sections_data);
    console.log('  sections_data type:', typeof payload.sections_data);
    console.log('  sections_data is object?', typeof payload.sections_data === 'object');
    console.log('  sections_data keys:', Object.keys(payload.sections_data));
    console.log('  Full payload:', JSON.stringify(payload, null, 2));

    // Call backend endpoint
    const response = await apiClient.post<InvitationResponse>(
      '/invitations/create-from-order',
      payload
    );

    console.log('✅ [API] Backend response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Error in createInvitationFromOrder:', error);
    console.error('   Response data:', error.response?.data);
    console.error('   Status code:', error.response?.status);
    throw new Error(
      error.response?.data?.error ||
      'Failed to create invitation from order'
    );
  }
}

/**
 * Extract metadata from customizer data
 *
 * WHY: Helper to extract common fields like names and dates from localStorage
 */
export function extractInvitationMetadata(customizerData: Record<string, any>) {
  return {
    event_date: customizerData.hero_date || customizerData.countdown_date || undefined,
    title: customizerData.hero_title || undefined,
    groom_name: customizerData.hero_groom_name || customizerData.couple_groom_name || undefined,
    bride_name: customizerData.hero_bride_name || customizerData.couple_bride_name || undefined
  };
}