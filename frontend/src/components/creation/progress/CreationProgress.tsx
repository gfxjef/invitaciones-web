/**
 * Creation Progress Component
 * 
 * WHY: Visual progress indicator that shows users how far they've
 * progressed through the invitation creation process. Provides
 * motivation, clear expectations, and easy navigation between sections.
 * 
 * WHAT: Interactive progress bar with section indicators, completion
 * percentages, estimated time remaining, and quick navigation to
 * specific sections. Includes motivational elements and rewards.
 * 
 * HOW: Uses completion data from the editor to calculate progress,
 * provides visual feedback with animations, and enables section
 * navigation with validation checks.
 */

import React, { useMemo } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProgressSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  fields: string[];
  estimatedTime: number; // in minutes
  weight: number; // for overall progress calculation
}

interface CreationProgressProps {
  currentSection?: string;
  completionData: Record<string, any>;
  onNavigateToSection?: (sectionId: string) => void;
  showTimeEstimate?: boolean;
  showRewards?: boolean;
  compact?: boolean;
  className?: string;
}

const PROGRESS_SECTIONS: ProgressSection[] = [
  {
    id: 'template',
    title: 'Plantilla',
    description: 'Selecciona el diseño base',
    icon: <Star className="w-4 h-4" />,
    required: true,
    fields: ['template_id'],
    estimatedTime: 2,
    weight: 15
  },
  {
    id: 'couple',
    title: 'Pareja',
    description: 'Nombres y mensaje de bienvenida',
    icon: <Circle className="w-4 h-4" />,
    required: true,
    fields: ['couple_groom_name', 'couple_bride_name', 'couple_welcome_message'],
    estimatedTime: 3,
    weight: 20
  },
  {
    id: 'event',
    title: 'Evento',
    description: 'Fecha, hora y ubicación',
    icon: <Clock className="w-4 h-4" />,
    required: true,
    fields: ['event_date', 'event_time', 'event_venue_name'],
    estimatedTime: 3,
    weight: 20
  },
  {
    id: 'gallery',
    title: 'Galería',
    description: 'Fotos y imagen principal',
    icon: <Target className="w-4 h-4" />,
    required: true,
    fields: ['gallery_hero_image'],
    estimatedTime: 5,
    weight: 15
  },
  {
    id: 'rsvp',
    title: 'RSVP',
    description: 'Configuración de respuestas',
    icon: <TrendingUp className="w-4 h-4" />,
    required: false,
    fields: ['rsvp_enabled', 'rsvp_deadline'],
    estimatedTime: 4,
    weight: 10
  },
  {
    id: 'contact',
    title: 'Contacto',
    description: 'Información de contacto',
    icon: <Zap className="w-4 h-4" />,
    required: false,
    fields: ['contact_email', 'contact_phone'],
    estimatedTime: 3,
    weight: 10
  },
  {
    id: 'review',
    title: 'Revisar',
    description: 'Revisión final y publicación',
    icon: <CheckCircle className="w-4 h-4" />,
    required: true,
    fields: [],
    estimatedTime: 5,
    weight: 10
  }
];

export const CreationProgress: React.FC<CreationProgressProps> = ({
  currentSection = '',
  completionData = {},
  onNavigateToSection,
  showTimeEstimate = true,
  showRewards = true,
  compact = false,
  className = ''
}) => {
  
  // Calculate completion for each section
  const sectionProgress = useMemo(() => {
    return PROGRESS_SECTIONS.map(section => {
      const completedFields = section.fields.filter(field => {
        const value = completionData[field];
        return value !== undefined && value !== null && value !== '';
      });
      
      const completion = section.fields.length === 0 
        ? (section.id === 'review' ? (completionData.published ? 100 : 0) : 0)
        : (completedFields.length / section.fields.length) * 100;
      
      const isComplete = completion === 100;
      const isPartial = completion > 0 && completion < 100;
      const canNavigate = onNavigateToSection && (isComplete || isPartial || section.id === currentSection);
      
      return {
        ...section,
        completion,
        isComplete,
        isPartial,
        canNavigate,
        completedFields: completedFields.length,
        totalFields: section.fields.length
      };
    });
  }, [completionData, currentSection, onNavigateToSection]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalWeight = PROGRESS_SECTIONS.reduce((sum, section) => sum + section.weight, 0);
    const weightedProgress = sectionProgress.reduce((sum, section) => {
      return sum + (section.completion * section.weight / 100);
    }, 0);
    
    return Math.round((weightedProgress / totalWeight) * 100);
  }, [sectionProgress]);

  // Calculate required vs optional progress
  const requiredSections = sectionProgress.filter(s => s.required);
  const requiredProgress = useMemo(() => {
    const totalWeight = requiredSections.reduce((sum, section) => sum + section.weight, 0);
    const weightedProgress = requiredSections.reduce((sum, section) => {
      return sum + (section.completion * section.weight / 100);
    }, 0);
    
    return Math.round((weightedProgress / totalWeight) * 100);
  }, [requiredSections]);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = useMemo(() => {
    return sectionProgress
      .filter(section => section.completion < 100)
      .reduce((sum, section) => {
        const remainingPercent = (100 - section.completion) / 100;
        return sum + (section.estimatedTime * remainingPercent);
      }, 0);
  }, [sectionProgress]);

  // Get current milestone
  const currentMilestone = useMemo(() => {
    if (overallProgress >= 100) return { title: '¡Completado!', icon: <Trophy className="w-5 h-5 text-yellow-500" /> };
    if (overallProgress >= 80) return { title: 'Casi listo', icon: <Target className="w-5 h-5 text-purple-500" /> };
    if (overallProgress >= 60) return { title: 'Buen progreso', icon: <TrendingUp className="w-5 h-5 text-blue-500" /> };
    if (overallProgress >= 40) return { title: 'Avanzando bien', icon: <Zap className="w-5 h-5 text-green-500" /> };
    if (overallProgress >= 20) return { title: 'Empezando', icon: <Circle className="w-5 h-5 text-orange-500" /> };
    return { title: 'Comenzando', icon: <Clock className="w-5 h-5 text-gray-500" /> };
  }, [overallProgress]);

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {currentMilestone.icon}
              <span className="font-medium text-gray-900">{currentMilestone.title}</span>
            </div>
            <Badge variant="outline">{overallProgress}%</Badge>
          </div>
          {showTimeEstimate && estimatedTimeRemaining > 0 && (
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{Math.ceil(estimatedTimeRemaining)} min restantes
            </div>
          )}
        </div>
        
        <Progress value={overallProgress} className="h-2" />
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Obligatorio: {requiredProgress}%</span>
          <span>{sectionProgress.filter(s => s.isComplete).length}/{sectionProgress.length} secciones</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              {currentMilestone.icon}
              Progreso de Creación
            </h3>
            <p className="text-gray-600 mt-1">
              {currentMilestone.title} - {overallProgress}% completado
            </p>
          </div>
          
          {showTimeEstimate && (
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                ~{Math.ceil(estimatedTimeRemaining)}
              </div>
              <div className="text-sm text-gray-600">minutos restantes</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Progress value={overallProgress} className="h-3" />
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Obligatorio: <span className="font-semibold text-green-600">{requiredProgress}%</span>
              </span>
              <span className="text-gray-600">
                Opcional: <span className="font-semibold text-blue-600">
                  {Math.round(((overallProgress - requiredProgress * 0.7) / 0.3) || 0)}%
                </span>
              </span>
            </div>
            <span className="text-gray-600">
              {sectionProgress.filter(s => s.isComplete).length}/{sectionProgress.length} secciones completas
            </span>
          </div>
        </div>
      </div>

      {/* Progress Rewards */}
      {showRewards && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Progreso Destacado</div>
                <div className="text-sm text-gray-600">
                  {overallProgress >= 100 ? '¡Invitación completada! Lista para publicar.' :
                   overallProgress >= 80 ? 'Excelente progreso. Solo faltan algunos detalles.' :
                   overallProgress >= 60 ? 'Vas muy bien. Ya tienes la información esencial.' :
                   overallProgress >= 40 ? 'Buen comienzo. Sigue agregando información.' :
                   'Acabas de comenzar. ¡Sigue adelante!'}
                </div>
              </div>
            </div>
            
            {/* Progress Milestones */}
            <div className="flex items-center gap-2">
              {[25, 50, 75, 100].map(milestone => (
                <div
                  key={milestone}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    overallProgress >= milestone
                      ? 'bg-purple-600 text-white'
                      : overallProgress >= milestone - 10
                      ? 'bg-purple-200 text-purple-600'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {overallProgress >= milestone ? '✓' : milestone}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section List */}
      <div className="p-6">
        <div className="space-y-3">
          {sectionProgress.map((section, index) => (
            <ProgressSectionItem
              key={section.id}
              section={section}
              isActive={currentSection === section.id}
              onNavigate={section.canNavigate ? () => onNavigateToSection?.(section.id) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{sectionProgress.filter(s => s.isComplete).length} completadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-orange-500" />
              <span>{sectionProgress.filter(s => s.isPartial).length} parciales</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span>{sectionProgress.filter(s => !s.isComplete && !s.isPartial).length} pendientes</span>
            </div>
          </div>
          
          <div className="text-gray-600">
            {requiredSections.filter(s => s.isComplete).length}/{requiredSections.length} obligatorias completas
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Section Progress Item
interface ProgressSectionItemProps {
  section: ReturnType<typeof PROGRESS_SECTIONS.map>[0] & {
    completion: number;
    isComplete: boolean;
    isPartial: boolean;
    canNavigate: boolean;
    completedFields: number;
    totalFields: number;
  };
  isActive: boolean;
  onNavigate?: () => void;
}

const ProgressSectionItem: React.FC<ProgressSectionItemProps> = ({
  section,
  isActive,
  onNavigate
}) => {
  const getStatusIcon = () => {
    if (section.isComplete) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (section.isPartial) {
      return (
        <div className="relative w-5 h-5">
          <Circle className="w-5 h-5 text-orange-500" />
          <div 
            className="absolute inset-0 rounded-full bg-orange-500"
            style={{
              clipPath: `polygon(0 0, ${section.completion}% 0, ${section.completion}% 100%, 0 100%)`
            }}
          />
        </div>
      );
    }
    return <Circle className="w-5 h-5 text-gray-300" />;
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
        isActive
          ? 'bg-purple-50 border-2 border-purple-200'
          : section.canNavigate
          ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200'
          : 'bg-gray-50 border border-gray-200'
      }`}
      onClick={onNavigate}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {section.icon}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h4 className={`font-medium ${isActive ? 'text-purple-900' : 'text-gray-900'}`}>
              {section.title}
            </h4>
            {section.required && (
              <Badge variant="outline" className="text-xs">
                Obligatorio
              </Badge>
            )}
          </div>
          <p className={`text-sm ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>
            {section.description}
          </p>
          {section.totalFields > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {section.completedFields}/{section.totalFields} campos completados
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`text-sm font-medium ${
            section.isComplete ? 'text-green-600' :
            section.isPartial ? 'text-orange-600' :
            'text-gray-400'
          }`}>
            {Math.round(section.completion)}%
          </div>
          <div className="text-xs text-gray-500">
            ~{section.estimatedTime} min
          </div>
        </div>
        
        <div className="w-16">
          <Progress 
            value={section.completion} 
            className="h-2"
          />
        </div>
      </div>
    </div>
  );
};

export default CreationProgress;