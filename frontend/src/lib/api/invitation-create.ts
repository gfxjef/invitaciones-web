/**
 * Invitation Creation API Integration
 *
 * WHY: Provides a complete integration layer between the frontend customizer
 * and the backend /api/invitations/create endpoint, handling data transformation
 * and submission for anonymous users.
 *
 * WHAT: Functions to create invitations from localStorage customizer data
 * with proper error handling and response management.
 */

import { apiClient } from '../api';
import {
  prepareInvitationCreateRequest,
  prepareInvitationCreateRequestFromAuth,
  getCustomizerDataFromLocalStorage,
  groupCustomizerDataBySections
} from '../utils/localStorage-to-sections';

/**
 * Response types for invitation creation
 */
export interface CreateInvitationResponse {
  message: string;
  invitation: {
    id: number;
    title: string;
    status: string;
    url: string;
    access_code: string;
    groom_name: string;
    bride_name: string;
    wedding_date: string;
    wedding_location: string;
    template_name: string;
    created_at: string;
  };
  user: {
    id: number;
    email: string;
    full_name: string;
  };
  order: {
    id: number;
    order_number: string;
    total: number;
    status: string;
    plan_name: string;
  };
  sections: {
    total_created: number;
    section_types: string[];
  };
}

export interface CreateInvitationError {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Create invitation from localStorage customizer data
 *
 * @param templateId - Template ID being used
 * @param userData - User information for registration
 * @param planId - Selected plan (default: 1 for basic)
 * @returns Created invitation data or throws error
 */
export async function createInvitationFromCustomizer(
  templateId: number,
  userData: {
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  },
  planId: number = 1
): Promise<CreateInvitationResponse> {

  console.group('🚀 Creating invitation from customizer');

  try {
    // Prepare the complete request from localStorage
    const requestData = prepareInvitationCreateRequest(
      templateId,
      userData,
      planId
    );

    console.log('📤 Sending request to backend:', {
      endpoint: '/api/invitations/create',
      userEmail: userData.email,
      sectionsCount: Object.keys(requestData.sections_data).length
    });

    // Send to backend
    const response = await apiClient.post<CreateInvitationResponse>(
      '/invitations/create',
      requestData
    );

    console.log('✅ Invitation created successfully:', {
      invitationId: response.data.invitation.id,
      invitationUrl: response.data.invitation.url,
      orderId: response.data.order.id
    });

    console.groupEnd();
    return response.data;

  } catch (error: any) {
    console.error('❌ Failed to create invitation:', error);
    console.groupEnd();

    // Handle specific error cases
    if (error.response?.status === 409) {
      throw new Error('El email ya está registrado. Por favor usa otro email o inicia sesión.');
    }

    if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Datos inválidos';
      throw new Error(message);
    }

    throw new Error(
      error.response?.data?.message ||
      'Error al crear la invitación. Por favor intenta nuevamente.'
    );
  }
}

/**
 * Create invitation from authenticated user data (simplified)
 * Automatically gets user data from auth store/localStorage
 *
 * @param templateId - Template ID being used
 * @param planId - Selected plan (default: 1 for basic)
 * @returns Created invitation data or throws error
 */
export async function createInvitationFromAuth(
  templateId: number,
  planId: number = 1
): Promise<CreateInvitationResponse> {

  console.group('🚀 Creating invitation from authenticated user');

  try {
    // Prepare the complete request using auth data
    const requestData = prepareInvitationCreateRequestFromAuth(templateId, planId);

    console.log('📤 Sending request to backend:', {
      endpoint: '/api/invitations/create',
      templateId,
      planId,
      sectionsCount: Object.keys(requestData.sections_data).length
    });

    // Send to backend
    const response = await apiClient.post<CreateInvitationResponse>(
      '/invitations/create',
      requestData
    );

    console.log('✅ Invitation created successfully:', {
      invitationId: response.data.invitation.id,
      invitationUrl: response.data.invitation.url,
      orderId: response.data.order.id
    });

    console.groupEnd();
    return response.data;

  } catch (error: any) {
    console.error('❌ Failed to create invitation:', error);
    console.groupEnd();

    // Handle specific error cases
    if (error.response?.status === 409) {
      throw new Error('El email ya está registrado. Por favor usa otro email o inicia sesión.');
    }

    if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Datos inválidos';
      throw new Error(message);
    }

    throw new Error(
      error.response?.data?.message ||
      'Error al crear la invitación. Por favor intenta nuevamente.'
    );
  }
}

/**
 * Create invitation with manual sections data (without localStorage)
 *
 * @param userData - User information
 * @param invitationBasic - Basic invitation data
 * @param sectionsData - Pre-grouped sections data
 * @returns Created invitation data
 */
export async function createInvitationDirect(
  userData: {
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  },
  invitationBasic: {
    templateId: number;
    planId: number;
    eventDate?: string;
    eventLocation?: string;
  },
  sectionsData: Record<string, Record<string, any>>
): Promise<CreateInvitationResponse> {

  const requestData = {
    user_data: {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName || '',
      phone: userData.phone || ''
    },
    invitation_basic: {
      template_id: invitationBasic.templateId,
      plan_id: invitationBasic.planId,
      event_date: invitationBasic.eventDate || new Date().toISOString(),
      event_location: invitationBasic.eventLocation || 'Por definir'
    },
    sections_data: sectionsData
  };

  try {
    const response = await apiClient.post<CreateInvitationResponse>(
      '/invitations/create',
      requestData
    );

    return response.data;

  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Error al crear la invitación'
    );
  }
}

/**
 * Validate localStorage data before sending
 *
 * @param templateId - Template ID to validate
 * @returns Validation result with any errors found
 */
export function validateCustomizerData(templateId: number): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {

  const errors: string[] = [];
  const warnings: string[] = [];

  // Get data from localStorage
  const localStorageData = getCustomizerDataFromLocalStorage(templateId);

  if (!localStorageData) {
    errors.push('No se encontraron datos de personalización');
    return { isValid: false, errors, warnings };
  }

  const { customizerData, touchedFields } = localStorageData;

  // Check for required fields
  if (!customizerData.groom_name && !customizerData.bride_name) {
    warnings.push('No se han definido los nombres de los novios');
  }

  if (!customizerData.weddingDate) {
    warnings.push('No se ha definido la fecha del evento');
  }

  if (!customizerData.eventLocation) {
    warnings.push('No se ha definido la ubicación del evento');
  }

  // Check if any fields were modified
  if (Object.keys(touchedFields).length === 0) {
    warnings.push('No se ha personalizado ningún campo');
  }

  // Group by sections to check structure
  const sections = groupCustomizerDataBySections(customizerData);

  if (Object.keys(sections).length === 0) {
    errors.push('No se pudieron agrupar los campos en secciones');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * React Hook for invitation creation
 * Provides loading state and error handling
 */
export function useCreateInvitation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvitation = useCallback(async (
    templateId: number,
    userData: {
      email: string;
      firstName: string;
      lastName?: string;
      phone?: string;
    },
    planId: number = 1
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createInvitationFromCustomizer(
        templateId,
        userData,
        planId
      );

      setLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la invitación';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    createInvitation,
    loading,
    error,
    reset
  };
}

// Import React hooks for the custom hook
import { useState, useCallback } from 'react';

/**
 * Example usage in a component
 *
 * ```tsx
 * function SaveInvitationButton() {
 *   const { createInvitation, loading, error } = useCreateInvitation();
 *
 *   const handleSave = async () => {
 *     try {
 *       const result = await createInvitation(
 *         templateId,
 *         {
 *           email: 'user@example.com',
 *           firstName: 'Juan',
 *           lastName: 'Pérez',
 *           phone: '+51999999999'
 *         },
 *         1 // Plan básico
 *       );
 *
 *       // Redirect to invitation URL
 *       window.location.href = result.invitation.url;
 *
 *     } catch (error) {
 *       console.error('Failed to save:', error);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleSave} disabled={loading}>
 *       {loading ? 'Guardando...' : 'Guardar Invitación'}
 *     </button>
 *   );
 * }
 * ```
 */