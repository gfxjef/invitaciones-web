/**
 * FileImagePicker Component
 *
 * WHY: Allows users to select local image files for preview without uploading to server.
 * Creates temporary blob URLs for immediate preview in templates while maintaining
 * the selected files in component state for future upload functionality.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileManager } from '@/store/fileStore';

interface FileImagePickerProps {
  value?: string; // Current image URL (external or blob)
  onChange: (value: string, file?: File) => void;
  fieldKey?: string; // Unique identifier for this field (for file storage)
  label?: string;
  accept?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FileImagePicker: React.FC<FileImagePickerProps> = ({
  value = '',
  onChange,
  fieldKey,
  label = 'Seleccionar Imagen',
  accept = 'image/*',
  placeholder = 'Haz clic para seleccionar una imagen...',
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileManager = useFileManager();

  // Update preview when external value changes
  useEffect(() => {
    if (value !== previewUrl) {
      setPreviewUrl(value);
      // If external URL is set, clear selected file
      if (value && !value.startsWith('blob:')) {
        setSelectedFile(null);
      }
    }
  }, [value, previewUrl]);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      console.warn('Only image files are allowed');
      return;
    }

    // Cleanup previous blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create new blob URL for immediate preview
    const objectURL = URL.createObjectURL(file);
    setPreviewUrl(objectURL);
    setSelectedFile(file);

    // Store in file manager if fieldKey is provided
    if (fieldKey) {
      fileManager.setFile(fieldKey, file, objectURL);
    }

    // Notify parent component with blob URL and file
    onChange(objectURL, file);
  }, [onChange, previewUrl, fieldKey, fileManager]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, [handleFileSelect]);

  const handleClear = useCallback(() => {
    // Cleanup blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl('');
    setSelectedFile(null);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Remove from file manager if fieldKey is provided
    if (fieldKey) {
      fileManager.removeFile(fieldKey);
    }

    // Notify parent
    onChange('');
  }, [onChange, previewUrl, fieldKey, fileManager]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Drop zone / Click area */}
        <motion.div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`
            relative border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${previewUrl ? 'p-2' : 'p-6'}
          `}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          {previewUrl ? (
            /* Preview Image */
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />

              {/* Overlay on hover */}
              <AnimatePresence>
                {(isHovering || isDragging) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center space-x-3"
                  >
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Upload size={20} />
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File info */}
              {selectedFile && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded">
                  <div className="flex items-center space-x-1">
                    <ImageIcon size={12} />
                    <span className="truncate">{selectedFile.name}</span>
                  </div>
                  <div className="text-gray-300">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center">
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Upload
                  className={`mx-auto h-12 w-12 ${
                    isDragging ? 'text-purple-500' : 'text-gray-400'
                  }`}
                />
              </motion.div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isDragging ? 'Suelta la imagen aquí' : placeholder}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG, GIF hasta 10MB
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Clear button for external URLs */}
        {previewUrl && !selectedFile && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <X size={16} />
          </motion.button>
        )}
      </div>

      {/* File details */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded"
        >
          <div className="flex justify-between items-center">
            <span>Archivo local seleccionado</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ Listo para previsualización
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileImagePicker;