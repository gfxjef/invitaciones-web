/**
 * Customizer Panel Component
 *
 * WHY: Main sliding panel that contains all customization fields
 * organized by categories. Uses Framer Motion for circular clip-path
 * animation that expands from the button position for a modern reveal effect.
 */

'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, RotateCcw, Palette, Edit3, Sparkles } from 'lucide-react';
import { CustomizerField } from './CustomizerField';
import { CustomizerField as FieldType, FieldState, CustomizerMode, GalleryImage } from './types';
// BASIC_FIELDS now passed as prop - no longer imported from global config

interface CustomizerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fieldsByCategory: Record<string, FieldType[]>;
  getFieldValue: (fieldKey: string) => string | boolean | GalleryImage[];
  updateField: (fieldKey: string, value: string | boolean | GalleryImage[]) => void;
  onReset: () => void;
  onResetField?: (fieldKey: string) => void;
  hasChanges: boolean;
  sectionsCount: number;
  fieldsCount: number;
  touchedFieldsCount?: number;
  fieldStates?: Record<string, FieldState>;
  getSectionConfig?: (sectionName: string) => any;
  selectedMode: CustomizerMode;
  onModeChange: (mode: CustomizerMode) => void;
  basicFields: string[]; // Category-specific basic fields
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({
  isOpen,
  onClose,
  fieldsByCategory,
  getFieldValue,
  updateField,
  onReset,
  onResetField,
  hasChanges,
  sectionsCount,
  fieldsCount,
  touchedFieldsCount = 0,
  fieldStates = {},
  getSectionConfig,
  selectedMode,
  onModeChange,
  basicFields
}) => {
  // fieldsByCategory now contains sections ordered by priority
  const sections = Object.keys(fieldsByCategory);

  // Calculate mode statistics
  const modeStats = useMemo(() => {
    const allFields = Object.values(fieldsByCategory).flat();
    const basicFieldsAvailable = allFields.filter(field => basicFields.includes(field.key));

    return {
      basicCount: basicFieldsAvailable.length,
      fullCount: fieldsCount,
      currentCount: selectedMode === 'basic' ? basicFieldsAvailable.length : fieldsCount
    };
  }, [fieldsByCategory, fieldsCount, selectedMode, basicFields]);

  // Animation variants for circular clip-path expansion
  const panelVariants: Variants = {
    closed: {
      clipPath: "circle(0% at calc(100% - 48px) 48px)",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    open: {
      clipPath: "circle(150% at calc(100% - 48px) 48px)",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.5,
        delayChildren: 0.2,
        staggerChildren: 0.05
      }
    }
  };

  const backdropVariants: Variants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col"
          >

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50"
            >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Palette className="w-6 h-6 text-purple-600" />
              {touchedFieldsCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                  {touchedFieldsCount > 9 ? '9+' : touchedFieldsCount}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Personalizar Invitación
              </h2>
            </div>
          </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
              </button>
            </motion.div>

            {/* Mode Selector */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50"
            >
          <div className="flex items-center justify-center">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => onModeChange('basic')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedMode === 'basic'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Básico</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {modeStats.basicCount}
                  </span>
                </div>
              </button>
              <button
                onClick={() => onModeChange('full')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedMode === 'full'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Completo</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {modeStats.fullCount}
                  </span>
                </div>
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">
              {selectedMode === 'basic'
                ? 'Solo campos esenciales para personalización rápida'
                : 'Acceso completo a todas las opciones de personalización'
              }
              </p>
            </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex-1 overflow-y-auto p-6"
            >
          {sections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="relative mb-6">
                <Palette className="w-16 h-16 mx-auto text-gray-300" />
                <Sparkles className="w-6 h-6 absolute -top-1 -right-2 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Sin campos personalizables</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Esta plantilla no tiene campos personalizables detectados.
                Verifica que la plantilla tenga las secciones configuradas correctamente.
              </p>
              <div className="mt-4 text-xs text-gray-400">
                Secciones detectadas: {sectionsCount} • Campos: {fieldsCount}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map(sectionName => {
                const sectionConfig = getSectionConfig?.(sectionName);
                const sectionLabel = sectionConfig?.label || sectionName;
                const sectionIcon = sectionConfig?.icon || '📄';

                const sectionFields = fieldsByCategory[sectionName];
                const touchedCount = sectionFields.filter(field => fieldStates[field.key]?.isTouched).length;
                const defaultCount = sectionFields.length - touchedCount;
                const touchedPercentage = Math.round((touchedCount / sectionFields.length) * 100);

                return (
                  <div key={sectionName} className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Section Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sectionIcon}</span>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {sectionLabel}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                          {fieldsByCategory[sectionName].length}
                        </span>
                      </div>

                      {/* Enhanced Section Status Indicators */}
                      <div className="flex items-center gap-2">
                        {/* Status badges - Simplified to numbers only */}
                        <div className="flex items-center gap-1">
                          {touchedCount > 0 && (
                            <div className="text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              <span className="text-xs font-bold">{touchedCount}</span>
                            </div>
                          )}
                          {defaultCount > 0 && (
                            <div className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              <span className="text-xs font-bold">{defaultCount}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress indicator */}
                        {touchedCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 transition-all duration-300"
                                style={{ width: `${touchedPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-purple-600 font-medium">{touchedPercentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fields in Section with Special Grouping */}
                    <div className="mt-6">
                      {sectionName === 'story' ? (
                        // Story section with moment grouping
                        <div className="space-y-6">
                          {/* Section title fields first */}
                          <div className="space-y-4">
                            {sectionFields.filter(field =>
                              field.key === 'sectionTitle' || field.key === 'sectionSubtitle'
                            ).map(field => (
                              <CustomizerField
                                key={field.key}
                                field={field}
                                value={getFieldValue(field.key)}
                                onChange={(value) => updateField(field.key, value)}
                                fieldState={fieldStates[field.key]}
                                onReset={onResetField}
                              />
                            ))}
                          </div>

                          {/* Moment groups */}
                          {[1, 2, 3].map(momentNum => {
                            const momentFields = sectionFields.filter(field =>
                              field.key.includes(`story_moment_${momentNum}_`)
                            );
                            if (momentFields.length === 0) return null;

                            return (
                              <div key={`moment-${momentNum}`} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                                <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                                  <span className="text-purple-600">📖</span>
                                  Momento {momentNum}
                                </h4>
                                <div className="space-y-4">
                                  {momentFields.map(field => (
                                    <CustomizerField
                                      key={field.key}
                                      field={field}
                                      value={getFieldValue(field.key)}
                                      onChange={(value) => updateField(field.key, value)}
                                      fieldState={fieldStates[field.key]}
                                      onReset={onResetField}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : sectionName === 'gallery' ? (
                        // Gallery section with image grouping
                        <div className="space-y-6">
                          {/* 🚨 DEBUG: Log gallery fields processing */}
                          {(() => {
                            console.log('🚨 CustomizerPanel Gallery Section:', {
                              sectionName,
                              sectionFields: sectionFields.map(f => ({ key: f.key, type: f.type })),
                              totalFields: sectionFields.length,
                              galleryImagesField: sectionFields.find(f => f.key === 'gallery_images'),
                              titleFields: sectionFields.filter(field => field.key === 'sectionTitle' || field.key === 'sectionSubtitle'),
                              nonTitleFields: sectionFields.filter(field => field.key !== 'sectionTitle' && field.key !== 'sectionSubtitle')
                            });
                            return null;
                          })()}

                          {/* Section title fields first */}
                          <div className="space-y-4">
                            {sectionFields.filter(field =>
                              field.key === 'sectionTitle' || field.key === 'sectionSubtitle'
                            ).map(field => (
                              <CustomizerField
                                key={field.key}
                                field={field}
                                value={getFieldValue(field.key)}
                                onChange={(value) => updateField(field.key, value)}
                                fieldState={fieldStates[field.key]}
                                onReset={onResetField}
                              />
                            ))}
                          </div>

                          {/* Gallery multi-image field (gallery_images) */}
                          <div className="space-y-4">
                            {sectionFields.filter(field =>
                              field.type === 'multi-image' && field.key === 'gallery_images'
                            ).map(field => {
                              console.log('🚨 Rendering gallery_images field:', field);
                              return (
                                <CustomizerField
                                  key={field.key}
                                  field={field}
                                  value={getFieldValue(field.key)}
                                  onChange={(value) => updateField(field.key, value)}
                                  fieldState={fieldStates[field.key]}
                                  onReset={onResetField}
                                />
                              );
                            })}
                          </div>

                          {/* Individual Image fields (legacy pattern) */}
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(imageNum => {
                            const imageFields = sectionFields.filter(field =>
                              field.key.includes(`gallery_image_${imageNum}_`)
                            );
                            if (imageFields.length === 0) return null;

                            return (
                              <div key={`image-${imageNum}`} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                                <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                                  <span className="text-purple-600">🖼️</span>
                                  Imagen {imageNum}
                                </h4>
                                <div className="space-y-4">
                                  {imageFields.map(field => (
                                    <CustomizerField
                                      key={field.key}
                                      field={field}
                                      value={getFieldValue(field.key)}
                                      onChange={(value) => updateField(field.key, value)}
                                      fieldState={fieldStates[field.key]}
                                      onReset={onResetField}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : sectionName === 'itinerary' ? (
                        // Itinerary section with event horizontal grouping
                        <div className="space-y-6">
                          {/* Title field first */}
                          <div className="space-y-4">
                            {sectionFields.filter(field =>
                              field.key === 'itinerary_title'
                            ).map(field => (
                              <CustomizerField
                                key={field.key}
                                field={field}
                                value={getFieldValue(field.key)}
                                onChange={(value) => updateField(field.key, value)}
                                fieldState={fieldStates[field.key]}
                                onReset={onResetField}
                              />
                            ))}
                          </div>

                          {/* Event pairs - horizontal layout */}
                          {['ceremonia', 'recepcion', 'entrada', 'comida', 'fiesta'].map(eventName => {
                            const enabledField = sectionFields.find(field =>
                              field.key === `itinerary_event_${eventName}_enabled`
                            );
                            const timeField = sectionFields.find(field =>
                              field.key === `itinerary_event_${eventName}_time`
                            );

                            if (!enabledField || !timeField) return null;

                            return (
                              <div key={`event-${eventName}`} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50">
                                {/* Toggle on the left */}
                                <div className="flex-shrink-0">
                                  <CustomizerField
                                    field={enabledField}
                                    value={getFieldValue(enabledField.key)}
                                    onChange={(value) => updateField(enabledField.key, value)}
                                    fieldState={fieldStates[enabledField.key]}
                                    onReset={onResetField}
                                  />
                                </div>
                                {/* Time on the right */}
                                <div className="flex-1">
                                  <CustomizerField
                                    field={timeField}
                                    value={getFieldValue(timeField.key)}
                                    onChange={(value) => updateField(timeField.key, value)}
                                    fieldState={fieldStates[timeField.key]}
                                    onReset={onResetField}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // Regular sections - all fields without sub-grouping
                        <div className="space-y-4">
                          {sectionFields.map(field => (
                            <CustomizerField
                              key={field.key}
                              field={field}
                              value={getFieldValue(field.key)}
                              onChange={(value) => updateField(field.key, value)}
                              fieldState={fieldStates[field.key]}
                              onReset={onResetField}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
            </motion.div>

            {/* Enhanced Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50"
            >
          {hasChanges ? (
            <div className="p-6">
              <div className="space-y-4">
                {/* Enhanced Summary */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-700 mb-1">
                    {touchedFieldsCount} Campo{touchedFieldsCount !== 1 ? 's' : ''} Personalizado{touchedFieldsCount !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round((touchedFieldsCount / modeStats.currentCount) * 100)}% de personalización completada ({selectedMode === 'basic' ? 'básico' : 'completo'})
                  </div>
                  <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${Math.round((touchedFieldsCount / modeStats.currentCount) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={onReset}
                  className="
                    w-full flex items-center justify-center gap-2
                    px-4 py-3
                    text-sm font-medium text-gray-700
                    bg-white border border-gray-300 rounded-lg
                    hover:bg-gray-50 hover:border-gray-400
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200
                    shadow-sm hover:shadow-md
                    group
                  "
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  Restablecer Todo a Plantilla Original
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Usando plantilla original</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Modifica cualquier campo para personalizar tu invitación
              </p>
              </div>
            )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};