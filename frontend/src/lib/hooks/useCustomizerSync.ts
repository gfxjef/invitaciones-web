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

    const state = {
      customizerData,
      touchedFields,
      selectedMode: selectedMode || 'basic',
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      console.log('💾 Customizer state saved to localStorage:', {
        templateId,
        fieldsCount: Object.keys(customizerData || {}).length,
        touchedCount: Object.keys(touchedFields || {}).length,
        mode: selectedMode || 'basic'
      });

      // Dispatch custom event for real-time sync between desktop and mobile
      const syncEvent = new CustomEvent('customizer-sync', {
        detail: {
          templateId,
          timestamp: state.timestamp,
          source: 'localStorage'
        }
      });
      document.dispatchEvent(syncEvent);
      console.log('📡 Dispatched customizer-sync event for template:', templateId);
    } catch (error) {
      console.error('Failed to save customizer state:', error);
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
        console.log('📥 Loading customizer state from localStorage:', {
          templateId,
          fieldsCount: Object.keys(state.customizerData || {}).length,
          touchedCount: Object.keys(state.touchedFields || {}).length,
          age: Math.round((Date.now() - state.timestamp) / 1000 / 60) + ' minutes'
        });

        onStateRestore({
          customizerData: state.customizerData,
          touchedFields: state.touchedFields,
          selectedMode: state.selectedMode
        });
      }
    } catch (error) {
      console.error('Failed to load customizer state:', error);
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
        console.log('📥 Received customizer-sync event:', {
          templateId: eventTemplateId,
          timestamp,
          source
        });

        // Load fresh state from localStorage
        loadState();
      }
    };

    // Add event listener for sync events
    document.addEventListener('customizer-sync', handleSyncEvent as EventListener);
    console.log('🎧 Listening for customizer-sync events for template:', templateId);

    return () => {
      document.removeEventListener('customizer-sync', handleSyncEvent as EventListener);
      console.log('🔇 Stopped listening for customizer-sync events for template:', templateId);
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
    console.log('🗑️ Cleared customizer state for template:', templateId);
  }, [storageKey, templateId]);

  return {
    saveState,
    loadState,
    clearState
  };
};