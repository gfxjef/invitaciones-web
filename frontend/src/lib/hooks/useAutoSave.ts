/**
 * useAutoSave Hook
 * 
 * WHY: Prevents data loss by automatically saving form data at regular
 * intervals. Uses debouncing to avoid excessive API calls and provides
 * visual feedback to users about save status.
 * 
 * WHAT: Intelligent auto-save hook that monitors data changes, debounces
 * saves, provides status indicators, and handles errors gracefully.
 * 
 * HOW: Uses useEffect to track data changes, setTimeout for intervals,
 * and provides manual save capabilities with proper cleanup.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './use-debounce';
import {
  UseAutoSaveReturn,
  AutoSaveStatus,
  AUTO_SAVE_INTERVAL,
  INPUT_DEBOUNCE_DELAY
} from '../../types/invitation';

interface UseAutoSaveOptions {
  /**
   * Function to execute when saving data
   */
  onSave: () => Promise<void>;
  
  /**
   * Data to monitor for changes
   */
  data: any;
  
  /**
   * Whether data has unsaved changes
   */
  isDirty: boolean;
  
  /**
   * Auto-save interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;
  
  /**
   * Debounce delay for user inputs in milliseconds
   * @default 1000 (1 second)
   */
  debounceDelay?: number;
  
  /**
   * Enable auto-save by default
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Callback when save succeeds
   */
  onSaveSuccess?: () => void;
  
  /**
   * Callback when save fails
   */
  onSaveError?: (error: string) => void;
  
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;
}

/**
 * Auto-save hook for form data
 */
export const useAutoSave = ({
  onSave,
  data,
  isDirty,
  interval = AUTO_SAVE_INTERVAL,
  debounceDelay = INPUT_DEBOUNCE_DELAY,
  enabled = true,
  onSaveSuccess,
  onSaveError,
  maxRetries = 3
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  // ================
  // STATE
  // ================
  
  const [status, setStatus] = useState<AutoSaveStatus>({
    status: 'idle',
    lastSaved: undefined,
    message: undefined,
    error: undefined
  });
  
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(enabled);
  const [retryCount, setRetryCount] = useState(0);
  
  // ================
  // REFS
  // ================
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<string>('');
  const isManualSaveRef = useRef(false);
  
  // ================
  // DEBOUNCED DATA
  // ================
  
  const debouncedData = useDebounce(data, debounceDelay);
  
  // ================
  // SAVE FUNCTIONS
  // ================
  
  const executeStandardSave = useCallback(async (isManual: boolean = false): Promise<void> => {
    if (!isDirty && !isManual) {
      setStatus(prev => ({
        ...prev,
        status: 'idle',
        message: 'No hay cambios que guardar'
      }));
      return;
    }
    
    try {
      setStatus(prev => ({
        ...prev,
        status: 'saving',
        message: isManual ? 'Guardando...' : 'Guardando automáticamente...',
        error: undefined
      }));
      
      await onSave();
      
      const now = new Date();
      setStatus(prev => ({
        status: 'saved',
        message: isManual ? 'Guardado exitosamente' : 'Guardado automático exitoso',
        lastSaved: now,
        error: undefined
      }));
      
      setRetryCount(0);
      lastSaveDataRef.current = JSON.stringify(data);
      
      // Call success callback
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      // Clear "saved" message after 3 seconds (only for manual saves)
      if (isManual) {
        timeoutRef.current = setTimeout(() => {
          setStatus(prev => ({
            ...prev,
            status: 'idle',
            message: undefined
          }));
        }, 3000);
      } else {
        // For auto-saves, clear message after 1 second
        timeoutRef.current = setTimeout(() => {
          setStatus(prev => ({
            ...prev,
            status: 'idle',
            message: undefined
          }));
        }, 1000);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
      
      setStatus(prev => ({
        status: 'error',
        message: isManual ? 'Error al guardar' : 'Error en guardado automático',
        error: errorMessage,
        lastSaved: prev.lastSaved
      }));
      
      // Call error callback
      if (onSaveError) {
        onSaveError(errorMessage);
      }
      
      // Retry logic for auto-saves
      if (!isManual && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff: 2s, 4s, 8s
        const retryDelay = 2000 * Math.pow(2, retryCount);
        
        timeoutRef.current = setTimeout(() => {
          console.log(`Auto-save retry attempt ${retryCount + 1} of ${maxRetries}`);
          executeStandardSave(false);
        }, retryDelay);
      }
    }
  }, [isDirty, onSave, onSaveSuccess, onSaveError, retryCount, maxRetries]); // Remove data from deps
  
  const forceSave = useCallback(async (): Promise<void> => {
    isManualSaveRef.current = true;
    
    // Clear any pending auto-save
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    
    await executeStandardSave(true);
    
    // Restart auto-save interval after manual save
    if (isAutoSaveEnabled) {
      startAutoSaveInterval();
    }
    
    isManualSaveRef.current = false;
  }, [executeStandardSave, isAutoSaveEnabled]);
  
  // ================
  // AUTO-SAVE INTERVAL MANAGEMENT
  // ================
  
  const startAutoSaveInterval = useCallback(() => {
    if (!isAutoSaveEnabled) return;
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      // Don't auto-save during manual operations
      if (isManualSaveRef.current) return;
      
      // Don't auto-save if already saving
      if (status.status === 'saving') return;
      
      // Only auto-save if data has actually changed
      const currentDataString = JSON.stringify(data);
      if (isDirty && currentDataString !== lastSaveDataRef.current) {
        executeStandardSave(false);
      }
    }, interval);
  }, [isAutoSaveEnabled, interval]); // Remove data, isDirty, status.status, executeStandardSave to prevent loops
  
  const stopAutoSaveInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // ================
  // ENABLE/DISABLE FUNCTIONS
  // ================
  
  const enableAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(true);
    setStatus(prev => ({
      ...prev,
      status: 'idle',
      message: 'Guardado automático activado'
    }));
    
    // Clear message after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        message: undefined
      }));
    }, 2000);
  }, []);
  
  const disableAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(false);
    stopAutoSaveInterval();
    setStatus(prev => ({
      ...prev,
      status: 'idle',
      message: 'Guardado automático desactivado'
    }));
    
    // Clear message after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        message: undefined
      }));
    }, 2000);
  }, [stopAutoSaveInterval]);
  
  // ================
  // EFFECTS
  // ================
  
  // Start/stop auto-save based on enabled state
  useEffect(() => {
    if (isAutoSaveEnabled) {
      startAutoSaveInterval();
    } else {
      stopAutoSaveInterval();
    }
    
    return () => {
      stopAutoSaveInterval();
    };
  }, [isAutoSaveEnabled]); // Remove function dependencies to prevent loops
  
  // Handle debounced data changes for immediate save after user stops typing
  useEffect(() => {
    // Skip if this is the initial data load
    if (lastSaveDataRef.current === '') {
      lastSaveDataRef.current = JSON.stringify(debouncedData);
      return;
    }
    
    // Skip if data hasn't actually changed
    const currentDataString = JSON.stringify(debouncedData);
    if (currentDataString === lastSaveDataRef.current) {
      return;
    }
    
    // Skip if not enabled or not dirty
    if (!isAutoSaveEnabled || !isDirty) {
      return;
    }
    
    // Skip if currently saving or in manual mode
    if (status.status === 'saving' || isManualSaveRef.current) {
      return;
    }
    
    // Save after user stops typing (debounced)
    executeStandardSave(false);
  }, [debouncedData, isAutoSaveEnabled, isDirty]); // Remove status.status, executeStandardSave to prevent loops
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle visibility change (save when user leaves page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isDirty && isAutoSaveEnabled) {
        // Force synchronous save when page becomes hidden
        onSave().catch(console.error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDirty, isAutoSaveEnabled, onSave]);
  
  // Handle beforeunload (warn user about unsaved changes)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && isAutoSaveEnabled) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro que quieres salir?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, isAutoSaveEnabled]);
  
  // ================
  // RETURN
  // ================
  
  return {
    status,
    forceSave,
    enableAutoSave,
    disableAutoSave,
    isAutoSaveEnabled
  };
};

/**
 * Hook for auto-save status display components
 */
export const useAutoSaveStatus = (autoSaveReturn: UseAutoSaveReturn) => {
  const { status } = autoSaveReturn;
  
  // Determine icon and color based on status
  const getStatusDisplay = useCallback(() => {
    switch (status.status) {
      case 'saving':
        return {
          icon: '⏳',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          message: status.message || 'Guardando...'
        };
      case 'saved':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          message: status.message || 'Guardado'
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          message: status.message || 'Error al guardar'
        };
      default:
        return {
          icon: '💾',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          message: status.message || 'Guardado automático activo'
        };
    }
  }, [status]);
  
  const getLastSavedText = useCallback(() => {
    if (status.lastSaved) {
      const now = new Date();
      const diffMs = now.getTime() - status.lastSaved.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) {
        return 'Guardado hace unos segundos';
      } else if (diffMins === 1) {
        return 'Guardado hace 1 minuto';
      } else if (diffMins < 60) {
        return `Guardado hace ${diffMins} minutos`;
      } else {
        return `Guardado a las ${status.lastSaved.toLocaleTimeString()}`;
      }
    }
    return null;
  }, [status.lastSaved]);
  
  return {
    ...getStatusDisplay(),
    lastSavedText: getLastSavedText(),
    hasError: status.status === 'error',
    isSaving: status.status === 'saving',
    errorDetails: status.error
  };
};