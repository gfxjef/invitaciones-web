/**
 * InvitationWizard Component
 * 
 * WHY: Main wizard container that guides users through the complete invitation
 * creation process from template selection to final publication. Provides
 * step-by-step navigation, progress tracking, and form validation.
 * 
 * WHAT: Multi-step wizard interface with 7 main steps:
 * 1. Template Selection - Choose base design
 * 2. Basic Information - Couple names, date, venue
 * 3. Event Details - Timeline, locations, events
 * 4. Gallery Setup - Photos and hero image
 * 5. RSVP Configuration - Guest settings
 * 6. Contact Information - Contact details
 * 7. Review & Publish - Final review and publication
 * 
 * HOW: Uses React state for current step tracking, integrates with
 * useInvitationEditor for data management, and provides validation
 * and auto-save functionality at each step.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Save, 
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useInvitationEditor } from '@/lib/hooks/useInvitationEditor';
import { useAutoSave } from '@/lib/hooks/useAutoSave';

// Import wizard steps
import { TemplateSelectionStep } from './steps/TemplateSelectionStep';
import { BasicInformationStep } from './steps/BasicInformationStep';
import { EventDetailsStep } from './steps/EventDetailsStep';
import { GallerySetupStep } from './steps/GallerySetupStep';
import { RSVPConfigurationStep } from './steps/RSVPConfigurationStep';
import { ContactInformationStep } from './steps/ContactInformationStep';
import { ReviewPublishStep } from './steps/ReviewPublishStep';

// Step configuration
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
  required: boolean;
  fields: string[]; // Fields that need to be validated for this step
}

export interface WizardStepProps {
  data: any;
  errors: any;
  onUpdate: (field: string, value: any) => void;
  onUpdateData: (updates: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'template',
    title: 'Plantilla',
    description: 'Selecciona el diseño base de tu invitación',
    component: TemplateSelectionStep,
    required: true,
    fields: ['template_id']
  },
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Nombres de la pareja, fecha y venue principal',
    component: BasicInformationStep,
    required: true,
    fields: ['couple_groom_name', 'couple_bride_name', 'event_date', 'event_venue_name']
  },
  {
    id: 'events',
    title: 'Detalles del Evento',
    description: 'Cronograma, ubicaciones y eventos adicionales',
    component: EventDetailsStep,
    required: false,
    fields: ['event_time', 'event_venue_address']
  },
  {
    id: 'gallery',
    title: 'Galería',
    description: 'Sube fotos y selecciona la imagen principal',
    component: GallerySetupStep,
    required: true,
    fields: ['gallery_hero_image']
  },
  {
    id: 'rsvp',
    title: 'Configuración RSVP',
    description: 'Lista de invitados y configuración de respuestas',
    component: RSVPConfigurationStep,
    required: false,
    fields: ['rsvp_enabled']
  },
  {
    id: 'contact',
    title: 'Información de Contacto',
    description: 'Datos de contacto para los invitados',
    component: ContactInformationStep,
    required: false,
    fields: ['contact_email']
  },
  {
    id: 'review',
    title: 'Revisar y Publicar',
    description: 'Revisión final y publicación de la invitación',
    component: ReviewPublishStep,
    required: true,
    fields: []
  }
];

export interface InvitationWizardProps {
  invitationId?: number;
  onComplete?: (invitationUrl: string) => void;
  onCancel?: () => void;
  initialStep?: string;
}

export const InvitationWizard: React.FC<InvitationWizardProps> = ({
  invitationId,
  onComplete,
  onCancel,
  initialStep = 'template'
}) => {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(
    WIZARD_STEPS.findIndex(step => step.id === initialStep) || 0
  );
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize invitation editor
  const editor = useInvitationEditor(invitationId);
  
  // Auto-save functionality
  const { status, isAutoSaveEnabled } = useAutoSave({
    data: editor.data,
    isDirty: editor.isDirty,
    onSave: editor.saveData,
    enabled: !!invitationId && editor.isDirty,
    interval: 30000 // Auto-save every 30 seconds
  });

  const isSaving = status.status === 'saving';
  const lastSaved = status.lastSaved;

  const currentStep = WIZARD_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  // Step validation
  const isStepValid = useCallback((stepIndex: number): boolean => {
    const step = WIZARD_STEPS[stepIndex];
    if (!step.required) return true;

    return step.fields.every(field => {
      const value = editor.data[field];
      const error = editor.getFieldErrors('', field);
      return value !== undefined && value !== null && value !== '' && !error;
    });
  }, [editor.data, editor.getFieldErrors]);

  const canProceedToNext = isStepValid(currentStepIndex);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (isNavigating || !canProceedToNext) return;

    setIsNavigating(true);
    try {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));

      // Auto-save before proceeding
      if (editor.isDirty) {
        await editor.saveData();
      }

      if (isLastStep) {
        // Handle completion
        if (onComplete) {
          const publishedUrl = await editor.publishInvitation();
          onComplete(publishedUrl);
        }
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error proceeding to next step:', error);
      // Handle error - could show toast notification
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating, canProceedToNext, currentStep.id, editor, isLastStep, onComplete]);

  const handleBack = useCallback(() => {
    if (isNavigating || isFirstStep) return;
    setCurrentStepIndex(prev => prev - 1);
  }, [isNavigating, isFirstStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    // Allow navigation to completed steps or the next step
    const targetStep = WIZARD_STEPS[stepIndex];
    const canNavigate = completedSteps.has(targetStep.id) || 
                       stepIndex <= currentStepIndex + 1;
    
    if (canNavigate && !isNavigating) {
      setCurrentStepIndex(stepIndex);
    }
  }, [completedSteps, currentStepIndex, isNavigating]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/mi-cuenta/invitaciones');
    }
  }, [onCancel, router]);

  const handlePreview = useCallback(async () => {
    try {
      const previewUrl = await editor.generatePreview();
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }, [editor]);

  // Update URL to reflect current step
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('step', currentStep.id);
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentStep.id]);

  const CurrentStepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Invitación
              </h1>
              <div className="flex items-center gap-4">
                {/* Auto-save status */}
                {isSaving ? (
                  <div className="flex items-center text-sm text-blue-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </div>
                ) : lastSaved ? (
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    Guardado {new Date(lastSaved).toLocaleTimeString()}
                  </div>
                ) : null}

                {/* Action buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={!invitationId || editor.isLoading}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Paso {currentStepIndex + 1} de {WIZARD_STEPS.length}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = completedSteps.has(step.id);
              const isAccessible = completedSteps.has(step.id) || index <= currentStepIndex + 1;

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible || isNavigating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : isAccessible
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive
                      ? 'bg-white text-purple-600'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="hidden md:block">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStep.title}
            </h2>
            <p className="text-lg text-gray-600">
              {currentStep.description}
            </p>
          </div>

          {/* Step Component */}
          <div className="mb-8">
            <CurrentStepComponent
              data={editor.data}
              errors={editor.errors}
              onUpdate={(field: string, value: any) => editor.updateField('general', field, value)}
              onUpdateData={editor.updateData}
              onNext={handleNext}
              onBack={handleBack}
              isValid={canProceedToNext}
              isLoading={editor.isLoading || isNavigating}
            />
          </div>

          {/* Validation Errors */}
          {!canProceedToNext && currentStep.required && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Información requerida faltante
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Por favor completa todos los campos requeridos para continuar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep || isNavigating}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-4">
              {editor.isDirty && (
                <Button
                  variant="outline"
                  onClick={editor.saveData}
                  disabled={editor.isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editor.isLoading ? 'Guardando...' : 'Guardar'}
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceedToNext || isNavigating}
              >
                {isNavigating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {isLastStep ? 'Publicar' : 'Siguiente'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationWizard;