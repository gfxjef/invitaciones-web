/**
 * Customizer Sync Hook
 *
 * WHY: Synchronizes customizer state between desktop and mobile views
 * using localStorage for seamless user experience across view modes.
 */

import { useEffect, useCallback } from 'react';

interface UseCustomizerSyncProps {
  templateId: number;
  customizerData: any;
  touchedFields: any;
  selectedMode?: 'basic' | 'full';
  onStateRestore?: (data: { customizerData: any; touchedFields: any; selectedMode?: 'basic' | 'full' }) => void;
  onSaveStateReady?: (saveStateFn: () => void) => void;
}

export const useCustomizerSync = ({
  templateId,
  customizerData,
  touchedFields,
  selectedMode,
  onStateRestore,
  onSaveStateReady
}: UseCustomizerSyncProps) => {

  const storageKey = `demo-customizer-${templateId}`;

  // Save state to localStorage whenever it changes
  const saveState = useCallback(() => {
    if (!templateId) return;

    // 🔍 VALIDATION: Check if there are any meaningful changes
    // Don't save if customizerData is empty or all values are empty strings
    // WHY: Prevents saving empty initial state when user never opens customizer
    const hasNonEmptyData = customizerData &&
      Object.values(customizerData).some(value => {
        // Check if value is meaningful (not empty string, null, or undefined)
        if (value === '' || value === null || value === undefined) return false;
        // For arrays (like gallery_images), check if array has items
        if (Array.isArray(value)) return value.length > 0;
        // For objects, check if has keys
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return true;
      });

    const hasTouchedFields = touchedFields &&
      Object.keys(touchedFields).length > 0;

    // Only save if user has actually customized something
    if (!hasNonEmptyData || !hasTouchedFields) {
      console.log('⏭️ [useCustomizerSync] Skipping save - no meaningful data to persist');
      console.log('   - hasNonEmptyData:', hasNonEmptyData);
      console.log('   - hasTouchedFields:', hasTouchedFields);
      console.log('   - touchedFields count:', Object.keys(touchedFields || {}).length);
      return;
    }

    const state = {
      customizerData,
      touchedFields,
      selectedMode: selectedMode || 'basic',
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      console.log('💾 [useCustomizerSync] Saved state to localStorage');
      console.log('   - Non-empty fields:', Object.entries(customizerData).filter(([k, v]) => v !== '' && v !== null && v !== undefined).length);
      console.log('   - Touched fields:', Object.keys(touchedFields).length);

      // Dispatch custom event for real-time sync between desktop and mobile
      const syncEvent = new CustomEvent('customizer-sync', {
        detail: {
          templateId,
          timestamp: state.timestamp,
          source: 'localStorage'
        }
      });
      document.dispatchEvent(syncEvent);
    } catch (error) {
      // Silent error handling
    }
  }, [templateId, customizerData, touchedFields, selectedMode, storageKey]);

  // Load state from localStorage on mount
  const loadState = useCallback(() => {
    if (!templateId || !onStateRestore) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;

      const state = JSON.parse(saved);

      // Verify the data is valid and recent (within 24 hours)
      const isRecent = Date.now() - (state.timestamp || 0) < 24 * 60 * 60 * 1000;

      if (isRecent && state.customizerData && state.touchedFields) {
        onStateRestore({
          customizerData: state.customizerData,
          touchedFields: state.touchedFields,
          selectedMode: state.selectedMode
        });
      }
    } catch (error) {
      // Clear corrupted data
      localStorage.removeItem(storageKey);
    }
  }, [templateId, storageKey, onStateRestore]);

  // Save state when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customizerData || touchedFields) {
        saveState();
      }
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [customizerData, touchedFields, saveState]);

  // Load state on mount
  useEffect(() => {
    loadState();
  }, [loadState]);

  // Listen for real-time sync events from other views (desktop <-> mobile)
  useEffect(() => {
    if (!templateId || !onStateRestore) return;

    const handleSyncEvent = (event: CustomEvent) => {
      const { templateId: eventTemplateId, timestamp, source } = event.detail;

      // Only process events for the same template
      if (eventTemplateId === templateId) {
        // Load fresh state from localStorage
        loadState();
      }
    };

    // Add event listener for sync events
    document.addEventListener('customizer-sync', handleSyncEvent as EventListener);

    return () => {
      document.removeEventListener('customizer-sync', handleSyncEvent as EventListener);
    };
  }, [templateId, onStateRestore, loadState]);

  // Expose saveState function to parent component
  useEffect(() => {
    if (onSaveStateReady && templateId) {
      onSaveStateReady(saveState);
    }
  }, [onSaveStateReady, saveState, templateId]);

  // Clear state for specific template
  const clearState = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    saveState,
    loadState,
    clearState
  };
};