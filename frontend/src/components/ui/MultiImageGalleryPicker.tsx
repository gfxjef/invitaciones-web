/**
 * Multi-Image Gallery Picker Component
 *
 * WHY: Replaces individual gallery image fields with a unified multi-image selector.
 * Users can select up to 9 images displayed in a 3x3 grid with drag & drop support.
 * All images are previewed locally using blob URLs without server upload.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Plus, Image as ImageIcon, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileManager } from '@/store/fileStore';

interface GalleryImage {
  url: string;
  alt?: string;
  category?: string;
  file?: File;
  id: string; // Unique identifier
}

interface MultiImageGalleryPickerProps {
  value?: GalleryImage[]; // Array of gallery images
  onChange: (images: GalleryImage[]) => void;
  fieldKey?: string; // Unique identifier for this field (for file storage)
  label?: string;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

export const MultiImageGalleryPicker: React.FC<MultiImageGalleryPickerProps> = ({
  value = [],
  onChange,
  fieldKey = 'gallery_images',
  label = 'Galería de Fotos',
  maxImages = 9,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImages, setSelectedImages] = useState<GalleryImage[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileManager = useFileManager();

  // Update local state when external value changes
  useEffect(() => {
    // Validate and filter images with valid URLs
    const validImages = value.filter((img, index) => {
      if (!img.url || typeof img.url !== 'string') {
        console.warn(`Invalid image URL at index ${index}`);
        return false;
      }
      return true;
    });

    setSelectedImages(validImages);
  }, [value]);

  // Generate unique ID for new images
  const generateImageId = useCallback(() => {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleFilesSelect = useCallback(async (files: File[]) => {
    if (disabled) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const availableSlots = maxImages - selectedImages.length;
    const filesToProcess = imageFiles.slice(0, availableSlots);

    if (filesToProcess.length === 0) return;

    // Convert all files to base64 for PDF generation compatibility
    const newImagesPromises = filesToProcess.map(async (file, index) => {
      const objectURL = URL.createObjectURL(file);
      const imageId = generateImageId();

      // Store in file manager
      fileManager.setFile(`${fieldKey}_${imageId}`, file, objectURL);

      // Convert to base64
      try {
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        return {
          id: imageId,
          url: base64String, // Use base64 instead of blob URL
          alt: `Imagen ${selectedImages.length + index + 1}`,
          category: 'gallery',
          file
        };
      } catch (error) {
        console.error('Failed to convert image to base64, using blob URL:', error);
        // Fallback to blob URL if conversion fails
        return {
          id: imageId,
          url: objectURL,
          alt: `Imagen ${selectedImages.length + index + 1}`,
          category: 'gallery',
          file
        };
      }
    });

    const newImages = await Promise.all(newImagesPromises);

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    onChange(updatedImages);
  }, [selectedImages, maxImages, disabled, fieldKey, fileManager, onChange, generateImageId]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFilesSelect(files);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFilesSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

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

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFilesSelect(files);
  }, [disabled, handleFilesSelect]);

  const handleRemoveImage = useCallback((imageId: string) => {
    const imageToRemove = selectedImages.find(img => img.id === imageId);

    if (imageToRemove) {
      // Cleanup blob URL if it exists (for old format compatibility)
      // Note: New images use base64 which doesn't need cleanup
      if (imageToRemove.url && typeof imageToRemove.url === 'string' && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      // Remove from file manager
      fileManager.removeFile(`${fieldKey}_${imageId}`);

      // Update state
      const updatedImages = selectedImages.filter(img => img.id !== imageId);
      setSelectedImages(updatedImages);
      onChange(updatedImages);
    }
  }, [selectedImages, fieldKey, fileManager, onChange]);

  const handleAddMoreClick = useCallback(() => {
    if (!disabled && selectedImages.length < maxImages) {
      fileInputRef.current?.click();
    }
  }, [disabled, selectedImages.length, maxImages]);

  const canAddMore = selectedImages.length < maxImages && !disabled;
  const isEmpty = selectedImages.length === 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-xs text-gray-500">
            {selectedImages.length}/{maxImages} fotos
          </span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Main Gallery Area */}
      <div className="relative">
        {isEmpty ? (
          /* Empty State - Initial Upload Area */
          <motion.div
            onClick={() => !disabled && fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
              ${isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              p-12 text-center
            `}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Camera
                className={`mx-auto h-16 w-16 mb-4 ${
                  isDragging ? 'text-purple-500' : 'text-gray-400'
                }`}
              />
            </motion.div>

            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {isDragging ? 'Suelta las fotos aquí' : 'Selecciona tus fotos'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Arrastra y suelta o haz clic para seleccionar hasta {maxImages} imágenes
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                PNG, JPG, GIF hasta 10MB cada una
              </p>
            </div>
          </motion.div>
        ) : (
          /* Gallery Grid - 3x3 Layout */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-3 sm:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {selectedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  {/* Image */}
                  <img
                    src={image.url}
                    alt={image.alt || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <motion.button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={16} />
                    </motion.button>
                  </div>

                  {/* Image number badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                </motion.div>
              ))}

              {/* Add More Button */}
              {canAddMore && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  layout
                  onClick={handleAddMoreClick}
                  className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 flex items-center justify-center group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <Plus className="mx-auto h-8 w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
                    <p className="text-xs text-gray-500 group-hover:text-purple-600">
                      Agregar más
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Info and Stats */}
      {!isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <ImageIcon size={14} className="mr-1" />
              {selectedImages.length} imagen{selectedImages.length !== 1 ? 'es' : ''}
            </span>
            {canAddMore && (
              <span className="text-purple-600 dark:text-purple-400">
                {maxImages - selectedImages.length} espacio{maxImages - selectedImages.length !== 1 ? 's' : ''} disponible{maxImages - selectedImages.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {canAddMore && (
            <motion.button
              type="button"
              onClick={handleAddMoreClick}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Agregar más fotos
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MultiImageGalleryPicker;