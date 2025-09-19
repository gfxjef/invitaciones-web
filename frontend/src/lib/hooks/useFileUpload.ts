/**
 * useFileUpload Hook
 * 
 * WHY: Provides comprehensive file upload functionality with progress tracking,
 * validation, error handling, and integration with the FTP system. Supports
 * multiple file uploads, cancellation, and retry logic.
 * 
 * WHAT: Complete file upload solution with real-time progress, file validation,
 * thumbnail generation, and batch upload capabilities for the invitation editor.
 * 
 * HOW: Uses XMLHttpRequest for progress tracking, FormData for uploads,
 * and provides optimistic UI updates with proper error recovery.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  UseFileUploadReturn,
  FileUploadProgress,
  InvitationMedia,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_AUDIO_TYPES,
  FILE_SIZE_LIMITS,
  MAX_GALLERY_IMAGES
} from '../../types/invitation';
import {
  uploadInvitationFile,
  uploadInvitationFiles,
  validateFile,
  generateFileId,
  fileToBase64,
  formatFileSize,
  handleApiError
} from '../invitation-api';

interface UseFileUploadOptions {
  /**
   * Invitation ID for uploading files
   */
  invitationId: number;
  
  /**
   * Maximum number of files that can be uploaded at once
   * @default 10
   */
  maxFiles?: number;
  
  /**
   * Enable automatic retry on upload failure
   * @default true
   */
  enableRetry?: boolean;
  
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Callback when upload completes successfully
   */
  onUploadSuccess?: (media: InvitationMedia) => void;
  
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string, file: File) => void;
  
  /**
   * Callback when all uploads complete
   */
  onAllUploadsComplete?: (results: Array<{ success: boolean; media?: InvitationMedia; error?: string }>) => void;
  
  /**
   * Enable automatic thumbnail generation for images
   * @default true
   */
  generateThumbnails?: boolean;
}

/**
 * File upload hook with progress tracking and validation
 */
export const useFileUpload = ({
  invitationId,
  maxFiles = 10,
  enableRetry = true,
  maxRetries = 3,
  onUploadSuccess,
  onUploadError,
  onAllUploadsComplete,
  generateThumbnails = true
}: UseFileUploadOptions): UseFileUploadReturn => {
  // ================
  // STATE
  // ================
  
  const [uploads, setUploads] = useState<FileUploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // ================
  // REFS
  // ================
  
  const uploadControllers = useRef<Map<string, AbortController>>(new Map());
  const retryCounters = useRef<Map<string, number>>(new Map());
  
  // ================
  // COMPUTED VALUES
  // ================
  
  const hasErrors = Object.values(uploads).some(upload => upload.status === 'error');
  const pendingUploads = Object.values(uploads).filter(upload => upload.status === 'pending' || upload.status === 'uploading');
  const completedUploads = Object.values(uploads).filter(upload => upload.status === 'completed');
  const errorUploads = Object.values(uploads).filter(upload => upload.status === 'error');
  
  // ================
  // UTILITY FUNCTIONS
  // ================
  
  const validateFileForUpload = useCallback((file: File, mediaType: string): { valid: boolean; error?: string } => {
    // Determine allowed types based on media type
    let allowedTypes: string[];
    let maxSize: number;
    
    if (['gallery', 'hero', 'couple', 'dresscode', 'og_image'].includes(mediaType)) {
      allowedTypes = [...SUPPORTED_IMAGE_TYPES];
      maxSize = FILE_SIZE_LIMITS.image;
    } else {
      allowedTypes = [...SUPPORTED_AUDIO_TYPES];
      maxSize = FILE_SIZE_LIMITS.audio;
    }
    
    return validateFile(file, allowedTypes, maxSize);
  }, []);
  
  const generateThumbnail = useCallback(async (file: File): Promise<string | null> => {
    if (!generateThumbnails || !file.type.startsWith('image/')) {
      return null;
    }
    
    try {
      return await fileToBase64(file);
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return null;
    }
  }, [generateThumbnails]);
  
  const updateUploadProgress = useCallback((fileId: string, updates: Partial<FileUploadProgress[string]>) => {
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        ...updates
      }
    }));
  }, []);
  
  // ================
  // UPLOAD FUNCTIONS
  // ================
  
  const uploadSingleFile = useCallback(async (
    file: File,
    mediaType: string,
    fileId?: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const uploadId = fileId || generateFileId();
    
    // Validate file
    const validation = validateFileForUpload(file, mediaType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Check if we're exceeding max files limit
    const currentUploadsCount = Object.keys(uploads).length;
    if (currentUploadsCount >= maxFiles) {
      throw new Error(`Máximo ${maxFiles} archivos permitidos`);
    }
    
    // For gallery uploads, check maximum limit
    if (mediaType === 'gallery') {
      const galleryCount = Object.values(uploads).filter(u => u.status === 'completed').length;
      if (galleryCount >= MAX_GALLERY_IMAGES) {
        throw new Error(`Máximo ${MAX_GALLERY_IMAGES} imágenes en la galería`);
      }
    }
    
    // Generate thumbnail if needed
    const thumbnail = await generateThumbnail(file);
    
    // Initialize upload state
    updateUploadProgress(uploadId, {
      file,
      progress: 0,
      status: 'pending',
      error: undefined,
      url: undefined
    });
    
    // Create abort controller for this upload
    const controller = new AbortController();
    uploadControllers.current.set(uploadId, controller);
    
    try {
      setIsUploading(true);
      
      updateUploadProgress(uploadId, {
        status: 'uploading',
        progress: 0
      });
      
      // Custom progress handler
      const progressHandler = (progress: number) => {
        updateUploadProgress(uploadId, { progress });
        if (onProgress) {
          onProgress(progress);
        }
      };
      
      // Upload file using API
      const result = await uploadInvitationFile(
        invitationId,
        file,
        mediaType as InvitationMedia['media_type'],
        progressHandler
      );
      
      // Update to completed state
      updateUploadProgress(uploadId, {
        status: 'completed',
        progress: 100,
        url: result.media.file_path,
        error: undefined
      });
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(result.media);
      }
      
      // Clean up controller
      uploadControllers.current.delete(uploadId);
      retryCounters.current.delete(uploadId);
      
      return result.media.file_path;
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      // Check if this was a cancellation
      if (controller.signal.aborted) {
        // Remove cancelled upload from state
        setUploads(prev => {
          const newUploads = { ...prev };
          delete newUploads[uploadId];
          return newUploads;
        });
        uploadControllers.current.delete(uploadId);
        throw new Error('Upload cancelled');
      }
      
      // Update error state
      updateUploadProgress(uploadId, {
        status: 'error',
        error: errorMessage
      });
      
      // Call error callback
      if (onUploadError) {
        onUploadError(errorMessage, file);
      }
      
      // Retry logic
      if (enableRetry) {
        const currentRetries = retryCounters.current.get(uploadId) || 0;
        if (currentRetries < maxRetries) {
          retryCounters.current.set(uploadId, currentRetries + 1);
          
          // Wait before retry (exponential backoff)
          const delay = 1000 * Math.pow(2, currentRetries);
          setTimeout(() => {
            uploadSingleFile(file, mediaType, uploadId, onProgress).catch(() => {
              // Final failure after all retries
              console.error(`Upload failed after ${maxRetries} retries:`, errorMessage);
            });
          }, delay);
          
          return Promise.reject(new Error(`Reintentando upload... (${currentRetries + 1}/${maxRetries})`));
        }
      }
      
      // Clean up controller
      uploadControllers.current.delete(uploadId);
      
      throw new Error(errorMessage);
    } finally {
      // Check if any uploads are still in progress
      const stillUploading = Object.values(uploads).some(upload => 
        upload.status === 'pending' || upload.status === 'uploading'
      );
      if (!stillUploading) {
        setIsUploading(false);
      }
    }
  }, [
    invitationId,
    maxFiles,
    uploads,
    validateFileForUpload,
    generateThumbnail,
    updateUploadProgress,
    enableRetry,
    maxRetries,
    onUploadSuccess,
    onUploadError
  ]);
  
  const uploadMultipleFiles = useCallback(async (
    files: File[],
    mediaType: string,
    onProgress?: (progress: number) => void
  ): Promise<string[]> => {
    if (files.length === 0) {
      return [];
    }
    
    // Validate all files first
    const validationResults = files.map(file => ({
      file,
      validation: validateFileForUpload(file, mediaType)
    }));
    
    const invalidFiles = validationResults.filter(r => !r.validation.valid);
    if (invalidFiles.length > 0) {
      const errorMessage = `Archivos inválidos: ${invalidFiles.map(f => `${f.file.name} (${f.validation.error})`).join(', ')}`;
      throw new Error(errorMessage);
    }
    
    // Check total file limit
    const currentUploadsCount = Object.keys(uploads).length;
    if (currentUploadsCount + files.length > maxFiles) {
      throw new Error(`Máximo ${maxFiles} archivos permitidos. Tienes ${currentUploadsCount} y estás intentando agregar ${files.length} más.`);
    }
    
    const fileIds = files.map(() => generateFileId());
    const results: string[] = [];
    const errors: string[] = [];
    
    try {
      // Upload all files concurrently
      const uploadPromises = files.map(async (file, index) => {
        try {
          const fileId = fileIds[index];
          const url = await uploadSingleFile(file, mediaType, fileId, (fileProgress) => {
            if (onProgress) {
              // Calculate overall progress
              const totalProgress = results.length + (fileProgress / 100);
              const overallProgress = (totalProgress / files.length) * 100;
              onProgress(Math.min(overallProgress, 100));
            }
          });
          return { success: true, url, fileId };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          return { success: false, error: errorMessage, fileId: fileIds[index] };
        }
      });
      
      const uploadResults = await Promise.allSettled(uploadPromises);
      
      uploadResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.push(result.value.url!);
        } else {
          const error = result.status === 'fulfilled' ? result.value.error! : result.reason.message;
          errors.push(`${files[index].name}: ${error}`);
        }
      });
      
      // Call completion callback with results
      if (onAllUploadsComplete) {
        const formattedResults = uploadResults.map((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            return { success: true };
          } else {
            return { 
              success: false, 
              error: result.status === 'fulfilled' ? result.value.error! : result.reason.message 
            };
          }
        });
        onAllUploadsComplete(formattedResults);
      }
      
      if (errors.length > 0) {
        throw new Error(`Algunos archivos fallaron: ${errors.join(', ')}`);
      }
      
      return results;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en upload múltiple';
      throw new Error(errorMessage);
    }
  }, [
    validateFileForUpload,
    uploads,
    maxFiles,
    uploadSingleFile,
    onAllUploadsComplete
  ]);
  
  // ================
  // PUBLIC UPLOAD FUNCTIONS
  // ================
  
  const uploadFile = useCallback(async (
    file: File,
    mediaType: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    return uploadSingleFile(file, mediaType, undefined, onProgress);
  }, [uploadSingleFile]);
  
  const uploadFiles = useCallback(async (
    files: File[],
    mediaType: string,
    onProgress?: (progress: number) => void
  ): Promise<string[]> => {
    return uploadMultipleFiles(files, mediaType, onProgress);
  }, [uploadMultipleFiles]);
  
  // ================
  // CONTROL FUNCTIONS
  // ================
  
  const cancelUpload = useCallback((fileId: string) => {
    const controller = uploadControllers.current.get(fileId);
    if (controller) {
      controller.abort();
      uploadControllers.current.delete(fileId);
    }
    
    // Remove from uploads state
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[fileId];
      return newUploads;
    });
    
    // Clean up retry counter
    retryCounters.current.delete(fileId);
  }, []);
  
  const cancelAllUploads = useCallback(() => {
    // Cancel all active uploads
    uploadControllers.current.forEach((controller, fileId) => {
      controller.abort();
    });
    
    // Clear all controllers and counters
    uploadControllers.current.clear();
    retryCounters.current.clear();
    
    // Reset state
    setUploads({});
    setIsUploading(false);
  }, []);
  
  const clearCompleted = useCallback(() => {
    setUploads(prev => {
      const newUploads: FileUploadProgress = {};
      Object.entries(prev).forEach(([fileId, upload]) => {
        if (upload.status !== 'completed') {
          newUploads[fileId] = upload;
        }
      });
      return newUploads;
    });
  }, []);
  
  const retryUpload = useCallback(async (fileId: string): Promise<string> => {
    const upload = uploads[fileId];
    if (!upload || upload.status !== 'error') {
      throw new Error('Upload not found or not in error state');
    }
    
    // Reset retry counter for manual retry
    retryCounters.current.delete(fileId);
    
    return uploadSingleFile(upload.file, 'gallery', fileId); // Default to gallery for retry
  }, [uploads, uploadSingleFile]);
  
  const removeUpload = useCallback((fileId: string) => {
    // Cancel if still uploading
    cancelUpload(fileId);
    
    // Remove from state
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[fileId];
      return newUploads;
    });
  }, [cancelUpload]);
  
  // ================
  // EFFECTS
  // ================
  
  // Update isUploading state based on uploads
  useEffect(() => {
    const uploading = Object.values(uploads).some(upload => 
      upload.status === 'pending' || upload.status === 'uploading'
    );
    setIsUploading(uploading);
  }, [uploads]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllUploads();
    };
  }, [cancelAllUploads]);
  
  // ================
  // RETURN
  // ================
  
  return {
    uploads,
    uploadFile,
    uploadFiles,
    cancelUpload,
    clearCompleted,
    isUploading,
    hasErrors
  };
};

/**
 * Utility hook for upload statistics and display
 */
export const useUploadStats = (uploads: FileUploadProgress) => {
  const totalFiles = Object.keys(uploads).length;
  const completedFiles = Object.values(uploads).filter(u => u.status === 'completed').length;
  const errorFiles = Object.values(uploads).filter(u => u.status === 'error').length;
  const uploadingFiles = Object.values(uploads).filter(u => u.status === 'uploading').length;
  const pendingFiles = Object.values(uploads).filter(u => u.status === 'pending').length;
  
  const overallProgress = totalFiles > 0 
    ? Math.round((completedFiles / totalFiles) * 100)
    : 0;
  
  const totalSize = Object.values(uploads).reduce((sum, upload) => sum + upload.file.size, 0);
  const completedSize = Object.values(uploads)
    .filter(u => u.status === 'completed')
    .reduce((sum, upload) => sum + upload.file.size, 0);
  
  return {
    totalFiles,
    completedFiles,
    errorFiles,
    uploadingFiles,
    pendingFiles,
    overallProgress,
    totalSize,
    completedSize,
    formattedTotalSize: formatFileSize(totalSize),
    formattedCompletedSize: formatFileSize(completedSize),
    hasUploads: totalFiles > 0,
    allCompleted: totalFiles > 0 && completedFiles === totalFiles,
    hasErrors: errorFiles > 0,
    isUploading: uploadingFiles > 0 || pendingFiles > 0
  };
};