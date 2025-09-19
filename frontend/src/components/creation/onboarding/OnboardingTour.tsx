/**
 * Onboarding Tour Component
 * 
 * WHY: Interactive guided tour that introduces new users to the
 * invitation editor features and workflow. Reduces learning curve
 * and increases user engagement and success rates.
 * 
 * WHAT: Step-by-step tutorial overlay that highlights key interface
 * elements, explains features, and guides users through their first
 * invitation creation experience.
 * 
 * HOW: Uses positioned overlays, tooltips, and interactive hotspots
 * to create an engaging tutorial experience with skip/replay options.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play,
  RotateCcw,
  Check,
  Lightbulb,
  MousePointer,
  Eye,
  Edit,
  Share2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  content: React.ReactNode;
  nextText?: string;
  skipable?: boolean;
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  context?: 'welcome' | 'editor' | 'templates';
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isActive,
  onComplete,
  onSkip,
  context = 'welcome'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const overlayRef = useRef<HTMLDivElement>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  // Tour steps based on context
  const tourSteps: Record<string, TourStep[]> = {
    welcome: [
      {
        id: 'welcome',
        title: '¡Bienvenido a Invitaciones Perfectas!',
        description: 'Te mostraremos cómo crear tu invitación soñada en simples pasos.',
        position: 'center',
        content: (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">¡Comencemos!</h3>
            <p className="text-gray-600 max-w-md">
              Este tour te llevará 2 minutos y te ahorrará horas de exploración. 
              Te mostraremos todo lo que necesitas saber.
            </p>
          </div>
        ),
        nextText: 'Comenzar Tour'
      },
      {
        id: 'quick-start',
        title: 'Creación Rápida',
        description: 'La forma más rápida de tener tu invitación lista en 3 minutos.',
        target: '[data-tour="quick-start"]',
        position: 'bottom',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Creación Rápida</span>
              <Badge variant="outline">3 min</Badge>
            </div>
            <p className="text-gray-600">
              Perfecto si quieres algo rápido y hermoso. Solo necesitas los datos básicos 
              y nosotros hacemos el resto.
            </p>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Ideal para eventos próximos o si prefieres simplicidad.
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'full-editor',
        title: 'Personalización Completa',
        description: 'Control total sobre cada detalle de tu invitación.',
        target: '[data-tour="full-editor"]',
        position: 'bottom',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Editor Completo</span>
              <Badge variant="outline">15-30 min</Badge>
            </div>
            <p className="text-gray-600">
              Acceso completo a todas las herramientas: galería de fotos, cronograma 
              detallado, RSVP personalizado y mucho más.
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>7 secciones editables</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>Galería ilimitada</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>RSVP avanzado</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                <span>URL personalizada</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'templates-preview',
        title: 'Plantillas Profesionales',
        description: 'Más de 50 diseños únicos creados por profesionales.',
        target: '[data-tour="templates"]',
        position: 'top',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Diseños para Cada Estilo</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>✨ Elegante y clásico</div>
              <div>🌸 Romántico y floral</div>
              <div>🎨 Moderno y minimalista</div>
              <div>🎭 Tradicional peruano</div>
            </div>
            <p className="text-gray-600">
              Cada plantilla es completamente personalizable. Cambia colores, 
              textos, imágenes y más.
            </p>
          </div>
        )
      },
      {
        id: 'social-proof',
        title: 'Confianza y Calidad',
        description: 'Miles de parejas ya crearon sus invitaciones con nosotros.',
        target: '[data-tour="testimonials"]',
        position: 'top',
        content: (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2,500+</div>
              <div className="text-sm text-gray-600">Invitaciones creadas</div>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
              ))}
              <span className="text-sm font-medium ml-2">4.9/5</span>
            </div>
            <p className="text-gray-600 text-sm">
              Nuestros usuarios aman la facilidad de uso y la calidad profesional 
              de nuestras invitaciones.
            </p>
          </div>
        )
      },
      {
        id: 'final',
        title: '¡Listo para Comenzar!',
        description: 'Tienes todo lo que necesitas para crear una invitación increíble.',
        position: 'center',
        content: (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">¡Todo Listo!</h3>
            <p className="text-gray-600 max-w-md">
              Ahora sabes cómo funciona nuestra plataforma. ¿Qué método prefieres 
              para crear tu primera invitación?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Zap className="w-4 h-4 mr-2" />
                Creación Rápida
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editor Completo
              </Button>
            </div>
          </div>
        ),
        nextText: 'Comenzar',
        skipable: false
      }
    ],
    editor: [
      {
        id: 'editor-welcome',
        title: 'Bienvenido al Editor',
        description: 'Aquí personalizarás cada detalle de tu invitación.',
        position: 'center',
        content: (
          <div className="text-center space-y-4">
            <Edit className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-xl font-bold">Editor de Invitaciones</h3>
            <p className="text-gray-600">
              Te guiaremos por las principales herramientas para que aproveches 
              al máximo el editor.
            </p>
          </div>
        )
      },
      {
        id: 'sidebar-navigation',
        title: 'Navegación por Secciones',
        description: 'Usa el panel lateral para moverte entre las diferentes secciones.',
        target: '[data-tour="sidebar"]',
        position: 'right',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Secciones Disponibles:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Información de la pareja</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Detalles del evento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Galería de fotos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Configuración RSVP</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'preview-panel',
        title: 'Vista Previa en Tiempo Real',
        description: 'Ve cómo se ve tu invitación mientras la editas.',
        target: '[data-tour="preview"]',
        position: 'left',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Vista Previa</span>
            </div>
            <p className="text-gray-600">
              Cada cambio que hagas se reflejará automáticamente aquí. 
              Puedes ver cómo se ve en diferentes dispositivos.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Usa el botón de vista previa completa para ver 
                tu invitación como la verán tus invitados.
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'save-publish',
        title: 'Guardar y Publicar',
        description: 'No te preocupes por perder tu trabajo - guardamos automáticamente.',
        target: '[data-tour="save-publish"]',
        position: 'bottom',
        content: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium">Auto-guardado</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-medium">Publicar</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Guardamos tu progreso cada pocos segundos. Cuando estés listo, 
              publica para compartir con tus invitados.
            </p>
          </div>
        ),
        nextText: 'Entendido'
      }
    ],
    templates: [
      {
        id: 'templates-intro',
        title: 'Galería de Plantillas',
        description: 'Explora nuestra colección de plantillas profesionales.',
        position: 'center',
        content: (
          <div className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-[3/4] bg-purple-200 rounded-lg"></div>
              ))}
            </div>
            <h3 className="text-xl font-bold">Encuentra tu Estilo</h3>
            <p className="text-gray-600">
              Tenemos plantillas para cada tipo de celebración y personalidad.
            </p>
          </div>
        )
      },
      {
        id: 'search-filters',
        title: 'Buscar y Filtrar',
        description: 'Encuentra la plantilla perfecta usando nuestros filtros.',
        target: '[data-tour="search-filters"]',
        position: 'bottom',
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold">Herramientas de Búsqueda</h4>
            <div className="space-y-2 text-sm">
              <div>🔍 <strong>Búsqueda:</strong> Por nombre o estilo</div>
              <div>🏷️ <strong>Categorías:</strong> Bodas, quinceañeros, etc.</div>
              <div>💎 <strong>Premium:</strong> Diseños exclusivos</div>
              <div>📱 <strong>Vista:</strong> Lista o cuadrícula</div>
            </div>
          </div>
        )
      },
      {
        id: 'template-preview',
        title: 'Vista Previa Detallada',
        description: 'Haz clic en cualquier plantilla para verla en detalle.',
        target: '[data-tour="template-card"]',
        position: 'top',
        action: 'hover',
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              <span className="font-medium">Interactúa con las plantillas</span>
            </div>
            <ul className="text-sm space-y-1">
              <li>• <strong>Hover:</strong> Ver acciones disponibles</li>
              <li>• <strong>Vista Previa:</strong> Ver en pantalla completa</li>
              <li>• <strong>Seleccionar:</strong> Agregar al carrito</li>
            </ul>
          </div>
        )
      }
    ]
  };

  const steps = tourSteps[context] || tourSteps.welcome;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Handle target element positioning
  useEffect(() => {
    if (!currentStepData?.target) {
      setTargetElement(null);
      return;
    }

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    setTargetElement(element);
  }, [currentStepData?.target]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
      onComplete();
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep, currentStepData.id, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(true);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && isActive) {
      const timer = setTimeout(() => {
        if (!isLastStep) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }, 4000); // 4 seconds per step

      return () => clearTimeout(timer);
    }
  }, [isPlaying, isActive, isLastStep, handleNext]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          backgroundImage: targetElement 
            ? `radial-gradient(circle at ${targetElement.offsetLeft + targetElement.offsetWidth/2}px ${targetElement.offsetTop + targetElement.offsetHeight/2}px, transparent 100px, rgba(0,0,0,0.6) 120px)`
            : undefined
        }}
      />

      {/* Target Element Highlight */}
      {targetElement && (
        <div
          className="absolute border-4 border-purple-400 rounded-lg shadow-2xl z-10 pointer-events-none"
          style={{
            left: targetElement.offsetLeft - 4,
            top: targetElement.offsetTop - 4,
            width: targetElement.offsetWidth + 8,
            height: targetElement.offsetHeight + 8,
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* Tour Content */}
      <div className="relative h-full flex items-center justify-center p-6">
        <div className={`bg-white rounded-xl shadow-2xl max-w-lg w-full ${
          currentStepData.position === 'center' ? '' : 'absolute'
        }`}
        style={
          targetElement && currentStepData.position !== 'center' ? {
            ...(currentStepData.position === 'top' && {
              top: targetElement.offsetTop - 20,
              left: targetElement.offsetLeft + (targetElement.offsetWidth / 2),
              transform: 'translateX(-50%) translateY(-100%)'
            }),
            ...(currentStepData.position === 'bottom' && {
              top: targetElement.offsetTop + targetElement.offsetHeight + 20,
              left: targetElement.offsetLeft + (targetElement.offsetWidth / 2),
              transform: 'translateX(-50%)'
            }),
            ...(currentStepData.position === 'left' && {
              top: targetElement.offsetTop + (targetElement.offsetHeight / 2),
              left: targetElement.offsetLeft - 20,
              transform: 'translateX(-100%) translateY(-50%)'
            }),
            ...(currentStepData.position === 'right' && {
              top: targetElement.offsetTop + (targetElement.offsetHeight / 2),
              left: targetElement.offsetLeft + targetElement.offsetWidth + 20,
              transform: 'translateY(-50%)'
            })
          } : undefined
        }>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-100 text-purple-800">
                {currentStep + 1} de {steps.length}
              </Badge>
              <h2 className="text-xl font-bold text-gray-900">
                {currentStepData.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Auto-play toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pausar' : 'Reproducir automáticamente'}
              >
                {isPlaying ? (
                  <div className="w-4 h-4 bg-gray-600 rounded-sm" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              {/* Restart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                title="Reiniciar tour"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              {/* Skip/Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                title="Salir del tour"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStepData.content}
            
            {currentStepData.description && (
              <p className="text-gray-600 mt-4">
                {currentStepData.description}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-xl">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              {(currentStepData.skipable !== false) && !isLastStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  Saltar tour
                </Button>
              )}
            </div>

            <Button onClick={handleNext}>
              {currentStepData.nextText || (isLastStep ? 'Finalizar' : 'Siguiente')}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingTour;