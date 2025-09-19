/**
 * WizardStep Component
 * 
 * WHY: Base wrapper component for all wizard steps that provides
 * consistent layout, styling, and common functionality like
 * error handling and loading states.
 * 
 * WHAT: Container component that wraps step content with
 * standardized spacing, error display, and loading indicators.
 * Provides a consistent experience across all wizard steps.
 * 
 * HOW: Uses compound component pattern to allow flexible
 * content while maintaining design consistency.
 */

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface WizardStepProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
  errors?: string[];
  className?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  children,
  title,
  description,
  isLoading = false,
  errors = [],
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      {(title || description) && (
        <div className="border-b pb-4">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-1">
                {errors.length === 1 ? 'Error encontrado' : 'Errores encontrados'}
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      {!isLoading && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  );
};

// Helper components for consistent step layouts
export const StepSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <div>
      <h4 className="text-lg font-medium text-gray-900">{title}</h4>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export const StepField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, required = false, error, description, children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
    {children}
    {error && (
      <p className="text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

export default WizardStep;