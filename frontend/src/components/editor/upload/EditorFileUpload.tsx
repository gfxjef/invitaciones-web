/**
 * EditorFileUpload Component
 * 
 * WHY: Provides general file upload functionality for audio files, documents,
 * and other non-image media types in the invitation editor. Handles file validation,
 * progress tracking, and integration with the FTP upload system.
 * 
 * WHAT: Comprehensive file upload component with drag-and-drop interface,
 * file list management, progress indicators, and support for multiple file types.
 * Includes file preview, metadata display, and bulk operations.
 * 
 * HOW: Uses HTML5 File API for file handling, integrates with useFileUpload hook
 * for upload management, and provides real-time feedback with retry capabilities.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  File, 
  Music, 
  FileText, 
  Video,
  X, 
  Play, 
  Pause, 
  Download,
  AlertCircle, 
  CheckCircle, 
  Loader2,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useFileUpload, useUploadStats } from '../../../lib/hooks/useFileUpload';
import { SUPPORTED_AUDIO_TYPES, FILE_SIZE_LIMITS } from '../../../types/invitation';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface EditorFileUploadProps {
  /**
   * Invitation ID for file uploads
   */
  invitationId: number;
  
  /**
   * Types of files accepted
   */
  acceptedTypes?: string[];
  
  /**
   * Maximum file size in bytes
   */
  maxFileSize?: number;
  
  /**
   * Maximum number of files
   */
  maxFiles?: number;
  
  /**
   * Allow multiple file selection
   */
  multiple?: boolean;
  
  /**
   * File type category for validation and display
   */
  fileCategory?: 'audio' | 'document' | 'video' | 'general';
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Custom upload zone text
   */
  uploadText?: string;
  
  /**
   * Show file preview/player
   */
  showPreview?: boolean;
  
  /**
   * Callback when files are uploaded successfully
   */
  onFilesUploaded?: (files: Array<{ name: string; url: string; size: number }>) => void;
  
  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;
  
  /**
   * Callback when files are removed
   */
  onFilesRemoved?: (fileNames: string[]) => void;
}

interface FilePreview {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: 'audio' | 'document' | 'video' | 'image' | 'other';
  previewUrl?: string;
  duration?: number;
}

/**
 * Get file category based on MIME type
 */
const getFileCategory = (file: File): FilePreview['category'] => {
  const type = file.type.toLowerCase();
  
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
  
  return 'other';
};

/**
 * Get appropriate icon for file type
 */
const getFileIcon = (category: FilePreview['category'], className = "w-6 h-6") => {
  switch (category) {
    case 'audio':
      return <Music className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'document':
      return <FileText className={className} />;
    case 'image':
      return <File className={className} />; // Using generic file icon for images in this context
    default:
      return <File className={className} />;
  }
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration for audio/video files
 */
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * General purpose file upload component
 */
export const EditorFileUpload: React.FC<EditorFileUploadProps> = ({
  invitationId,
  acceptedTypes = [...SUPPORTED_AUDIO_TYPES],
  maxFileSize = FILE_SIZE_LIMITS.audio,
  maxFiles = 5,
  multiple = true,
  fileCategory = 'audio',
  className,
  uploadText,
  showPreview = true,
  onFilesUploaded,
  onUploadError,
  onFilesRemoved
}) => {
  // ================
  // STATE
  // ================
  
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  
  // ================
  // REFS
  // ================
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  // ================
  // HOOKS
  // ================
  
  const { uploads, uploadFiles, cancelUpload, clearCompleted, isUploading, hasErrors } = useFileUpload({
    invitationId,
    maxFiles,
    enableRetry: true,
    maxRetries: 3,
    onUploadSuccess: (media) => {
      if (onFilesUploaded) {
        onFilesUploaded([{
          name: media.file_path.split('/').pop() || 'file',
          url: media.file_path,
          size: media.file_size || 0
        }]);
      }
    },
    onUploadError: (error, file) => {
      const errorMsg = `Error uploading ${file.name}: ${error}`;
      setUploadError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
    },
    onAllUploadsComplete: (results) => {
      const successful = results.filter(r => r.success);
      console.log(`Upload complete: ${successful.length}/${results.length} files uploaded successfully`);
      
      // Clear previews for successful uploads
      if (successful.length > 0) {
        setPreviews(prev => prev.filter((_, index) => !results[index].success));
        clearCompleted();
      }
    }
  });
  
  const stats = useUploadStats(uploads);
  
  // ================
  // COMPUTED VALUES
  // ================
  
  const canAddMore = previews.length < maxFiles;
  const isAtLimit = previews.length >= maxFiles;
  
  // ================
  // FILE VALIDATION
  // ================
  
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no soportado. Use: ${acceptedTypes.join(', ')}`
      };
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return {
        valid: false,
        error: `Archivo muy grande. Máximo ${maxSizeMB}MB permitido.`
      };
    }
    
    return { valid: true };
  }, [acceptedTypes, maxFileSize]);
  
  // ================
  // PREVIEW FUNCTIONS
  // ================
  
  const generatePreviewId = () => `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const createFilePreview = useCallback(async (file: File): Promise<FilePreview> => {
    const preview: FilePreview = {
      id: generatePreviewId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      category: getFileCategory(file)
    };
    
    // Create preview URL for supported types
    if (file.type.startsWith('audio/') || file.type.startsWith('video/') || file.type.startsWith('image/')) {
      preview.previewUrl = URL.createObjectURL(file);
      
      // Get duration for audio/video files
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        try {
          const duration = await getMediaDuration(preview.previewUrl);
          preview.duration = duration;
        } catch (error) {
          console.warn('Could not get media duration:', error);
        }
      }
    }
    
    return preview;
  }, []);
  
  const getMediaDuration = (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const media = document.createElement('audio');
      media.src = url;
      media.addEventListener('loadedmetadata', () => {
        resolve(media.duration);
      });
      media.addEventListener('error', reject);
      media.load();
    });
  };
  
  const removePreview = useCallback((previewId: string) => {
    const preview = previews.find(p => p.id === previewId);
    if (preview?.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    
    setPreviews(prev => prev.filter(p => p.id !== previewId));
    
    // Cancel upload if in progress
    cancelUpload(previewId);
    
    // Stop audio if playing
    if (audioPlaying === previewId) {
      setAudioPlaying(null);
    }
  }, [previews, cancelUpload, audioPlaying]);
  
  // ================
  // FILE PROCESSING
  // ================
  
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setUploadError(null);
    
    // Check if we can add these files
    const totalAfterAdd = previews.length + fileArray.length;
    if (totalAfterAdd > maxFiles) {
      const available = maxFiles - previews.length;
      setUploadError(`Solo puedes agregar ${available} archivo(s) más. Límite: ${maxFiles}`);
      return;
    }
    
    // Validate all files
    const validationResults = fileArray.map(file => ({
      file,
      validation: validateFile(file)
    }));
    
    const invalidFiles = validationResults.filter(r => !r.validation.valid);
    if (invalidFiles.length > 0) {
      const errorMsg = `Archivos inválidos: ${invalidFiles.map(f => `${f.file.name} (${f.validation.error})`).join(', ')}`;
      setUploadError(errorMsg);
      return;
    }
    
    // Create previews for valid files
    try {
      const validFiles = validationResults.map(r => r.file);
      const newPreviews = await Promise.all(
        validFiles.map(file => createFilePreview(file))
      );
      
      setPreviews(prev => [...prev, ...newPreviews]);
      
    } catch (error) {
      setUploadError('Error processing files');
      console.error('Error creating previews:', error);
    }
  }, [previews.length, maxFiles, validateFile, createFilePreview]);
  
  // ================
  // DRAG AND DROP HANDLERS
  // ================
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragActive(false);
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);
  
  // ================
  // INPUT HANDLERS
  // ================
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    
    // Reset input
    e.target.value = '';
  }, [processFiles]);
  
  const handleClickUpload = useCallback(() => {
    if (isAtLimit) {
      setUploadError(`Límite máximo alcanzado: ${maxFiles} archivo(s)`);
      return;
    }
    
    fileInputRef.current?.click();
  }, [isAtLimit, maxFiles]);
  
  // ================
  // UPLOAD FUNCTIONS
  // ================
  
  const handleUploadPreviews = useCallback(async () => {
    if (previews.length === 0) return;
    
    try {
      setUploadError(null);
      const files = previews.map(p => p.file);
      await uploadFiles(files, 'gallery'); // Using gallery as default media type
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
    }
  }, [previews, uploadFiles, onUploadError]);
  
  // ================
  // AUDIO CONTROLS
  // ================
  
  const toggleAudio = useCallback((previewId: string, previewUrl?: string) => {
    if (!previewUrl) return;
    
    const currentAudio = audioRefs.current.get(previewId);
    
    if (audioPlaying === previewId) {
      // Pause current audio
      currentAudio?.pause();
      setAudioPlaying(null);
    } else {
      // Stop any currently playing audio
      if (audioPlaying) {
        const playingAudio = audioRefs.current.get(audioPlaying);
        playingAudio?.pause();
      }
      
      // Play new audio
      if (currentAudio) {
        currentAudio.play();
        setAudioPlaying(previewId);
      } else {
        // Create new audio element
        const audio = new Audio(previewUrl);
        audio.addEventListener('ended', () => setAudioPlaying(null));
        audio.addEventListener('error', () => setAudioPlaying(null));
        audioRefs.current.set(previewId, audio);
        audio.play();
        setAudioPlaying(previewId);
      }
    }
  }, [audioPlaying]);
  
  // ================
  // EFFECTS
  // ================
  
  // Clear error after delay
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);
  
  // Cleanup audio elements
  useEffect(() => {
    return () => {
      audioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current.clear();
      
      // Cleanup preview URLs
      previews.forEach(preview => {
        if (preview.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, []);
  
  // ================
  // RENDER HELPERS
  // ================
  
  const renderDropZone = () => (
    <div
      ref={dropZoneRef}
      className={cn(
        "relative border-2 border-dashed rounded-lg transition-all duration-200",
        dragActive 
          ? "border-primary bg-primary/5 scale-105" 
          : "border-gray-300 hover:border-gray-400",
        isAtLimit && "opacity-50 cursor-not-allowed",
        "group cursor-pointer",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={!isAtLimit ? handleClickUpload : undefined}
    >
      <div className="p-8 text-center">
        <Upload 
          className={cn(
            "mx-auto h-12 w-12 transition-colors mb-4",
            dragActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
          )} 
        />
        
        <div className="text-sm text-gray-600 mb-2">
          {dragActive ? (
            <span className="font-medium text-primary">¡Suelta los archivos aquí!</span>
          ) : (
            <>
              <span className="font-medium text-primary hover:text-primary/80">
                {uploadText || 'Haz clic para seleccionar archivos'}
              </span>
              {" o arrastra archivos aquí"}
            </>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          <div>Formatos: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</div>
          <div>Máximo: {Math.round(maxFileSize / (1024 * 1024))}MB por archivo</div>
          {multiple && (
            <div>Límite: {maxFiles} archivo{maxFiles !== 1 ? 's' : ''}</div>
          )}
        </div>
        
        {isAtLimit && (
          <div className="text-sm text-amber-600 mt-2 font-medium">
            Límite máximo alcanzado
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
  
  const renderFileList = () => {
    if (previews.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            Archivos ({previews.length})
          </h3>
          {previews.length > 0 && (
            <Button
              onClick={handleUploadPreviews}
              size="sm"
              disabled={isUploading}
              className="text-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Subir todos'
              )}
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {previews.map((preview) => {
            const uploadStatus = uploads[preview.id];
            const isPlaying = audioPlaying === preview.id;
            
            return (
              <div key={preview.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {/* File icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(preview.category, "w-8 h-8 text-gray-500")}
                  </div>
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {preview.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{formatFileSize(preview.size)}</span>
                      {preview.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(preview.duration)}</span>
                        </>
                      )}
                      {uploadStatus && (
                        <>
                          <span>•</span>
                          <span className={cn(
                            "font-medium",
                            uploadStatus.status === 'completed' && "text-green-600",
                            uploadStatus.status === 'error' && "text-red-600",
                            uploadStatus.status === 'uploading' && "text-blue-600"
                          )}>
                            {uploadStatus.status === 'completed' && 'Completado'}
                            {uploadStatus.status === 'error' && 'Error'}
                            {uploadStatus.status === 'uploading' && `${uploadStatus.progress}%`}
                            {uploadStatus.status === 'pending' && 'Pendiente'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    {/* Audio controls */}
                    {showPreview && preview.category === 'audio' && preview.previewUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAudio(preview.id, preview.previewUrl)}
                        className="h-8 w-8 p-0"
                        title={isPlaying ? 'Pausar' : 'Reproducir'}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    {/* Download preview */}
                    {preview.previewUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = preview.previewUrl!;
                          a.download = preview.name;
                          a.click();
                        }}
                        className="h-8 w-8 p-0"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Retry failed uploads */}
                    {uploadStatus && uploadStatus.status === 'error' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUploadPreviews()}
                        className="h-8 w-8 p-0 text-blue-600"
                        title="Reintentar"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Remove file */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePreview(preview.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Upload progress bar */}
                {uploadStatus && uploadStatus.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadStatus.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Error message */}
                {uploadStatus && uploadStatus.status === 'error' && uploadStatus.error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    {uploadStatus.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderUploadStats = () => {
    if (!stats.hasUploads) return null;
    
    return (
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {stats.completedFiles} de {stats.totalFiles} subidos
          </span>
          <span className="text-gray-500">
            {stats.formattedCompletedSize} / {stats.formattedTotalSize}
          </span>
        </div>
        
        {stats.isUploading && (
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {stats.hasErrors && (
          <div className="mt-2 text-xs text-red-600">
            {stats.errorFiles} archivo(s) con errores
          </div>
        )}
      </div>
    );
  };
  
  // ================
  // RENDER
  // ================
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload zone */}
      {canAddMore && renderDropZone()}
      
      {/* Error message */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{uploadError}</div>
          </div>
        </div>
      )}
      
      {/* Upload statistics */}
      {renderUploadStats()}
      
      {/* File list */}
      {renderFileList()}
      
      {/* Usage info */}
      {previews.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {previews.length} de {maxFiles} archivo{maxFiles !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default EditorFileUpload;