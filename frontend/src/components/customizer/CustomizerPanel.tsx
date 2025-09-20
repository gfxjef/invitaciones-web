/**
 * Customizer Panel Component
 *
 * WHY: Main sliding panel that contains all customization fields
 * organized by categories. Provides progressive override interface
 * with visual indicators for touched vs template default fields.
 */

'use client';

import { X, RotateCcw, Palette, Edit3, Sparkles } from 'lucide-react';
import { CustomizerField } from './CustomizerField';
import { CustomizerField as FieldType, FieldState } from './types';

interface CustomizerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fieldsByCategory: Record<string, FieldType[]>;
  getFieldValue: (fieldKey: string) => string;
  updateField: (fieldKey: string, value: string) => void;
  onReset: () => void;
  onResetField?: (fieldKey: string) => void;
  hasChanges: boolean;
  sectionsCount: number;
  fieldsCount: number;
  touchedFieldsCount?: number;
  fieldStates?: Record<string, FieldState>;
  getSectionConfig?: (sectionName: string) => any;
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
  getSectionConfig
}) => {

  if (!isOpen) return null;

  // fieldsByCategory now contains sections ordered by priority
  const sections = Object.keys(fieldsByCategory);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md z-50
        bg-white shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
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
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{sectionsCount} secciones • {fieldsCount} campos</span>
                {touchedFieldsCount > 0 && (
                  <div className="flex items-center gap-1 text-purple-600 font-medium bg-purple-100 px-2 py-0.5 rounded-full">
                    <Edit3 className="w-3 h-3" />
                    <span>{touchedFieldsCount} personalizado{touchedFieldsCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {touchedFieldsCount === 0 && (
                  <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span>Plantilla original</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
                        {/* Status badges */}
                        <div className="flex items-center gap-1">
                          {touchedCount > 0 && (
                            <div className="flex items-center gap-1 text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              <Edit3 className="w-3 h-3" />
                              <span className="text-xs font-medium">{touchedCount} personalizado{touchedCount !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {defaultCount > 0 && (
                            <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              <span className="text-xs font-medium">{defaultCount} plantilla</span>
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

                          {/* Image groups */}
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
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
          {hasChanges ? (
            <div className="p-6">
              <div className="space-y-4">
                {/* Enhanced Summary */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-700 mb-1">
                    {touchedFieldsCount} Campo{touchedFieldsCount !== 1 ? 's' : ''} Personalizado{touchedFieldsCount !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round((touchedFieldsCount / fieldsCount) * 100)}% de personalización completada
                  </div>
                  <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${Math.round((touchedFieldsCount / fieldsCount) * 100)}%` }}
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
        </div>
      </div>
    </>
  );
};