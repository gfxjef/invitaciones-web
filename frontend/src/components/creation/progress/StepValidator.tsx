/**
 * Step Validator Component
 * 
 * WHY: Real-time validation component that checks form completeness
 * and data quality throughout the invitation creation process.
 * Provides immediate feedback and prevents errors before submission.
 * 
 * WHAT: Comprehensive validation system that checks required fields,
 * data formats, business rules, and provides helpful error messages
 * and correction suggestions. Supports different validation levels.
 * 
 * HOW: Uses validation rules, real-time field checking, and provides
 * both summary and detailed validation feedback with actionable
 * correction guidance.
 */

import React, { useMemo, useCallback } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Info,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Eye,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type ValidationLevel = 'error' | 'warning' | 'info' | 'success';

export interface ValidationRule {
  field: string;
  level: ValidationLevel;
  message: string;
  suggestion?: string;
  action?: () => void;
  actionLabel?: string;
}

export interface ValidationGroup {
  id: string;
  title: string;
  description: string;
  required: boolean;
  fields: string[];
  rules: ValidationRule[];
}

interface StepValidatorProps {
  data: Record<string, any>;
  validationGroups: ValidationGroup[];
  currentStep?: string;
  showSuggestions?: boolean;
  showActions?: boolean;
  compact?: boolean;
  onFieldFocus?: (field: string) => void;
  onNavigateToField?: (field: string) => void;
  className?: string;
}

export const StepValidator: React.FC<StepValidatorProps> = ({
  data,
  validationGroups,
  currentStep,
  showSuggestions = true,
  showActions = true,
  compact = false,
  onFieldFocus,
  onNavigateToField,
  className = ''
}) => {

  // Validate individual fields
  const validateField = useCallback((field: string, value: any): ValidationRule[] => {
    const rules: ValidationRule[] = [];

    // Skip validation if field is empty (required validation is handled separately)
    if (value === undefined || value === null || value === '') {
      return rules;
    }

    // Email validation
    if (field.includes('email') && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        rules.push({
          field,
          level: 'error',
          message: 'Formato de email inválido',
          suggestion: 'Usa el formato: ejemplo@dominio.com'
        });
      }
    }

    // Phone validation
    if (field.includes('phone') && typeof value === 'string') {
      const phoneRegex = /^\+?[\d\s\-\(\)]{8,20}$/;
      if (!phoneRegex.test(value)) {
        rules.push({
          field,
          level: 'error',
          message: 'Formato de teléfono inválido',
          suggestion: 'Usa el formato: +51 999 999 999 o 999-999-999'
        });
      }
    }

    // URL validation
    if (field.includes('url') || field.includes('website') || field.includes('link')) {
      try {
        new URL(value);
      } catch {
        rules.push({
          field,
          level: 'error',
          message: 'URL inválida',
          suggestion: 'Debe comenzar con http:// o https://'
        });
      }
    }

    // Date validation
    if (field.includes('date') && typeof value === 'string') {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(date.getTime())) {
        rules.push({
          field,
          level: 'error',
          message: 'Fecha inválida',
          suggestion: 'Selecciona una fecha válida del calendario'
        });
      } else if (field.includes('event') && date < today) {
        rules.push({
          field,
          level: 'warning',
          message: 'La fecha del evento es en el pasado',
          suggestion: 'Verifica que la fecha sea correcta'
        });
      } else if (field.includes('deadline') && date < today) {
        rules.push({
          field,
          level: 'warning',
          message: 'La fecha límite es en el pasado',
          suggestion: 'Considera extender la fecha límite'
        });
      }
    }

    // Text length validations
    if (typeof value === 'string') {
      if (field.includes('name') && value.length < 2) {
        rules.push({
          field,
          level: 'warning',
          message: 'Nombre muy corto',
          suggestion: 'Los nombres suelen tener al menos 2 caracteres'
        });
      }

      if (field.includes('message') || field.includes('description')) {
        if (value.length > 500) {
          rules.push({
            field,
            level: 'warning',
            message: 'Texto muy largo',
            suggestion: 'Considera acortar el mensaje para mejor legibilidad'
          });
        }
      }

      if (field.includes('venue') && value.length < 3) {
        rules.push({
          field,
          level: 'warning',
          message: 'Nombre del venue muy corto',
          suggestion: 'Proporciona el nombre completo del lugar'
        });
      }
    }

    // Business logic validations
    if (field === 'rsvp_deadline' && data.event_date) {
      const eventDate = new Date(data.event_date);
      const deadline = new Date(value);
      const daysDiff = Math.ceil((deadline.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

      if (deadline > eventDate) {
        rules.push({
          field,
          level: 'error',
          message: 'La fecha límite RSVP no puede ser después del evento',
          suggestion: 'Establece la fecha límite antes del evento'
        });
      } else if (daysDiff > -7) {
        rules.push({
          field,
          level: 'warning',
          message: 'Fecha límite muy cerca del evento',
          suggestion: 'Considera dar más tiempo a los invitados (al menos 1 semana)'
        });
      }
    }

    if (field === 'rsvp_guest_limit' && typeof value === 'number') {
      if (value < 1) {
        rules.push({
          field,
          level: 'error',
          message: 'El límite de invitados debe ser mayor a 0',
          suggestion: 'Establece un número realista de invitados'
        });
      } else if (value > 1000) {
        rules.push({
          field,
          level: 'warning',
          message: 'Límite muy alto de invitados',
          suggestion: 'Verifica que el número sea correcto'
        });
      }
    }

    return rules;
  }, [data]);

  // Calculate validation results
  const validationResults = useMemo(() => {
    const results = validationGroups.map(group => {
      const groupRules: ValidationRule[] = [];

      // Check required fields
      const missingFields = group.fields.filter(field => {
        const value = data[field];
        return group.required && (value === undefined || value === null || value === '');
      });

      missingFields.forEach(field => {
        groupRules.push({
          field,
          level: 'error',
          message: `${getFieldLabel(field)} es requerido`,
          suggestion: 'Completa este campo para continuar',
          action: onNavigateToField ? () => onNavigateToField(field) : undefined,
          actionLabel: 'Completar'
        });
      });

      // Check field-specific validations
      group.fields.forEach(field => {
        const value = data[field];
        const fieldRules = validateField(field, value);
        groupRules.push(...fieldRules.map(rule => ({
          ...rule,
          action: onNavigateToField ? () => onNavigateToField(field) : undefined,
          actionLabel: 'Corregir'
        })));
      });

      // Calculate completion
      const completedFields = group.fields.filter(field => {
        const value = data[field];
        return value !== undefined && value !== null && value !== '';
      });

      const completion = group.fields.length === 0 ? 100 : 
        Math.round((completedFields.length / group.fields.length) * 100);

      const hasErrors = groupRules.some(rule => rule.level === 'error');
      const hasWarnings = groupRules.some(rule => rule.level === 'warning');
      const isValid = !hasErrors && (completion === 100 || !group.required);

      return {
        ...group,
        rules: groupRules,
        completion,
        isValid,
        hasErrors,
        hasWarnings,
        completedFields: completedFields.length,
        totalFields: group.fields.length
      };
    });

    return results;
  }, [data, validationGroups, validateField, onNavigateToField]);

  // Overall validation summary
  const validationSummary = useMemo(() => {
    const totalErrors = validationResults.reduce((sum, group) => 
      sum + group.rules.filter(rule => rule.level === 'error').length, 0);
    const totalWarnings = validationResults.reduce((sum, group) => 
      sum + group.rules.filter(rule => rule.level === 'warning').length, 0);
    const requiredGroups = validationResults.filter(group => group.required);
    const validRequiredGroups = requiredGroups.filter(group => group.isValid);
    
    const overallCompletion = validationResults.length === 0 ? 0 :
      Math.round(validationResults.reduce((sum, group) => sum + group.completion, 0) / validationResults.length);

    const canProceed = totalErrors === 0 && validRequiredGroups.length === requiredGroups.length;

    return {
      totalErrors,
      totalWarnings,
      overallCompletion,
      canProceed,
      validRequiredGroups: validRequiredGroups.length,
      totalRequiredGroups: requiredGroups.length
    };
  }, [validationResults]);

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      'template_id': 'Plantilla',
      'couple_groom_name': 'Nombre del novio',
      'couple_bride_name': 'Nombre de la novia',
      'couple_welcome_message': 'Mensaje de bienvenida',
      'event_date': 'Fecha del evento',
      'event_time': 'Hora del evento',
      'event_venue_name': 'Nombre del venue',
      'event_venue_address': 'Dirección del venue',
      'gallery_hero_image': 'Imagen principal',
      'contact_email': 'Email de contacto',
      'contact_phone': 'Teléfono de contacto',
      'rsvp_enabled': 'RSVP habilitado',
      'rsvp_deadline': 'Fecha límite RSVP'
    };
    return labels[field] || field.replace(/_/g, ' ');
  };


  if (compact) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              validationSummary.canProceed ? 'bg-green-100' : 
              validationSummary.totalErrors > 0 ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {validationSummary.canProceed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : validationSummary.totalErrors > 0 ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            
            <div>
              <div className="font-medium text-gray-900">
                {validationSummary.canProceed ? 'Todo correcto' : 
                 validationSummary.totalErrors > 0 ? 'Errores encontrados' : 'Verificaciones pendientes'}
              </div>
              <div className="text-sm text-gray-600">
                {validationSummary.totalErrors > 0 && `${validationSummary.totalErrors} errores`}
                {validationSummary.totalWarnings > 0 && 
                  `${validationSummary.totalErrors > 0 ? ', ' : ''}${validationSummary.totalWarnings} advertencias`}
              </div>
            </div>
          </div>
          
          <Badge variant={validationSummary.canProceed ? 'default' : 'outline'}>
            {validationSummary.validRequiredGroups}/{validationSummary.totalRequiredGroups} completos
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {validationSummary.canProceed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              Validación del Formulario
            </h3>
            <p className="text-gray-600 mt-1">
              {validationSummary.canProceed 
                ? 'Todo está correcto y listo para continuar'
                : 'Revisa los siguientes puntos antes de continuar'
              }
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {validationSummary.overallCompletion}%
            </div>
            <div className="text-sm text-gray-600">completado</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {validationSummary.validRequiredGroups}
            </div>
            <div className="text-sm text-green-700">Secciones válidas</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-semibold text-red-600">
              {validationSummary.totalErrors}
            </div>
            <div className="text-sm text-red-700">Errores</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-semibold text-yellow-600">
              {validationSummary.totalWarnings}
            </div>
            <div className="text-sm text-yellow-700">Advertencias</div>
          </div>
        </div>
      </div>

      {/* Validation Groups */}
      <div className="p-6">
        <div className="space-y-6">
          {validationResults.map(group => (
            <ValidationGroupItem
              key={group.id}
              group={group}
              isActive={currentStep === group.id}
              showSuggestions={showSuggestions}
              showActions={showActions}
              onFieldFocus={onFieldFocus}
            />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      {validationSummary.totalErrors > 0 && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-200 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">
                Corrige {validationSummary.totalErrors} error{validationSummary.totalErrors !== 1 ? 'es' : ''} antes de continuar
              </span>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver todos los errores
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Utility Functions
const getValidationIcon = (level: ValidationLevel) => {
  switch (level) {
    case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'info': return <Info className="w-4 h-4 text-blue-500" />;
    case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
};

const getLevelColor = (level: ValidationLevel) => {
  switch (level) {
    case 'error': return 'border-red-200 bg-red-50';
    case 'warning': return 'border-yellow-200 bg-yellow-50';
    case 'info': return 'border-blue-200 bg-blue-50';
    case 'success': return 'border-green-200 bg-green-50';
  }
};

// Validation Group Item Component
interface ValidationGroupItemProps {
  group: ValidationGroup & {
    isValid: boolean;
    completion: number;
    hasErrors: boolean;
    hasWarnings: boolean;
    completedFields: number;
    totalFields: number;
  };
  isActive: boolean;
  showSuggestions: boolean;
  showActions: boolean;
  onFieldFocus?: (field: string) => void;
}

const ValidationGroupItem: React.FC<ValidationGroupItemProps> = ({
  group,
  isActive,
  showSuggestions,
  showActions,
  onFieldFocus
}) => {
  if (group.rules.length === 0 && group.isValid) {
    return (
      <div className={`p-4 rounded-lg border-2 ${
        isActive ? 'border-green-300 bg-green-50' : 'border-green-200 bg-green-50'
      }`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h4 className="font-medium text-green-900">{group.title}</h4>
            <p className="text-sm text-green-700">Sección completada correctamente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg ${
      isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
    }`}>
      {/* Group Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {group.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : group.hasErrors ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
            
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                {group.title}
                {group.required && (
                  <Badge variant="outline" className="text-xs">Obligatorio</Badge>
                )}
              </h4>
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {group.completion}%
            </div>
            <div className="text-xs text-gray-500">
              {group.completedFields}/{group.totalFields} campos
            </div>
          </div>
        </div>
      </div>

      {/* Validation Rules */}
      {group.rules.length > 0 && (
        <div className="p-4 space-y-3">
          {group.rules.map((rule, index) => (
            <div
              key={`${rule.field}-${index}`}
              className={`p-3 rounded-lg border ${getLevelColor(rule.level)}`}
            >
              <div className="flex items-start gap-3">
                {getValidationIcon(rule.level)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {rule.message}
                    </p>
                    
                    {showActions && rule.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={rule.action}
                        className="ml-3"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        {rule.actionLabel}
                      </Button>
                    )}
                  </div>
                  
                  {showSuggestions && rule.suggestion && (
                    <div className="flex items-start gap-2 mt-2">
                      <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">
                        <strong>Sugerencia:</strong> {rule.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StepValidator;