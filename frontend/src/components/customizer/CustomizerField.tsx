/**
 * Customizer Field Component
 *
 * WHY: Individual field component that renders different input types
 * with progressive override support. Shows visual indicators for
 * touched/modified fields and provides individual reset functionality.
 */

'use client';

import { useCallback } from 'react';
import { RotateCcw, Edit3, Sparkles } from 'lucide-react';
import { CustomizerField as FieldType, FieldState } from './types';

interface CustomizerFieldProps {
  field: FieldType;
  value: string;
  onChange: (value: string) => void;
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
      return (
        <div className="flex items-center gap-1 text-purple-600 bg-purple-100 px-2 py-1 rounded-full animate-in fade-in duration-200">
          <Edit3 className="w-3 h-3" />
          <span className="text-xs font-semibold">Personalizado</span>
        </div>
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
              value={value}
              onChange={handleChange}
              placeholder={fieldState?.defaultValue || field.placeholder || ''}
              rows={4}
              className={`${baseInputClasses} resize-y min-h-[100px]`}
            />
            {fieldState?.isTouched && value && (
              <div className="absolute bottom-2 right-2 text-xs text-purple-500 bg-white px-1 rounded">
                {value.length} caracteres
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
              value={value}
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
        return (
          <div className="relative">
            <input
              type="url"
              id={`field-${field.key}`}
              value={value}
              onChange={handleChange}
              placeholder={fieldState?.defaultValue || field.placeholder || 'https://ejemplo.com'}
              className={`${baseInputClasses} pl-8`}
            />
            <div className="absolute inset-y-0 left-2 flex items-center text-gray-400 pointer-events-none">
              🔗
            </div>
            {fieldState?.isTouched && value && (
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
                value={value || '#000000'}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
              />
              {fieldState?.isTouched && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={fieldState?.defaultValue || field.placeholder || '#000000'}
              className={`${baseInputClasses} flex-1 font-mono text-xs`}
            />
            {value && (
              <div
                className="w-8 h-10 rounded-lg border border-gray-300 shadow-inner flex-shrink-0"
                style={{ backgroundColor: value }}
                title={`Color: ${value}`}
              />
            )}
          </div>
        );

      default: // 'text'
        return (
          <div className="relative">
            <input
              type="text"
              id={`field-${field.key}`}
              value={value}
              onChange={handleChange}
              placeholder={fieldState?.defaultValue || field.placeholder || ''}
              className={baseInputClasses}
            />
            {fieldState?.isTouched && value && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-3 group">
      {/* Enhanced Field Header */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={`field-${field.key}`}
          className="block text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors"
        >
          {field.label}
          {fieldState?.isTouched && (
            <span className="ml-1 text-purple-600">*</span>
          )}
        </label>

        <div className="flex items-center gap-2">
          {/* Enhanced Status Indicator */}
          {getStatusIndicator()}

          {/* Enhanced Reset Button */}
          {fieldState?.canReset && onReset && (
            <button
              type="button"
              onClick={handleReset}
              className="
                p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600
                transition-all duration-200
                group/reset hover:shadow-sm
                border border-transparent hover:border-red-200
              "
              title={`Restablecer a valor original: "${fieldState.defaultValue}"`}
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover/reset:rotate-180 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>

      {/* Input Field with enhanced container */}
      <div className="relative">
        {renderInput()}

        {/* Field state overlay for touched fields */}
        {fieldState?.isTouched && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Simplified Helper Text - only when customized */}
      {fieldState?.isTouched && (
        <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
          <Edit3 className="w-3 h-3" />
          Personalizado
        </p>
      )}
    </div>
  );
};