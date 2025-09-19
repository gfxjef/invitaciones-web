/**
 * Simplified version of useInvitationEditor to isolate the infinite loop issue
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './use-debounce';
import { EDITOR_SECTIONS } from '../../types/invitation';

interface SimpleEditorReturn {
  data: Record<string, any>;
  events: any[];
  media: any[];
  isLoading: boolean;
  isDirty: boolean;
  errors: Record<string, any>;
  saveData: () => Promise<void>;
  loadData: (id: number) => Promise<void>;
  getSectionCompleteness: (section: string) => number;
  getOverallCompleteness: () => number;
  isFormValid: () => boolean;
  generatePreview: () => Promise<string>;
  publishInvitation: () => Promise<string>;
  updateField: (category: string, field: string, value: any) => void;
}

export const useInvitationEditorSimple = (invitationId?: number): SimpleEditorReturn => {
  // Basic state only
  const [data, setData] = useState<Record<string, any>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});

  // TEST: Add debounced data
  const debouncedData = useDebounce(data, 1000);

  // TEST: Add validation function that was problematic
  const validateField = useCallback((category: string, field: string, value: any): string | null => {
    // Simple validation - no complex rules for now
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'Campo requerido';
    }
    return null;
  }, []);

  // Simple functions without complex dependencies
  const saveData = useCallback(async (): Promise<void> => {
    console.log('Mock save data');
  }, []);

  const loadData = useCallback(async (id: number): Promise<void> => {
    console.log('Mock load data for ID:', id);
  }, []);

  const getSectionCompleteness = useCallback((section: string): number => {
    // TEST: Use real EDITOR_SECTIONS logic
    const sectionConfig = EDITOR_SECTIONS.find(s => s.id === section);
    if (!sectionConfig || !sectionConfig.fields.length) return 100;

    const completedFields = sectionConfig.fields.filter(field => {
      const value = data[field as keyof typeof data];
      return value !== undefined && value !== null && value !== '';
    }).length;

    return Math.round((completedFields / sectionConfig.fields.length) * 100);
  }, []); // Remove data dependency to prevent loops

  const getOverallCompleteness = useCallback((): number => {
    // TEST: Use real EDITOR_SECTIONS logic
    const requiredSections = EDITOR_SECTIONS.filter(s => s.required);
    const totalCompleteness = requiredSections.reduce((sum, section) => {
      return sum + getSectionCompleteness(section.id);
    }, 0);

    return Math.round(totalCompleteness / requiredSections.length);
  }, []); // Remove getSectionCompleteness dependency to prevent loops

  const isFormValid = useCallback((): boolean => {
    return false;
  }, []);

  const generatePreview = useCallback(async (): Promise<string> => {
    return 'mock-preview-url';
  }, []);

  const publishInvitation = useCallback(async (): Promise<string> => {
    return 'mock-published-url';
  }, []);

  // TEST: Add updateField that could cause the loop
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
  }, []); // Remove validateField dependency as in our fix

  // TEST: Add the useEffect that was in the original hook
  useEffect(() => {
    if (invitationId && invitationId !== null) {
      loadData(invitationId).catch(console.error);
    }
  }, [invitationId]); // Exclude loadData as per our fix

  return {
    data,
    events,
    media,
    isLoading,
    isDirty,
    errors,
    saveData,
    loadData,
    getSectionCompleteness,
    getOverallCompleteness,
    isFormValid,
    generatePreview,
    publishInvitation,
    updateField,
  };
};