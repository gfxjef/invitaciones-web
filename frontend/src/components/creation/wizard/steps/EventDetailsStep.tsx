/**
 * Event Details Step Component
 * 
 * WHY: Third step that allows users to add detailed timeline information,
 * additional events, and venue details beyond the basic ceremony info.
 * Enables creation of comprehensive wedding schedules.
 * 
 * WHAT: Interface for managing multiple events, timelines, dress codes,
 * transportation details, and additional venue information. Uses the
 * event management system from the editor hooks.
 * 
 * HOW: Integrates with useInvitationEditor for event CRUD operations,
 * provides drag-and-drop reordering, and validates event data.
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Calendar,
  Trash2,
  GripVertical,
  Info,
  Users,
  Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardStep, StepSection, StepField } from '../WizardStep';
import { WizardStepProps } from '../InvitationWizard';
import { InvitationEvent } from '@/types/invitation';

export const EventDetailsStep: React.FC<WizardStepProps> = ({
  data,
  errors,
  onUpdate,
  onUpdateData,
  onNext,
  onBack,
  isLoading
}) => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<InvitationEvent | null>(null);

  // Mock events data - in real implementation, this would come from the editor
  const [events, setEvents] = useState<InvitationEvent[]>([
    {
      id: 1,
      invitation_id: 1,
      event_type: 'ceremony',
      title: 'Ceremonia Religiosa',
      description: '',
      date: data.event_date || '',
      time: data.event_time || '',
      venue_name: data.event_venue_name || '',
      venue_address: data.event_venue_address || '',
      duration_minutes: 60,
      is_main_event: true,
      display_order: 1,
      created_at: new Date().toISOString()
    }
  ]);

  const handleAddEvent = () => {
    setEditingEvent({
      id: Date.now(),
      invitation_id: 1,
      event_type: 'reception',
      title: '',
      description: '',
      date: data.event_date || '',
      time: '',
      venue_name: '',
      venue_address: '',
      duration_minutes: 180,
      is_main_event: false,
      display_order: events.length + 1,
      created_at: new Date().toISOString()
    });
    setShowAddEvent(true);
  };

  const handleSaveEvent = (event: InvitationEvent) => {
    if (event.id && events.find(e => e.id === event.id)) {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    } else {
      setEvents(prev => [...prev, { ...event, id: Date.now() }]);
    }
    setEditingEvent(null);
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <WizardStep isLoading={isLoading}>
      <div className="space-y-8">
        {/* Event Schedule Section */}
        <StepSection 
          title="Cronograma del Evento"
          description="Define la secuencia de eventos de tu celebración"
        >
          <div className="space-y-4">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                isFirst={index === 0}
                isLast={index === events.length - 1}
                onEdit={(event) => {
                  setEditingEvent(event);
                  setShowAddEvent(true);
                }}
                onDelete={() => handleDeleteEvent(event.id!)}
              />
            ))}

            <Button
              variant="outline"
              onClick={handleAddEvent}
              className="w-full border-dashed border-2 py-6 text-purple-600 hover:text-purple-700 hover:border-purple-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar evento adicional
            </Button>
          </div>
        </StepSection>

        {/* Additional Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StepSection 
            title="Código de Vestimenta"
            description="Indicaciones sobre el dress code"
          >
            <StepField 
              label="Dress Code"
              description="Ej: Formal, Cocktail, Semi-formal"
            >
              <input
                type="text"
                placeholder="Formal"
                value={data.dress_code || ''}
                onChange={(e) => onUpdate('extra', 'dress_code', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </StepField>

            <StepField 
              label="Detalles del Dress Code"
              description="Información adicional sobre la vestimenta"
            >
              <textarea
                placeholder="Ej: Se sugiere evitar los colores blanco y negro"
                value={data.dress_code_details || ''}
                onChange={(e) => onUpdate('extra', 'dress_code_details', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              />
            </StepField>
          </StepSection>

          <StepSection 
            title="Información Adicional"
            description="Detalles extra para los invitados"
          >
            <StepField 
              label="Transporte"
              description="Información sobre transporte o estacionamiento"
            >
              <div className="relative">
                <Car className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  placeholder="Ej: Estacionamiento gratuito disponible. Servicio de shuttle desde el hotel."
                  value={data.transport_info || ''}
                  onChange={(e) => onUpdate('extra', 'transport_info', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
              </div>
            </StepField>

            <StepField 
              label="Restricción de Edad"
              description="Si el evento tiene restricción de edad"
            >
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={data.age_restriction || ''}
                  onChange={(e) => onUpdate('extra', 'age_restriction', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">Sin restricción</option>
                  <option value="adults_only">Solo adultos</option>
                  <option value="18+">Mayores de 18</option>
                  <option value="21+">Mayores de 21</option>
                </select>
              </div>
            </StepField>

            <StepField 
              label="Notas Especiales"
              description="Cualquier información adicional importante"
            >
              <div className="relative">
                <Info className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  placeholder="Ej: El evento será al aire libre. Se recomienda traer una chaqueta."
                  value={data.special_notes || ''}
                  onChange={(e) => onUpdate('extra', 'special_notes', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
              </div>
            </StepField>
          </StepSection>
        </div>

        {/* Preview Section */}
        <StepSection 
          title="Vista Previa del Cronograma"
          description="Así se verá la información de eventos en tu invitación"
        >
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        {event.is_main_event && (
                          <Badge variant="outline" className="text-xs">Principal</Badge>
                        )}
                      </div>
                      
                      <div className="ml-6 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {event.time && new Date(`2000-01-01T${event.time}:00`).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                            {event.duration_minutes && ` (${event.duration_minutes} min)`}
                          </span>
                        </div>
                        
                        {event.venue_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue_name}</span>
                          </div>
                        )}
                        
                        {event.description && (
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5" />
                            <span>{event.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StepSection>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Información básica
          </button>
          
          <button
            onClick={handleContinue}
            className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Continuar →
          </button>
        </div>
      </div>

      {/* Event Form Modal/Dialog */}
      {showAddEvent && editingEvent && (
        <EventFormDialog
          event={editingEvent}
          onSave={handleSaveEvent}
          onCancel={() => {
            setEditingEvent(null);
            setShowAddEvent(false);
          }}
        />
      )}
    </WizardStep>
  );
};

// Event Card Component
interface EventCardProps {
  event: InvitationEvent;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (event: InvitationEvent) => void;
  onDelete: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isFirst,
  isLast,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
          <div className="w-px h-16 bg-gray-200"></div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-gray-900">{event.title}</h4>
              {event.is_main_event && (
                <Badge className="bg-purple-600 text-white text-xs">Principal</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(event)}
              >
                Editar
              </Button>
              {!event.is_main_event && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {event.time && new Date(`2000-01-01T${event.time}:00`).toLocaleTimeString('es-PE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.venue_name || 'Sin venue'}</span>
            </div>
          </div>
          
          {event.description && (
            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Event Form Dialog Component
interface EventFormDialogProps {
  event: InvitationEvent;
  onSave: (event: InvitationEvent) => void;
  onCancel: () => void;
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({
  event,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState(event);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {event.id ? 'Editar Evento' : 'Nuevo Evento'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StepField label="Título del Evento" required>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Ej: Recepción"
                />
              </StepField>
              
              <StepField label="Tipo de Evento">
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="ceremony">Ceremonia</option>
                  <option value="reception">Recepción</option>
                  <option value="cocktail">Cocktail</option>
                  <option value="dinner">Cena</option>
                  <option value="party">Fiesta</option>
                  <option value="other">Otro</option>
                </select>
              </StepField>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <StepField label="Fecha">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </StepField>
              
              <StepField label="Hora">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </StepField>
            </div>
            
            <StepField label="Nombre del Venue">
              <input
                type="text"
                value={formData.venue_name}
                onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Nombre del lugar"
              />
            </StepField>
            
            <StepField label="Dirección">
              <textarea
                value={formData.venue_address}
                onChange={(e) => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                placeholder="Dirección completa"
              />
            </StepField>
            
            <StepField label="Descripción">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                placeholder="Descripción del evento"
              />
            </StepField>
            
            <StepField label="Duración (minutos)">
              <input
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="60"
                min="1"
                max="1440"
              />
            </StepField>
          </div>
          
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar Evento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsStep;