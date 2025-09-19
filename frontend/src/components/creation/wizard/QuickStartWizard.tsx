/**
 * QuickStart Wizard Component
 * 
 * WHY: Simplified 3-step creation flow for users who want to create
 * invitations quickly with minimal configuration. Focuses on essential
 * information only, providing a fast path to published invitations.
 * 
 * WHAT: Streamlined wizard with only the most critical steps:
 * 1. Template Selection - Quick template picker with recommendations
 * 2. Essential Info - Basic couple and event information
 * 3. Quick Publish - Immediate publication with auto-generated settings
 * 
 * HOW: Uses simplified forms with smart defaults, auto-population
 * features, and minimal validation requirements for rapid creation.
 */

import React, { useState, useCallback } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Clock, 
  Check,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Camera,
  Globe,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '@/lib/hooks/use-templates';
import { Template } from '@/lib/api';

interface QuickStartData {
  // Template
  template?: Template;
  
  // Essential Info
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  
  // Auto-generated
  welcomeMessage?: string;
  heroImage?: string;
  customUrl?: string;
}

interface QuickStartWizardProps {
  onComplete: (data: QuickStartData, publishedUrl: string) => void;
  onCancel: () => void;
}

export const QuickStartWizard: React.FC<QuickStartWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<QuickStartData>({
    groomName: '',
    brideName: '',
    eventDate: '',
    eventTime: '',
    venueName: ''
  });

  const steps = ['Plantilla', 'Información', 'Publicar'];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateData = useCallback((updates: Partial<QuickStartData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handlePublish = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // Auto-generate missing fields
      const autoData = {
        ...data,
        welcomeMessage: data.welcomeMessage || `Con gran alegría, ${data.groomName} y ${data.brideName} te invitan a celebrar su matrimonio`,
        customUrl: data.customUrl || `${data.groomName}-${data.brideName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
        heroImage: data.heroImage || data.template?.preview_image_url
      };
      
      // Simulate API call for publishing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const publishedUrl = `https://invitaciones.com/${autoData.customUrl}`;
      onComplete(autoData, publishedUrl);
    } catch (error) {
      console.error('Error publishing quick invitation:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [data, onComplete]);

  // Validation
  const isStep0Valid = !!data.template;
  const isStep1Valid = data.groomName && data.brideName && data.eventDate && data.venueName;
  const canProceed = currentStep === 0 ? isStep0Valid : currentStep === 1 ? isStep1Valid : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Creación Rápida</h1>
                <p className="text-gray-600">Tu invitación lista en 3 pasos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                ~3 minutos
              </Badge>
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Paso {currentStep + 1} de {steps.length}: {steps[currentStep]}
              </span>
              <span className="text-gray-600">{Math.round(progress)}% completado</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-purple-600 text-white'
                    : index === currentStep
                    ? 'bg-purple-100 text-purple-600 border-2 border-purple-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 0 && (
            <QuickTemplateStep 
              selectedTemplate={data.template}
              onSelectTemplate={(template) => updateData({ template })}
            />
          )}
          
          {currentStep === 1 && (
            <QuickInfoStep 
              data={data}
              onUpdate={updateData}
            />
          )}
          
          {currentStep === 2 && (
            <QuickPublishStep 
              data={data}
              onPublish={handlePublish}
              isProcessing={isProcessing}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>

            <div className="flex items-center gap-4">
              {currentStep < 2 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  size="lg"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {currentStep === 2 && (
                <Button
                  onClick={handlePublish}
                  disabled={isProcessing}
                  size="lg"
                  className="px-8"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Publicar Invitación
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1: Quick Template Selection
interface QuickTemplateStepProps {
  selectedTemplate?: Template;
  onSelectTemplate: (template: Template) => void;
}

const QuickTemplateStep: React.FC<QuickTemplateStepProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  const { data: templatesData, isLoading } = useTemplates({
    page: 1,
    per_page: 12,
    sort_by: 'display_order',
    sort_order: 'asc'
  });

  const templates = templatesData?.templates || [];
  const popularTemplates = templates.filter(t => !t.is_premium).slice(0, 6);
  const premiumTemplates = templates.filter(t => t.is_premium).slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Elige tu Plantilla Perfecta
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Selecciona un diseño que represente su estilo. Podrás personalizarlo más tarde.
        </p>
      </div>

      {/* Selected Template */}
      {selectedTemplate && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <img
              src={selectedTemplate.thumbnail_url || selectedTemplate.preview_image_url}
              alt={selectedTemplate.name}
              className="w-16 h-20 rounded-lg object-cover"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Plantilla Seleccionada</span>
              </div>
              <h4 className="font-semibold text-purple-800">{selectedTemplate.name}</h4>
              <p className="text-sm text-purple-700">{selectedTemplate.description}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Popular Templates */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
              Populares y Gratuitas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {popularTemplates.map(template => (
                <QuickTemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => onSelectTemplate(template)}
                />
              ))}
            </div>
          </div>

          {/* Premium Templates */}
          {premiumTemplates.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-purple-500" />
                Diseños Premium
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {premiumTemplates.map(template => (
                  <QuickTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={() => onSelectTemplate(template)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Quick Template Card
interface QuickTemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

const QuickTemplateCard: React.FC<QuickTemplateCardProps> = ({
  template,
  isSelected,
  onSelect
}) => (
  <div
    onClick={onSelect}
    className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all ${
      isSelected
        ? 'ring-4 ring-purple-600 ring-offset-2 shadow-lg'
        : 'hover:shadow-md border-2 border-gray-200 hover:border-purple-300'
    }`}
  >
    <img
      src={template.preview_image_url || '/placeholder-template.jpg'}
      alt={template.name}
      className="w-full h-full object-cover"
    />
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-end">
      <div className="w-full p-3 bg-gradient-to-t from-black/70 to-transparent">
        <h4 className="text-white font-medium text-sm">{template.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white text-xs">
            S/ {template.price?.toFixed(2) || (template.is_premium ? '49.90' : '0.00')}
          </span>
          {template.is_premium && (
            <Badge className="bg-purple-600 text-white text-xs">Premium</Badge>
          )}
        </div>
      </div>
    </div>
    
    {/* Selection Indicator */}
    {isSelected && (
      <div className="absolute top-2 right-2">
        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      </div>
    )}
  </div>
);

// Step 2: Quick Info
interface QuickInfoStepProps {
  data: QuickStartData;
  onUpdate: (updates: Partial<QuickStartData>) => void;
}

const QuickInfoStep: React.FC<QuickInfoStepProps> = ({
  data,
  onUpdate
}) => {
  const handleInputChange = (field: keyof QuickStartData, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Información Esencial
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Solo necesitamos los datos básicos para crear tu invitación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Novio *
            </label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={data.groomName}
                onChange={(e) => handleInputChange('groomName', e.target.value)}
                placeholder="Carlos Eduardo"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Novia *
            </label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={data.brideName}
                onChange={(e) => handleInputChange('brideName', e.target.value)}
                placeholder="María Isabel"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de la Boda *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={data.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de la Ceremonia
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="time"
                value={data.eventTime}
                onChange={(e) => handleInputChange('eventTime', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lugar del Evento *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={data.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                placeholder="Iglesia San José"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
              />
            </div>
          </div>

          {/* Optional Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Principal (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Sube una foto especial o usa la imagen de la plantilla
              </p>
              <Button variant="outline" size="sm">
                Seleccionar Imagen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {data.groomName && data.brideName && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Vista Previa
          </h3>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {data.groomName} & {data.brideName}
            </h2>
            {data.eventDate && (
              <p className="text-lg text-gray-700">
                {new Date(data.eventDate + 'T00:00:00').toLocaleDateString('es-PE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {data.eventTime && (
                  <span className="ml-2">
                    a las {new Date(`2000-01-01T${data.eventTime}:00`).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                )}
              </p>
            )}
            {data.venueName && (
              <p className="text-gray-600">{data.venueName}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Step 3: Quick Publish
interface QuickPublishStepProps {
  data: QuickStartData;
  onPublish: () => void;
  isProcessing: boolean;
}

const QuickPublishStep: React.FC<QuickPublishStepProps> = ({
  data,
  onPublish,
  isProcessing
}) => {
  const autoUrl = data.groomName && data.brideName 
    ? `${data.groomName}-${data.brideName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
    : 'mi-invitacion';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Lista para Publicar!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tu invitación está completa y lista para compartir con tus invitados.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de tu Invitación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Plantilla:</span>
              <span className="font-medium">{data.template?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pareja:</span>
              <span className="font-medium">{data.groomName} & {data.brideName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium">
                {data.eventDate && new Date(data.eventDate + 'T00:00:00').toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium">
                {data.eventTime ? 
                  new Date(`2000-01-01T${data.eventTime}:00`).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : 
                  'No especificada'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lugar:</span>
              <span className="font-medium">{data.venueName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">URL:</span>
              <span className="font-medium text-purple-600">invitaciones.com/{autoUrl}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Added Automatically */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3">Se incluirá automáticamente:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-blue-600" />
            Mensaje de bienvenida personalizado
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-blue-600" />
            URL fácil de recordar
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-blue-600" />
            Optimización para compartir en redes
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-blue-600" />
            Diseño responsive para móviles
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="text-center space-y-4">
        {!isProcessing ? (
          <>
            <Button
              onClick={onPublish}
              size="lg"
              className="px-12 py-4 text-lg"
            >
              <Globe className="w-5 h-5 mr-3" />
              Publicar Mi Invitación
            </Button>
            <p className="text-sm text-gray-600">
              Podrás personalizar más detalles después de la publicación
            </p>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Publicando tu invitación...
              </h4>
              <p className="text-gray-600">
                Estamos preparando todo para que tu invitación esté perfecta
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickStartWizard;