/**
 * RSVP Configuration Step Component
 * 
 * WHY: Fifth step that configures guest response settings and manages
 * the invitation list. Critical for event planning and guest management.
 * Allows couples to track attendance and collect important information.
 * 
 * WHAT: Interface for enabling/disabling RSVP, setting deadlines,
 * configuring guest limits, collecting dietary preferences, and
 * setting up response tracking. Includes guest list management.
 * 
 * HOW: Uses form controls for RSVP settings, date pickers for deadlines,
 * and dynamic forms for guest information collection preferences.
 */

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  UserPlus, 
  UserMinus,
  Mail,
  Phone,
  MessageCircle,
  Utensils,
  Heart,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardStep, StepSection, StepField } from '../WizardStep';
import { WizardStepProps } from '../InvitationWizard';

export const RSVPConfigurationStep: React.FC<WizardStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext,
  onBack,
  isLoading
}) => {
  const [rsvpEnabled, setRsvpEnabled] = useState(data.rsvp_enabled || false);
  const [guestFields, setGuestFields] = useState({
    collectPhone: data.rsvp_collect_phone || false,
    collectEmail: data.rsvp_collect_email || false,
    collectDietary: data.rsvp_collect_dietary || false,
    collectMessage: data.rsvp_collect_message || false,
    allowCompanions: data.rsvp_allow_companions || false
  });

  const handleRSVPToggle = (enabled: boolean) => {
    setRsvpEnabled(enabled);
    onUpdate('rsvp', 'rsvp_enabled', enabled);
    
    if (!enabled) {
      // Clear RSVP-related fields when disabled
      onUpdate('rsvp', 'rsvp_deadline', '');
      onUpdate('rsvp', 'rsvp_guest_limit', null);
      onUpdate('rsvp', 'rsvp_max_companions', null);
    }
  };

  const handleFieldToggle = (field: keyof typeof guestFields, value: boolean) => {
    setGuestFields(prev => ({ ...prev, [field]: value }));
    onUpdate('rsvp', `rsvp_${field.replace(/([A-Z])/g, '_$1').toLowerCase()}`, value);
  };

  const handleContinue = () => {
    onNext();
  };

  const getError = (section: string, field: string) => {
    return errors[section]?.[field];
  };

  return (
    <WizardStep isLoading={isLoading}>
      <div className="space-y-8">
        {/* RSVP Toggle */}
        <StepSection 
          title="Configuración RSVP"
          description="Decide si quieres recopilar confirmaciones de asistencia de tus invitados"
        >
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Habilitar RSVP?
                </h3>
                <p className="text-gray-600">
                  Permite a tus invitados confirmar su asistencia directamente desde la invitación
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rsvp_enabled"
                    checked={!rsvpEnabled}
                    onChange={() => handleRSVPToggle(false)}
                    className="sr-only"
                  />
                  <div className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    !rsvpEnabled 
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>
                    No, solo información
                  </div>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rsvp_enabled"
                    checked={rsvpEnabled}
                    onChange={() => handleRSVPToggle(true)}
                    className="sr-only"
                  />
                  <div className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    rsvpEnabled 
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>
                    Sí, recopilar RSVP
                  </div>
                </label>
              </div>
            </div>
            
            {!rsvpEnabled && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div className="text-blue-800">
                    <p className="font-medium mb-1">Modo solo información</p>
                    <p className="text-sm">
                      Tu invitación mostrará todos los detalles del evento, pero los invitados 
                      no podrán confirmar asistencia desde la plataforma.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </StepSection>

        {/* RSVP Settings */}
        {rsvpEnabled && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic RSVP Settings */}
              <StepSection 
                title="Configuración Básica"
                description="Configuraciones principales del RSVP"
              >
                <StepField 
                  label="Fecha límite para RSVP"
                  description="Fecha hasta la cual los invitados pueden confirmar"
                  error={getError('rsvp', 'rsvp_deadline')}
                >
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={data.rsvp_deadline || ''}
                      onChange={(e) => onUpdate('rsvp', 'rsvp_deadline', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </StepField>

                <StepField 
                  label="Límite total de invitados"
                  description="Número máximo de personas que pueden confirmar (opcional)"
                  error={getError('rsvp', 'rsvp_guest_limit')}
                >
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      placeholder="Sin límite"
                      value={data.rsvp_guest_limit || ''}
                      onChange={(e) => onUpdate('rsvp', 'rsvp_guest_limit', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      min="1"
                      max="1000"
                    />
                  </div>
                </StepField>

                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guestFields.allowCompanions}
                      onChange={(e) => handleFieldToggle('allowCompanions', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Permitir acompañantes
                    </span>
                  </label>

                  {guestFields.allowCompanions && (
                    <StepField 
                      label="Máximo de acompañantes por invitado"
                      error={getError('rsvp', 'rsvp_max_companions')}
                    >
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          placeholder="3"
                          value={data.rsvp_max_companions || ''}
                          onChange={(e) => onUpdate('rsvp', 'rsvp_max_companions', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          min="0"
                          max="10"
                        />
                      </div>
                    </StepField>
                  )}
                </div>
              </StepSection>

              {/* Data Collection Settings */}
              <StepSection 
                title="Información a Recopilar"
                description="Selecciona qué información adicional quieres obtener"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-start cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={guestFields.collectEmail}
                        onChange={(e) => handleFieldToggle('collectEmail', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium text-gray-900">Email</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Para enviar recordatorios y actualizaciones
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={guestFields.collectPhone}
                        onChange={(e) => handleFieldToggle('collectPhone', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium text-gray-900">Teléfono</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Para contacto directo si es necesario
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={guestFields.collectDietary}
                        onChange={(e) => handleFieldToggle('collectDietary', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Utensils className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium text-gray-900">Preferencias Alimentarias</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Alergias, vegetariano, vegano, etc.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={guestFields.collectMessage}
                        onChange={(e) => handleFieldToggle('collectMessage', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium text-gray-900">Mensaje Personal</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Permite a los invitados dejar un mensaje para ustedes
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </StepSection>
            </div>

            {/* RSVP Messages */}
            <StepSection 
              title="Mensajes Personalizados"
              description="Personaliza los mensajes que verán tus invitados"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StepField 
                  label="Mensaje de confirmación"
                  description="Mensaje que verán al confirmar asistencia"
                >
                  <textarea
                    placeholder="¡Gracias por confirmar! Esperamos verte en nuestro gran día."
                    value={data.rsvp_confirmation_message || ''}
                    onChange={(e) => onUpdate('rsvp', 'rsvp_confirmation_message', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    maxLength={300}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {(data.rsvp_confirmation_message || '').length}/300
                  </div>
                </StepField>

                <StepField 
                  label="Mensaje de declinación"
                  description="Mensaje que verán al declinar la invitación"
                >
                  <textarea
                    placeholder="Entendemos que no puedas acompañarnos. ¡Esperamos verte pronto!"
                    value={data.rsvp_decline_message || ''}
                    onChange={(e) => onUpdate('rsvp', 'rsvp_decline_message', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    maxLength={300}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {(data.rsvp_decline_message || '').length}/300
                  </div>
                </StepField>
              </div>
            </StepSection>

            {/* Preview */}
            <StepSection 
              title="Vista Previa del RSVP"
              description="Así se verá el formulario de RSVP para tus invitados"
            >
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Confirma tu Asistencia
                    </h3>
                    <p className="text-gray-600">
                      Por favor confirma antes del{' '}
                      {data.rsvp_deadline ? 
                        new Date(data.rsvp_deadline + 'T00:00:00').toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 
                        '[fecha límite]'
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                        Asistiré
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <UserMinus className="w-4 h-4 mx-auto mb-1" />
                        No podré ir
                      </button>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        disabled
                      />
                      
                      {guestFields.collectEmail && (
                        <input
                          type="email"
                          placeholder="Email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}
                      
                      {guestFields.collectPhone && (
                        <input
                          type="tel"
                          placeholder="Teléfono"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}
                      
                      {guestFields.allowCompanions && (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                          <option>Número de acompañantes</option>
                          <option>0</option>
                          <option>1</option>
                          <option>2</option>
                        </select>
                      )}
                      
                      {guestFields.collectDietary && (
                        <textarea
                          placeholder="Preferencias alimentarias o alergias"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                          disabled
                        />
                      )}
                      
                      {guestFields.collectMessage && (
                        <textarea
                          placeholder="Mensaje para los novios (opcional)"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                          disabled
                        />
                      )}
                    </div>

                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium" disabled>
                      Confirmar Respuesta
                    </button>
                  </div>
                </div>
              </div>
            </StepSection>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Galería
          </button>
          
          <button
            onClick={handleContinue}
            className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Continuar →
          </button>
        </div>
      </div>
    </WizardStep>
  );
};

export default RSVPConfigurationStep;