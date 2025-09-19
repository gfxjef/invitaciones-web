/**
 * Basic Information Step Component
 * 
 * WHY: Second step of the wizard that collects essential information
 * about the couple and wedding event. This forms the core data that
 * will be displayed prominently in the invitation.
 * 
 * WHAT: Form collecting couple names, wedding date and time, primary
 * venue information, and welcome message. All fields are validated
 * for format and completeness.
 * 
 * HOW: Uses controlled inputs with real-time validation, date/time
 * pickers for accurate event scheduling, and text areas for messages.
 */

import React from 'react';
import { Calendar, MapPin, Heart, Clock } from 'lucide-react';
import { WizardStep, StepSection, StepField } from '../WizardStep';
import { WizardStepProps } from '../InvitationWizard';

export const BasicInformationStep: React.FC<WizardStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext,
  onBack,
  isValid,
  isLoading
}) => {
  const handleContinue = () => {
    if (isValid) {
      onNext();
    }
  };

  // Helper to get field error
  const getError = (section: string, field: string) => {
    return errors[section]?.[field];
  };

  return (
    <WizardStep isLoading={isLoading}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Couple Information */}
        <div className="space-y-6">
          <StepSection 
            title="Información de la Pareja"
            description="Los nombres que aparecerán en tu invitación"
          >
            <StepField 
              label="Nombre del Novio" 
              required
              error={getError('couple', 'couple_groom_name')}
            >
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Ej: Carlos Eduardo"
                  value={data.couple_groom_name || ''}
                  onChange={(e) => onUpdate('couple', 'couple_groom_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </StepField>

            <StepField 
              label="Nombre de la Novia" 
              required
              error={getError('couple', 'couple_bride_name')}
            >
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Ej: María Isabel"
                  value={data.couple_bride_name || ''}
                  onChange={(e) => onUpdate('couple', 'couple_bride_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </StepField>

            <StepField 
              label="Mensaje de Bienvenida" 
              description="Un mensaje especial para tus invitados (opcional)"
              error={getError('couple', 'couple_welcome_message')}
            >
              <textarea
                placeholder="Ej: Con gran alegría te invitamos a celebrar nuestro matrimonio..."
                value={data.couple_welcome_message || ''}
                onChange={(e) => onUpdate('couple', 'couple_welcome_message', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {(data.couple_welcome_message || '').length}/500
              </div>
            </StepField>

            <StepField 
              label="Frase Especial" 
              description="Una cita o frase que represente su amor (opcional)"
              error={getError('couple', 'couple_quote')}
            >
              <input
                type="text"
                placeholder='Ej: "Dos almas, un corazón"'
                value={data.couple_quote || ''}
                onChange={(e) => onUpdate('couple', 'couple_quote', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                maxLength={200}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {(data.couple_quote || '').length}/200
              </div>
            </StepField>
          </StepSection>
        </div>

        {/* Right Column - Event Information */}
        <div className="space-y-6">
          <StepSection 
            title="Información del Evento"
            description="Detalles principales de la celebración"
          >
            <StepField 
              label="Fecha del Evento" 
              required
              error={getError('event', 'event_date')}
            >
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={data.event_date || ''}
                  onChange={(e) => onUpdate('event', 'event_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </StepField>

            <StepField 
              label="Hora del Evento" 
              required
              error={getError('event', 'event_time')}
            >
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="time"
                  value={data.event_time || ''}
                  onChange={(e) => onUpdate('event', 'event_time', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </StepField>

            <StepField 
              label="Nombre del Venue" 
              required
              error={getError('event', 'event_venue_name')}
            >
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Ej: Salón Los Jardines"
                  value={data.event_venue_name || ''}
                  onChange={(e) => onUpdate('event', 'event_venue_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </StepField>

            <StepField 
              label="Dirección del Venue" 
              description="Dirección completa del lugar (opcional)"
              error={getError('event', 'event_venue_address')}
            >
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  placeholder="Ej: Av. Primavera 123, San Borja, Lima"
                  value={data.event_venue_address || ''}
                  onChange={(e) => onUpdate('event', 'event_venue_address', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
              </div>
            </StepField>
          </StepSection>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8">
        <StepSection 
          title="Vista Previa"
          description="Así se verá la información en tu invitación"
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
            <div className="text-center space-y-4">
              {/* Couple Names */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {data.couple_groom_name || 'Nombre del Novio'}
                  {(data.couple_groom_name || data.couple_bride_name) && (
                    <span className="text-purple-600 mx-3">&</span>
                  )}
                  {data.couple_bride_name || 'Nombre de la Novia'}
                </h2>
                {data.couple_quote && (
                  <p className="text-lg italic text-gray-600 font-medium">
                    "{data.couple_quote}"
                  </p>
                )}
              </div>

              {/* Welcome Message */}
              {data.couple_welcome_message && (
                <div className="max-w-2xl mx-auto">
                  <p className="text-gray-700 leading-relaxed">
                    {data.couple_welcome_message}
                  </p>
                </div>
              )}

              {/* Event Details */}
              <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
                <div className="flex items-center gap-6 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">
                      {data.event_date ? 
                        new Date(data.event_date + 'T00:00:00').toLocaleDateString('es-PE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        'Fecha del evento'
                      }
                    </span>
                  </div>
                  {data.event_time && (
                    <>
                      <div className="w-px h-6 bg-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">
                          {new Date(`2000-01-01T${data.event_time}:00`).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {data.event_venue_name && (
                  <div className="flex items-start gap-2 mt-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{data.event_venue_name}</div>
                      {data.event_venue_address && (
                        <div className="text-sm text-gray-600 mt-1">
                          {data.event_venue_address}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </StepSection>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Volver a plantillas
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`px-8 py-2 rounded-lg font-medium transition-colors ${
            isValid
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continuar →
        </button>
      </div>
    </WizardStep>
  );
};

export default BasicInformationStep;