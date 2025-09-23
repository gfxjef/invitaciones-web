/**
 * Customizer Field Component
 *
 * WHY: Individual field component that renders different input types
 * with progressive override support. Features stagger animation for
 * smooth field reveal with fade + slide effects.
 */

'use client';

import { useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { RotateCcw, Edit3, Sparkles } from 'lucide-react';
import { CustomizerField as FieldType, FieldState, GalleryImage } from './types';
import { FileImagePicker } from '@/components/ui/FileImagePicker';
import { MultiImageGalleryPicker } from '@/components/ui/MultiImageGalleryPicker';

interface CustomizerFieldProps {
  field: FieldType;
  value: string | boolean | GalleryImage[];
  onChange: (value: string | boolean | GalleryImage[]) => void;
  fieldState?: FieldState;
  onReset?: (fieldKey: string) => void;
  className?: string;
}

export const CustomizerField: React.FC<CustomizerFieldProps> = ({
  field,
  value,
  onChange,
  fieldState,
  onReset,
  className = ''
}) => {
  // Helper function to check if field is part of itinerary section
  const isItineraryField = field.key.startsWith('itinerary_event_');

  // Helper function to detect image URL fields
  const isImageField = useCallback((fieldKey: string): boolean => {
    const imageKeywords = [
      'imageUrl', 'ImageUrl', 'image_url', '_image_',
      'heroImageUrl', 'couplePhotoUrl', 'bannerImageUrl',
      'backgroundImageUrl', 'gallery_image_', '_imageUrl'
    ];
    return imageKeywords.some(keyword => fieldKey.includes(keyword));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleReset = useCallback(() => {
    if (onReset && fieldState?.canReset) {
      onReset(field.key);
    }
  }, [onReset, field.key, fieldState]);

  // Determine field styling based on state with enhanced visual feedback
  const getFieldClasses = () => {
    let classes = `
      w-full px-3 py-2.5 border rounded-lg
      focus:ring-2 focus:ring-purple-500 focus:border-transparent
      transition-all duration-300
      text-sm
      placeholder:text-gray-400
      ${className}
    `;

    if (fieldState?.isTouched) {
      classes += ' border-purple-400 bg-purple-50/70 shadow-sm focus:bg-purple-50 focus:shadow-purple-100/50';
    } else {
      classes += ' border-gray-300 bg-white hover:border-gray-400 focus:bg-gray-50';
    }

    return classes;
  };

  // Get status indicator - only show when customized
  const getStatusIndicator = () => {
    if (!fieldState) return null;

    // Only show badge when field has been customized
    if (fieldState.isTouched) {
      // For itinerary fields, show only the icon without background or text
      if (isItineraryField) {
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: [0, 15, -15, 0]
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Edit3 className="w-3 h-3 text-purple-600" />
          </motion.div>
        );
      }

      // For other fields, show full badge with background and text
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1 text-purple-600 bg-purple-100 px-2 py-1 rounded-full"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Edit3 className="w-3 h-3" />
          </motion.div>
          <span className="text-xs font-semibold">Personalizado</span>
        </motion.div>
      );
    }

    // Don't show "Plantilla" badge by default - let the field be clean
    return null;
  };

  const baseInputClasses = getFieldClasses();

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <div className="relative">
            <textarea
              id={`field-${field.key}`}
              value={String(value || '')}
              onChange={handleChange}
              placeholder={String(fieldState?.defaultValue || field.placeholder || '')}
              rows={4}
              className={`${baseInputClasses} resize-y min-h-[100px]`}
            />
            {fieldState?.isTouched && value && (
              <div className="absolute bottom-2 right-2 text-xs text-purple-500 bg-white px-1 rounded">
                {String(value).length} caracteres
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              id={`field-${field.key}`}
              value={String(value || '')}
              onChange={handleChange}
              className={`${baseInputClasses} pr-10`}
            />
            {!fieldState?.isTouched && fieldState?.defaultValue && (
              <div className="absolute inset-y-0 right-8 flex items-center text-xs text-gray-400 pointer-events-none">
                📅
              </div>
            )}
          </div>
        );

      case 'url':
        // Check if this is an image URL field
        if (isImageField(field.key)) {
          return (
            <FileImagePicker
              value={String(value || '')}
              onChange={(newValue: string, file?: File) => {
                onChange(newValue);
                // File is automatically stored in file manager via fieldKey
              }}
              fieldKey={field.key} // Pass field key for file storage
              label={undefined} // Field label is handled by parent
              placeholder={String(fieldState?.defaultValue || field.placeholder || 'Selecciona una imagen...')}
              className="w-full"
            />
          );
        }

        // Regular URL input for non-image fields
        return (
          <div className="relative">
            <input
              type="url"
              id={`field-${field.key}`}
              value={String(value || '')}
              onChange={handleChange}
              placeholder={String(fieldState?.defaultValue || field.placeholder || 'https://ejemplo.com')}
              className={`${baseInputClasses} pl-8`}
            />
            <div className="absolute inset-y-0 left-2 flex items-center text-gray-400 pointer-events-none">
              🔗
            </div>
            {fieldState?.isTouched && value && !isItineraryField && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        );

      case 'color':
        return (
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="color"
                id={`field-${field.key}`}
                value={String(value || '#000000')}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
              />
              {fieldState?.isTouched && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <input
              type="text"
              value={String(value || '')}
              onChange={handleChange}
              placeholder={String(fieldState?.defaultValue || field.placeholder || '#000000')}
              className={`${baseInputClasses} flex-1 font-mono text-xs`}
            />
            {value && (
              <div
                className="w-8 h-10 rounded-lg border border-gray-300 shadow-inner flex-shrink-0"
                style={{ backgroundColor: String(value) }}
                title={`Color: ${value}`}
              />
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="relative">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id={`field-${field.key}`}
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                {field.label}
              </span>
              {fieldState?.isTouched && !isItineraryField && (
                <div className="w-2 h-2 bg-purple-500 rounded-full ml-auto"></div>
              )}
            </label>
          </div>
        );

      case 'toggle':
        return (
          <div className="relative">
            <label className="flex items-center gap-3 cursor-pointer group">
              <motion.div
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out
                  ${Boolean(value) ? 'bg-purple-600' : 'bg-gray-300'}
                  ${fieldState?.isTouched ? 'ring-2 ring-purple-300 ring-opacity-50' : ''}
                `}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                  initial={false}
                  animate={{
                    x: Boolean(value) ? 24 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
                <input
                  type="checkbox"
                  id={`field-${field.key}`}
                  checked={Boolean(value)}
                  onChange={(e) => onChange(e.target.checked)}
                  className="sr-only"
                />
              </motion.div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                {field.label}
              </span>
              {fieldState?.isTouched && !isItineraryField && (
                <motion.div
                  className="w-2 h-2 bg-purple-500 rounded-full ml-auto"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </label>
          </div>
        );

      case 'time':
        return (
          <div className="relative">
            <input
              type="time"
              id={`field-${field.key}`}
              value={String(value || '')}
              onChange={handleChange}
              className={`${baseInputClasses} pl-8`}
            />
            <div className="absolute inset-y-0 left-2 flex items-center text-gray-400 pointer-events-none">
              🕐
            </div>
            {fieldState?.isTouched && value && !isItineraryField && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        );

      case 'datetime-local':
        return (
          <div className="relative">
            <input
              type="datetime-local"
              id={`field-${field.key}`}
              value={String(value || '')}
              onChange={handleChange}
              className={`${baseInputClasses} pl-8`}
            />
            <div className="absolute inset-y-0 left-2 flex items-center text-gray-400 pointer-events-none">
              📅
            </div>
            {fieldState?.isTouched && value && !isItineraryField && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        );

      case 'multi-image':
        return (
          <MultiImageGalleryPicker
            value={Array.isArray(value) ? value : []}
            onChange={(images: GalleryImage[]) => {
              onChange(images);
            }}
            fieldKey={field.key}
            label={undefined} // Field label is handled by parent
            maxImages={(field as any).maxImages || 9}
            className="w-full"
          />
        );

      default: // 'text'
        return (
          <div className="relative">
            <input
              type="text"
              id={`field-${field.key}`}
              value={String(value || '')}
              onChange={handleChange}
              placeholder={String(fieldState?.defaultValue || field.placeholder || '')}
              className={baseInputClasses}
            />
            {fieldState?.isTouched && value && !isItineraryField && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            )}
          </div>
        );
    }
  };

  // Animation variants for staggered field entrance
  const fieldVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const statusVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.1,
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3 group"
    >
      {/* Enhanced Field Header */}
      <div className="flex items-center justify-between">
        {field.key !== 'gallery_images' && (
          <label
            htmlFor={`field-${field.key}`}
            className="block text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors"
          >
            {field.label}
            {fieldState?.isTouched && (
              <span className="ml-1 text-purple-600">*</span>
            )}
          </label>
        )}

        <div className="flex items-center gap-2">
          {/* Enhanced Status Indicator */}
          {getStatusIndicator()}

          {/* Enhanced Reset Button */}
          {fieldState?.canReset && onReset && (
            <motion.button
              type="button"
              onClick={handleReset}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="
                p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600
                transition-all duration-200
                group/reset hover:shadow-sm
                border border-transparent hover:border-red-200
              "
              title={`Restablecer a valor original: "${fieldState.defaultValue}"`}
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>
          )}
        </div>
      </div>

      {/* Input Field with enhanced container */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {renderInput()}
      </motion.div>

    </motion.div>
  );
};