/**
 * useInvitationEditor Hook
 * 
 * WHY: Main state management hook for the invitation editor. Provides
 * centralized state for invitation data, events, and media with validation,
 * optimistic updates, and integration with backend APIs.
 * 
 * WHAT: Complete hook for managing invitation editor state including
 * data persistence, validation, file uploads, and publishing workflow.
 * 
 * HOW: Uses React state for immediate UI feedback, batches API calls
 * for performance, and provides comprehensive validation with error handling.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from './use-debounce';
import {
  InvitationData,
  InvitationEvent,
  InvitationMedia,
  UseInvitationEditorReturn,
  EditorValidationErrors,
  EDITOR_SECTIONS,
  ValidationRules,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_AUDIO_TYPES,
  FILE_SIZE_LIMITS,
  MAX_GALLERY_IMAGES
} from '../../types/invitation';
import {
  saveInvitationData,
  getInvitationData,
  createInvitationEvent,
  updateInvitationEvent,
  deleteInvitationEvent,
  getInvitationEvents,
  uploadInvitationFile,
  deleteInvitationMedia,
  getInvitationMedia,
  getInvitationPreview,
  publishInvitation as publishInvitationApi,
  unpublishInvitation as unpublishInvitationApi,
  loadCompleteInvitationData,
  validateFile,
  handleApiError
} from '../invitation-api';

// ================================
// VALIDATION RULES
// ================================

const VALIDATION_RULES: ValidationRules = {
  couple: {
    couple_groom_name: { required: true, minLength: 2, maxLength: 100 },
    couple_bride_name: { required: true, minLength: 2, maxLength: 100 },
    couple_welcome_message: { maxLength: 500 },
    couple_quote: { maxLength: 200 }
  },
  event: {
    event_date: { 
      required: true,
      custom: (value) => {
        if (!value) return 'Fecha requerida';
        const eventDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) return 'La fecha debe ser futura';
        return null;
      }
    },
    event_time: { required: true },
    event_venue_name: { required: true, minLength: 2, maxLength: 200 }
  },
  gallery: {
    gallery_hero_image: { required: true }
  },
  contact: {
    contact_email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email inválido';
        }
        return null;
      }
    },
    contact_groom_phone: {
      pattern: /^\+?[\d\s\-\(\)]{8,20}$/,
      custom: (value) => {
        if (value && !/^\+?[\d\s\-\(\)]{8,20}$/.test(value)) {
          return 'Teléfono inválido';
        }
        return null;
      }
    },
    contact_bride_phone: {
      pattern: /^\+?[\d\s\-\(\)]{8,20}$/,
      custom: (value) => {
        if (value && !/^\+?[\d\s\-\(\)]{8,20}$/.test(value)) {
          return 'Teléfono inválido';
        }
        return null;
      }
    }
  },
  rsvp: {
    rsvp_deadline: {
      custom: (value) => {
        if (!value) return null;
        const deadline = new Date(value);
        const today = new Date();
        if (deadline < today) return 'La fecha límite debe ser futura';
        return null;
      }
    },
    rsvp_max_companions: {
      custom: (value) => {
        if (value !== undefined && (value < 0 || value > 10)) {
          return 'Debe ser entre 0 y 10';
        }
        return null;
      }
    }
  },
  extra: {
    extra_hashtag: {
      pattern: /^#[A-Za-z0-9]+$/,
      custom: (value) => {
        if (value && !/^#[A-Za-z0-9]+$/.test(value)) {
          return 'Hashtag inválido (debe empezar con # y sin espacios)';
        }
        return null;
      }
    },
    extra_age_restriction: {
      custom: (value) => {
        if (value !== undefined && (value < 0 || value > 21)) {
          return 'Debe ser entre 0 y 21 años';
        }
        return null;
      }
    }
  }
};

// ================================
// MAIN HOOK
// ================================

export const useInvitationEditor = (initialInvitationId?: number): UseInvitationEditorReturn => {
  // ================
  // STATE
  // ================
  
  const [invitationId, setInvitationId] = useState<number | null>(initialInvitationId || null);
  const [data, setData] = useState<InvitationData>({});
  const [events, setEvents] = useState<InvitationEvent[]>([]);
  const [media, setMedia] = useState<InvitationMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<EditorValidationErrors>({});
  const [initialData, setInitialData] = useState<InvitationData>({});

  // Debounced data for auto-save
  const debouncedData = useDebounce(data, 1000);

  // ================
  // VALIDATION
  // ================
  
  const validateField = useCallback((category: string, field: string, value: any): string | null => {
    const rules = VALIDATION_RULES[category]?.[field];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Este campo es requerido';
    }

    // Skip other validations if value is empty
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, []);

  const validateSection = useCallback((section: string): boolean => {
    const sectionConfig = EDITOR_SECTIONS.find(s => s.id === section);
    if (!sectionConfig) return true;

    let hasErrors = false;
    const newErrors = { ...errors };

    sectionConfig.fields.forEach(field => {
      const value = data[field as keyof InvitationData];
      const error = validateField(section, field, value);
      
      if (error) {
        hasErrors = true;
        if (!newErrors[section]) newErrors[section] = {};
        newErrors[section][field] = error;
      } else {
        if (newErrors[section]?.[field]) {
          delete newErrors[section][field];
          if (Object.keys(newErrors[section]).length === 0) {
            delete newErrors[section];
          }
        }
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, []); // Remove circular dependencies

  const isFormValid = useCallback((): boolean => {
    const requiredSections = EDITOR_SECTIONS.filter(s => s.required);
    return requiredSections.every(section => validateSection(section.id));
  }, []); // Remove validateSection dependency

  const getFieldErrors = useCallback((category: string, field: string): string | null => {
    return errors[category]?.[field] || null;
  }, [errors]);

  // ================
  // DATA MANAGEMENT
  // ================

  const updateField = useCallback((category: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);

    // Validate field immediately
    const error = validateField(category, field, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        if (!newErrors[category]) newErrors[category] = {};
        newErrors[category][field] = error;
      } else {
        if (newErrors[category]?.[field]) {
          delete newErrors[category][field];
          if (Object.keys(newErrors[category]).length === 0) {
            delete newErrors[category];
          }
        }
      }
      return newErrors;
    });
  }, []); // Remove validateField dependency

  const updateData = useCallback((updates: Partial<InvitationData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);

    // Validate updated fields
    Object.entries(updates).forEach(([field, value]) => {
      // Find which category this field belongs to
      const category = Object.keys(VALIDATION_RULES).find(cat =>
        VALIDATION_RULES[cat].hasOwnProperty(field)
      );
      
      if (category) {
        const error = validateField(category, field, value);
        setErrors(prev => {
          const newErrors = { ...prev };
          if (error) {
            if (!newErrors[category]) newErrors[category] = {};
            newErrors[category][field] = error;
          } else {
            if (newErrors[category]?.[field]) {
              delete newErrors[category][field];
              if (Object.keys(newErrors[category]).length === 0) {
                delete newErrors[category];
              }
            }
          }
          return newErrors;
        });
      }
    });
  }, []); // Remove validateField dependency

  const saveData = useCallback(async (): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      await saveInvitationData(invitationId, { fields: data });
      setInitialData({ ...data });
      setIsDirty(false);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId, data]);

  const loadData = useCallback(async (newInvitationId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setInvitationId(newInvitationId);
      
      const result = await loadCompleteInvitationData(newInvitationId);
      
      setData(result.data);
      setEvents(result.events);
      setMedia(result.media);
      setInitialData({ ...result.data });
      setIsDirty(false);
      setErrors({});
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setData({ ...initialData });
    setIsDirty(false);
    setErrors({});
  }, [initialData]);

  // ================
  // EVENTS MANAGEMENT
  // ================

  const addEvent = useCallback(async (eventData: Omit<InvitationEvent, 'id' | 'invitation_id' | 'created_at'>): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      const result = await createInvitationEvent(invitationId, eventData);
      setEvents(prev => [...prev, result.event]);
      setIsDirty(true);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  const updateEvent = useCallback(async (eventId: number, updates: Partial<InvitationEvent>): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      const result = await updateInvitationEvent(invitationId, eventId, updates);
      setEvents(prev => prev.map(event => event.id === eventId ? result.event : event));
      setIsDirty(true);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  const deleteEvent = useCallback(async (eventId: number): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      await deleteInvitationEvent(invitationId, eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setIsDirty(true);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  const reorderEvents = useCallback(async (eventIds: number[]): Promise<void> => {
    // Optimistic update
    const reorderedEvents = eventIds.map(id => events.find(event => event.id === id)!).filter(Boolean);
    setEvents(reorderedEvents);
    setIsDirty(true);

    // Note: Backend reordering would be implemented if needed
    // For now, we just update local state
  }, [events]);

  // ================
  // MEDIA MANAGEMENT
  // ================

  const uploadFile = useCallback(async (file: File, mediaType: InvitationMedia['media_type']): Promise<string> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    // Validate file
    const allowedTypes = mediaType === 'gallery' || mediaType === 'hero' || mediaType === 'couple' || mediaType === 'og_image' 
      ? [...SUPPORTED_IMAGE_TYPES] 
      : [...SUPPORTED_AUDIO_TYPES];
    
    const maxSize = FILE_SIZE_LIMITS.image; // For now, all files use image limit
    
    const validation = validateFile(file, allowedTypes, maxSize);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      setIsLoading(true);
      const result = await uploadInvitationFile(invitationId, file, mediaType);
      setMedia(prev => [...prev, result.media]);
      setIsDirty(true);
      return result.media.file_path;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  const uploadFiles = useCallback(async (files: File[], mediaType: InvitationMedia['media_type']): Promise<string[]> => {
    const results = await Promise.all(
      files.map(file => uploadFile(file, mediaType))
    );
    return results;
  }, [uploadFile]);

  const deleteMedia = useCallback(async (mediaId: number): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      await deleteInvitationMedia(invitationId, mediaId);
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      setIsDirty(true);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  // ================
  // PREVIEW & PUBLISHING
  // ================

  const generatePreview = useCallback(async (): Promise<string> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      const result = await getInvitationPreview(invitationId);
      return result.preview_data.preview_url;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  const publishInvitation = useCallback(async (): Promise<string> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    if (!isFormValid()) {
      throw new Error('Faltan campos requeridos. Por favor completa la información mínima.');
    }

    try {
      setIsLoading(true);
      // Save data first
      await saveData();
      
      // Then publish
      const result = await publishInvitationApi(invitationId);
      return result.published_url;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId, isFormValid, saveData]);

  const unpublishInvitation = useCallback(async (): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      await unpublishInvitationApi(invitationId);
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  // ================
  // UTILITY FUNCTIONS
  // ================

  const getSectionCompleteness = useCallback((section: string): number => {
    const sectionConfig = EDITOR_SECTIONS.find(s => s.id === section);
    if (!sectionConfig || !sectionConfig.fields.length) return 100;

    const completedFields = sectionConfig.fields.filter(field => {
      const value = data[field as keyof InvitationData];
      return value !== undefined && value !== null && value !== '';
    }).length;

    return Math.round((completedFields / sectionConfig.fields.length) * 100);
  }, []); // Remove data dependency to prevent loops

  const getOverallCompleteness = useCallback((): number => {
    const requiredSections = EDITOR_SECTIONS.filter(s => s.required);
    const totalCompleteness = requiredSections.reduce((sum, section) => {
      return sum + getSectionCompleteness(section.id);
    }, 0);

    return Math.round(totalCompleteness / requiredSections.length);
  }, []); // Remove getSectionCompleteness dependency

  // ================
  // EFFECTS
  // ================

  // Load initial data if invitation ID is provided
  useEffect(() => {
    if (initialInvitationId && initialInvitationId !== invitationId) {
      loadData(initialInvitationId).catch(console.error);
    }
  }, [initialInvitationId, invitationId]); // loadData excluded to prevent loop

  // ================
  // RETURN
  // ================

  return {
    // State
    data,
    events,
    media,
    isLoading,
    isDirty,
    errors,

    // Actions - Data Management
    updateField,
    updateData,
    saveData,
    loadData,
    resetForm,

    // Actions - Events
    addEvent,
    updateEvent,
    deleteEvent,
    reorderEvents,

    // Actions - Media
    uploadFile,
    uploadFiles,
    deleteMedia,

    // Validation
    validateField,
    validateSection,
    isFormValid,
    getFieldErrors,

    // Preview & Publishing
    generatePreview,
    publishInvitation,
    unpublishInvitation,

    // Utility
    getSectionCompleteness,
    getOverallCompleteness
  };
};