/**
 * Invitation Editor API Client
 * 
 * WHY: Centralized API functions for invitation editor operations.
 * Provides typed interfaces for all backend endpoints created in Issue #47,
 * including data management, media uploads, events, and publishing.
 * 
 * WHAT: Complete API client for invitation editor with proper error handling,
 * request/response typing, and integration with the main API client.
 */

import { apiClient, ApiResponse } from './api';
import {
  InvitationData,
  InvitationEvent,
  InvitationMedia,
  SaveInvitationDataRequest,
  UpdateFieldRequest,
  CreateEventRequest,
  UploadFileRequest,
  InvitationDataResponse,
  InvitationEventsResponse,
  InvitationMediaResponse,
  UploadFileResponse,
  PreviewDataResponse,
  PublishResponse
} from '../types/invitation';

// ================================
// DATA MANAGEMENT API
// ================================

/**
 * Save multiple invitation fields in bulk
 * POST /api/invitations/{id}/data
 */
export const saveInvitationData = async (
  invitationId: number, 
  data: SaveInvitationDataRequest
): Promise<InvitationDataResponse> => {
  const response = await apiClient.post(`/invitations/${invitationId}/data`, data);
  return response.data;
};

/**
 * Get all invitation data
 * GET /api/invitations/{id}/data
 */
export const getInvitationData = async (invitationId: number): Promise<InvitationDataResponse> => {
  const response = await apiClient.get(`/invitations/${invitationId}/data`);
  return response.data;
};

/**
 * Update single field
 * PUT /api/invitations/{id}/data/{field}
 */
export const updateInvitationField = async (
  invitationId: number,
  field: string,
  data: UpdateFieldRequest
): Promise<ApiResponse> => {
  const response = await apiClient.put(`/invitations/${invitationId}/data/${field}`, data);
  return response.data;
};

/**
 * Delete single field
 * DELETE /api/invitations/{id}/data/{field}
 */
export const deleteInvitationField = async (
  invitationId: number,
  field: string
): Promise<ApiResponse> => {
  const response = await apiClient.delete(`/invitations/${invitationId}/data/${field}`);
  return response.data;
};

// ================================
// MEDIA MANAGEMENT API
// ================================

/**
 * Upload files to invitation
 * POST /api/invitations/{id}/media
 */
export const uploadInvitationFiles = async (
  invitationId: number,
  files: File[],
  mediaType: InvitationMedia['media_type'],
  onProgress?: (progress: number) => void
): Promise<UploadFileResponse> => {
  const formData = new FormData();
  
  // Append files
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });
  
  // Append metadata
  formData.append('media_type', mediaType);
  
  const response = await apiClient.post(`/invitations/${invitationId}/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  
  return response.data;
};

/**
 * Upload single file
 * POST /api/invitations/{id}/media (single file)
 */
export const uploadInvitationFile = async (
  invitationId: number,
  file: File,
  mediaType: InvitationMedia['media_type'],
  onProgress?: (progress: number) => void
): Promise<UploadFileResponse> => {
  return uploadInvitationFiles(invitationId, [file], mediaType, onProgress);
};

/**
 * Get all media for invitation
 * GET /api/invitations/{id}/media
 */
export const getInvitationMedia = async (invitationId: number): Promise<InvitationMediaResponse> => {
  const response = await apiClient.get(`/invitations/${invitationId}/media`);
  return response.data;
};

/**
 * Delete media file
 * DELETE /api/invitations/{id}/media/{mediaId}
 */
export const deleteInvitationMedia = async (
  invitationId: number,
  mediaId: number
): Promise<ApiResponse> => {
  const response = await apiClient.delete(`/invitations/${invitationId}/media/${mediaId}`);
  return response.data;
};

/**
 * Reorder gallery images
 * PUT /api/invitations/{id}/media/reorder
 */
export const reorderInvitationMedia = async (
  invitationId: number,
  mediaIds: number[]
): Promise<ApiResponse> => {
  const response = await apiClient.put(`/invitations/${invitationId}/media/reorder`, {
    media_ids: mediaIds
  });
  return response.data;
};

// ================================
// EVENTS MANAGEMENT API
// ================================

/**
 * Create new event
 * POST /api/invitations/{id}/events
 */
export const createInvitationEvent = async (
  invitationId: number,
  eventData: CreateEventRequest
): Promise<{ success: boolean; event: InvitationEvent }> => {
  const response = await apiClient.post(`/invitations/${invitationId}/events`, eventData);
  return response.data;
};

/**
 * Get all events for invitation
 * GET /api/invitations/{id}/events
 */
export const getInvitationEvents = async (invitationId: number): Promise<InvitationEventsResponse> => {
  const response = await apiClient.get(`/invitations/${invitationId}/events`);
  return response.data;
};

/**
 * Update event
 * PUT /api/invitations/{id}/events/{eventId}
 */
export const updateInvitationEvent = async (
  invitationId: number,
  eventId: number,
  eventData: Partial<CreateEventRequest>
): Promise<{ success: boolean; event: InvitationEvent }> => {
  const response = await apiClient.put(`/invitations/${invitationId}/events/${eventId}`, eventData);
  return response.data;
};

/**
 * Delete event
 * DELETE /api/invitations/{id}/events/{eventId}
 */
export const deleteInvitationEvent = async (
  invitationId: number,
  eventId: number
): Promise<ApiResponse> => {
  const response = await apiClient.delete(`/invitations/${invitationId}/events/${eventId}`);
  return response.data;
};

/**
 * Reorder events
 * PUT /api/invitations/{id}/events/reorder
 */
export const reorderInvitationEvents = async (
  invitationId: number,
  eventIds: number[]
): Promise<ApiResponse> => {
  const response = await apiClient.put(`/invitations/${invitationId}/events/reorder`, {
    event_ids: eventIds
  });
  return response.data;
};

// ================================
// PREVIEW & PUBLISHING API
// ================================

/**
 * Get preview data for invitation
 * GET /api/invitations/{id}/preview
 */
export const getInvitationPreview = async (invitationId: number): Promise<PreviewDataResponse> => {
  const response = await apiClient.get(`/invitations/${invitationId}/preview`);
  return response.data;
};

/**
 * Publish invitation
 * POST /api/invitations/{id}/publish
 */
export const publishInvitation = async (invitationId: number): Promise<PublishResponse> => {
  const response = await apiClient.post(`/invitations/${invitationId}/publish`);
  return response.data;
};

/**
 * Unpublish invitation
 * POST /api/invitations/{id}/unpublish
 */
export const unpublishInvitation = async (invitationId: number): Promise<ApiResponse> => {
  const response = await apiClient.post(`/invitations/${invitationId}/unpublish`);
  return response.data;
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Formatos aceptados: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Archivo muy grande. Tamaño máximo: ${maxSizeMB}MB`
    };
  }
  
  return { valid: true };
};

/**
 * Generate unique file ID for tracking uploads
 */
export const generateFileId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert file to base64 for preview
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extract filename from URL
 */
export const getFilenameFromUrl = (url: string): string => {
  return url.split('/').pop()?.split('?')[0] || 'file';
};

/**
 * Check if URL is a valid image
 */
export const isImageUrl = (url: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  return imageExtensions.test(url);
};

/**
 * Generate thumbnail URL from full image URL
 */
export const getThumbnailUrl = (imageUrl: string, width: number = 200): string => {
  // If using cloud storage with thumbnail generation
  if (imageUrl.includes('kossomet.com/invita')) {
    const baseUrl = imageUrl.split('?')[0];
    return `${baseUrl}?w=${width}&q=80`;
  }
  
  // Otherwise return original URL
  return imageUrl;
};

// ================================
// BATCH OPERATIONS
// ================================

/**
 * Save complete invitation data (all sections)
 */
export const saveCompleteInvitationData = async (
  invitationId: number,
  data: InvitationData,
  events: InvitationEvent[]
): Promise<{
  dataResult: InvitationDataResponse;
  eventsResults: Array<{ success: boolean; event?: InvitationEvent; error?: string }>;
}> => {
  // Save invitation data
  const dataResult = await saveInvitationData(invitationId, { fields: data });
  
  // Save events
  const eventsResults = await Promise.allSettled(
    events.map(event => {
      if (event.id) {
        return updateInvitationEvent(invitationId, event.id, event);
      } else {
        return createInvitationEvent(invitationId, event);
      }
    })
  );
  
  const eventsResultsFormatted = eventsResults.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, event: result.value.event };
    } else {
      return { success: false, error: result.reason.message || 'Error desconocido' };
    }
  });
  
  return { dataResult, eventsResults: eventsResultsFormatted };
};

/**
 * Load complete invitation data (data + events + media)
 */
export const loadCompleteInvitationData = async (invitationId: number): Promise<{
  data: InvitationData;
  events: InvitationEvent[];
  media: InvitationMedia[];
}> => {
  const [dataResult, eventsResult, mediaResult] = await Promise.all([
    getInvitationData(invitationId),
    getInvitationEvents(invitationId),
    getInvitationMedia(invitationId)
  ]);
  
  return {
    data: dataResult.data,
    events: eventsResult.events,
    media: mediaResult.media
  };
};

// ================================
// ERROR HANDLING UTILITIES
// ================================

/**
 * Handle API errors with user-friendly messages
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstError = Object.values(errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError as string;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Error desconocido. Por favor, inténtalo de nuevo.';
};

/**
 * Retry operation with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before next retry (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};