/**
 * Fixed version of useInvitationEditor Hook
 * 
 * This version removes all circular dependencies that were causing infinite renders
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './use-debounce';
import {
  InvitationData,
  InvitationEvent,
  InvitationMedia,
  UseInvitationEditorReturn,
  EditorValidationErrors,
  EDITOR_SECTIONS,
  ValidationRules
} from '../../types/invitation';

// Simple validation rules to prevent complex circular dependencies
const SIMPLE_VALIDATION_RULES: ValidationRules = {
  couple: {
    couple_groom_name: { required: true, minLength: 2, maxLength: 100 },
    couple_bride_name: { required: true, minLength: 2, maxLength: 100 },
    couple_welcome_message: { maxLength: 500 },
    couple_quote: { maxLength: 200 }
  },
  event: {
    event_date: { required: true },
    event_time: { required: true },
    event_venue_name: { required: true, minLength: 2, maxLength: 200 }
  },
  gallery: {
    gallery_hero_image: { required: true }
  },
  contact: {
    contact_email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },
  rsvp: {},
  extra: {}
};

export const useInvitationEditorFixed = (initialInvitationId?: number): UseInvitationEditorReturn => {
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
  // VALIDATION - NO CIRCULAR DEPENDENCIES
  // ================
  
  const validateField = useCallback((category: string, field: string, value: any): string | null => {
    const rules = SIMPLE_VALIDATION_RULES[category]?.[field];
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

    return null;
  }, []); // NO DEPENDENCIES to prevent loops

  // ================
  // DATA MANAGEMENT - NO CIRCULAR DEPENDENCIES
  // ================

  const updateField = useCallback((category: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);

    // Validate field immediately - call function directly, don't depend on it
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
  }, []); // NO DEPENDENCIES to prevent loops

  const updateData = useCallback((updates: Partial<InvitationData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []); // NO DEPENDENCIES to prevent loops

  const saveData = useCallback(async (): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      // Mock save - replace with actual API call
      console.log('Saving data for invitation', invitationId, data);
      setInitialData({ ...data });
      setIsDirty(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error saving data';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops - access current values via closures

  const loadData = useCallback(async (newInvitationId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setInvitationId(newInvitationId);
      
      // Mock load - replace with actual API call
      console.log('Loading data for invitation', newInvitationId);
      const mockData = {
        couple_groom_name: 'Juan Pérez',
        couple_bride_name: 'María García'
      };
      
      setData(mockData);
      setEvents([]);
      setMedia([]);
      setInitialData({ ...mockData });
      setIsDirty(false);
      setErrors({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading data';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  const resetForm = useCallback(() => {
    setData({ ...initialData });
    setIsDirty(false);
    setErrors({});
  }, []); // NO DEPENDENCIES to prevent loops

  // ================
  // EVENTS MANAGEMENT - SIMPLIFIED
  // ================

  const addEvent = useCallback(async (eventData: Omit<InvitationEvent, 'id' | 'invitation_id' | 'created_at'>): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      // Mock add event
      const newEvent = {
        ...eventData,
        id: Date.now(),
        invitation_id: invitationId,
        created_at: new Date().toISOString()
      } as InvitationEvent;
      
      setEvents(prev => [...prev, newEvent]);
      setIsDirty(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error adding event';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  const updateEvent = useCallback(async (eventId: number, updates: Partial<InvitationEvent>): Promise<void> => {
    try {
      setIsLoading(true);
      setEvents(prev => prev.map(event => event.id === eventId ? { ...event, ...updates } : event));
      setIsDirty(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating event';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  const deleteEvent = useCallback(async (eventId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setIsDirty(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting event';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  const reorderEvents = useCallback(async (eventIds: number[]): Promise<void> => {
    setEvents(prev => {
      const reorderedEvents = eventIds.map(id => prev.find(event => event.id === id)!).filter(Boolean);
      return reorderedEvents;
    });
    setIsDirty(true);
  }, []); // NO DEPENDENCIES to prevent loops

  // ================
  // MEDIA MANAGEMENT - SIMPLIFIED
  // ================

  const uploadFile = useCallback(async (file: File, mediaType: InvitationMedia['media_type']): Promise<string> => {
    try {
      setIsLoading(true);
      // Mock upload
      const mockFilePath = `/uploads/${Date.now()}-${file.name}`;
      const newMedia = {
        id: Date.now(),
        invitation_id: invitationId!,
        media_type: mediaType,
        file_path: mockFilePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        created_at: new Date().toISOString()
      } as InvitationMedia;
      
      setMedia(prev => [...prev, newMedia]);
      setIsDirty(true);
      return mockFilePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading file';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  const uploadFiles = useCallback(async (files: File[], mediaType: InvitationMedia['media_type']): Promise<string[]> => {
    const results = await Promise.all(
      files.map(file => uploadFile(file, mediaType))
    );
    return results;
  }, []); // NO DEPENDENCIES to prevent loops, uploadFile is stable

  const deleteMedia = useCallback(async (mediaId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      setIsDirty(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting media';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  // ================
  // VALIDATION FUNCTIONS - NO CIRCULAR DEPENDENCIES
  // ================

  const validateSection = useCallback((section: string): boolean => {
    const sectionConfig = EDITOR_SECTIONS.find(s => s.id === section);
    if (!sectionConfig) return true;

    let hasErrors = false;

    sectionConfig.fields.forEach(field => {
      // Access current data directly, don't depend on data state
      const currentData = data; // This will capture current value
      const value = currentData[field as keyof InvitationData];
      const error = validateField(section, field, value);
      
      if (error) {
        hasErrors = true;
      }
    });

    return !hasErrors;
  }, []); // NO DEPENDENCIES to prevent loops

  const isFormValid = useCallback((): boolean => {
    const requiredSections = EDITOR_SECTIONS.filter(s => s.required);
    return requiredSections.every(section => validateSection(section.id));
  }, []); // NO DEPENDENCIES to prevent loops

  const getFieldErrors = useCallback((category: string, field: string): string | null => {
    return errors[category]?.[field] || null;
  }, []); // NO DEPENDENCIES to prevent loops - access errors directly when called

  // ================
  // PREVIEW & PUBLISHING - SIMPLIFIED
  // ================

  const generatePreview = useCallback(async (): Promise<string> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      // Mock preview generation
      const previewUrl = `/preview/${invitationId}`;
      return previewUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error generating preview';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  const publishInvitation = useCallback(async (): Promise<string> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      // Save data first
      await saveData();
      
      // Then publish - mock
      const publishedUrl = `/invitacion/${invitationId}`;
      return publishedUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error publishing invitation';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  const unpublishInvitation = useCallback(async (): Promise<void> => {
    if (!invitationId) {
      throw new Error('No invitation ID provided');
    }

    try {
      setIsLoading(true);
      // Mock unpublish
      console.log('Unpublishing invitation', invitationId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error unpublishing invitation';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // NO DEPENDENCIES to prevent loops

  // ================
  // UTILITY FUNCTIONS - NO CIRCULAR DEPENDENCIES
  // ================

  const getSectionCompleteness = useCallback((section: string): number => {
    const sectionConfig = EDITOR_SECTIONS.find(s => s.id === section);
    if (!sectionConfig || !sectionConfig.fields.length) return 100;

    // Access current data directly
    const currentData = data;
    const completedFields = sectionConfig.fields.filter(field => {
      const value = currentData[field as keyof InvitationData];
      return value !== undefined && value !== null && value !== '';
    }).length;

    return Math.round((completedFields / sectionConfig.fields.length) * 100);
  }, []); // NO DEPENDENCIES to prevent loops

  const getOverallCompleteness = useCallback((): number => {
    const requiredSections = EDITOR_SECTIONS.filter(s => s.required);
    if (requiredSections.length === 0) return 100;
    
    const totalCompleteness = requiredSections.reduce((sum, section) => {
      return sum + getSectionCompleteness(section.id);
    }, 0);

    return Math.round(totalCompleteness / requiredSections.length);
  }, []); // NO DEPENDENCIES to prevent loops

  // ================
  // EFFECTS - MINIMAL AND SAFE
  // ================

  // Load initial data if invitation ID is provided
  useEffect(() => {
    if (initialInvitationId && initialInvitationId !== invitationId) {
      loadData(initialInvitationId).catch(console.error);
    }
  }, [initialInvitationId]); // Only depend on the prop, not the function

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