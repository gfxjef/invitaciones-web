/**
 * ScheduleEditor Component
 * 
 * WHY: Provides comprehensive wedding timeline management with visual timeline,
 * drag-and-drop event reordering, time conflict detection, and event creation.
 * Essential for couples to organize their wedding day schedule effectively.
 * 
 * WHAT: Interactive timeline interface with event creation, editing, reordering,
 * and validation. Includes time conflict detection, duration management, and
 * mobile-responsive design with touch support.
 * 
 * HOW: Uses drag-and-drop API for reordering, time calculations for conflicts,
 * and integrates with the invitation editor hooks for data persistence.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Plus,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  GripVertical,
  AlertTriangle,
  Check,
  X,
  Calendar,
  Users,
  Heart,
  Music,
  Camera,
  Utensils,
  Car,
  Home,
  Star
} from 'lucide-react';
import { useInvitationEditor } from '../../../lib/hooks/useInvitationEditor';
import { InvitationEvent } from '../../../types/invitation';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface ScheduleEditorProps {
  /**
   * Invitation ID
   */
  invitationId: number;
  
  /**
   * Current events list
   */
  events: InvitationEvent[];
  
  /**
   * Wedding date (for context)
   */
  weddingDate?: string;
  
  /**
   * Timeline view mode
   */
  viewMode?: 'timeline' | 'list' | 'grid';
  
  /**
   * Allow event creation
   */
  allowCreate?: boolean;
  
  /**
   * Allow event editing
   */
  allowEdit?: boolean;
  
  /**
   * Allow event deletion
   */
  allowDelete?: boolean;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Callback when events are reordered
   */
  onEventsReordered?: (newOrder: InvitationEvent[]) => void;
  
  /**
   * Callback when event is created
   */
  onEventCreated?: (event: InvitationEvent) => void;
  
  /**
   * Callback when event is updated
   */
  onEventUpdated?: (eventId: number, updates: Partial<InvitationEvent>) => void;
  
  /**
   * Callback when event is deleted
   */
  onEventDeleted?: (eventId: number) => void;
}

interface NewEventForm {
  event_name: string;
  event_datetime: string;
  event_venue?: string;
  event_address?: string;
  event_description?: string;
  event_icon?: string;
  duration?: number; // in minutes
}

interface EventEditForm extends InvitationEvent {
  duration?: number;
}

interface TimeConflict {
  eventId: number;
  conflictsWith: number[];
  type: 'overlap' | 'too_close' | 'invalid_order';
}

/**
 * Event icons mapping
 */
const EVENT_ICONS = {
  ceremony: Heart,
  reception: Music,
  cocktail: Utensils,
  photos: Camera,
  transport: Car,
  accommodation: Home,
  other: Star
};

/**
 * Default event types for quick selection
 */
const DEFAULT_EVENT_TYPES = [
  { name: 'Ceremonia Civil', icon: 'ceremony', duration: 60, venue: 'Registro Civil' },
  { name: 'Ceremonia Religiosa', icon: 'ceremony', duration: 90, venue: 'Iglesia' },
  { name: 'Sesión de Fotos', icon: 'photos', duration: 120, venue: 'Parque/Estudio' },
  { name: 'Cóctel', icon: 'cocktail', duration: 90, venue: 'Salón de eventos' },
  { name: 'Recepción', icon: 'reception', duration: 300, venue: 'Salón de fiestas' },
  { name: 'Transporte', icon: 'transport', duration: 30, venue: 'Punto de encuentro' }
];

/**
 * Comprehensive wedding timeline editor
 */
export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  invitationId,
  events,
  weddingDate,
  viewMode = 'timeline',
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  className,
  onEventsReordered,
  onEventCreated,
  onEventUpdated,
  onEventDeleted
}) => {
  // ================
  // STATE
  // ================
  
  const [localEvents, setLocalEvents] = useState<InvitationEvent[]>(events);
  const [draggedEvent, setDraggedEvent] = useState<InvitationEvent | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventEditForm | null>(null);
  const [newEventForm, setNewEventForm] = useState<NewEventForm>({
    event_name: '',
    event_datetime: '',
    duration: 60
  });
  const [timeConflicts, setTimeConflicts] = useState<TimeConflict[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  
  // ================
  // REFS
  // ================
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  
  // ================
  // HOOKS
  // ================
  
  const { addEvent, updateEvent, deleteEvent, reorderEvents } = useInvitationEditor(invitationId);
  
  // ================
  // EFFECTS
  // ================
  
  // Update local events when props change
  useEffect(() => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.event_datetime).getTime() - new Date(b.event_datetime).getTime()
    );
    setLocalEvents(sortedEvents);
  }, [events]);
  
  // Check for time conflicts whenever events change
  useEffect(() => {
    checkTimeConflicts();
  }, [localEvents]);
  
  // ================
  // TIME UTILITIES
  // ================
  
  const formatTime = useCallback((datetime: string): string => {
    return new Date(datetime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  const formatDateTime = useCallback((datetime: string): string => {
    return new Date(datetime).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  const calculateEventEnd = useCallback((startTime: string, durationMinutes: number = 60): Date => {
    const start = new Date(startTime);
    return new Date(start.getTime() + durationMinutes * 60000);
  }, []);
  
  const checkTimeConflicts = useCallback(() => {
    const conflicts: TimeConflict[] = [];
    const sortedEvents = [...localEvents].sort((a, b) => 
      new Date(a.event_datetime).getTime() - new Date(b.event_datetime).getTime()
    );
    
    sortedEvents.forEach((event, index) => {
      if (!event.id) return;
      
      const eventStart = new Date(event.event_datetime);
      const eventEnd = calculateEventEnd(event.event_datetime, 60); // Default 60 minutes
      const conflictsWith: number[] = [];
      
      // Check overlaps with other events
      sortedEvents.forEach((otherEvent, otherIndex) => {
        if (index === otherIndex || !otherEvent.id) return;
        
        const otherStart = new Date(otherEvent.event_datetime);
        const otherEnd = calculateEventEnd(otherEvent.event_datetime, 60);
        
        // Check for overlap
        if (eventStart < otherEnd && eventEnd > otherStart) {
          conflictsWith.push(otherEvent.id);
        }
        
        // Check if events are too close (less than 15 minutes apart)
        const timeDiff = Math.abs(eventStart.getTime() - otherStart.getTime());
        if (timeDiff > 0 && timeDiff < 15 * 60000) { // 15 minutes
          if (!conflictsWith.includes(otherEvent.id)) {
            conflictsWith.push(otherEvent.id);
          }
        }
      });
      
      if (conflictsWith.length > 0) {
        conflicts.push({
          eventId: event.id,
          conflictsWith,
          type: 'overlap'
        });
      }
    });
    
    setTimeConflicts(conflicts);
  }, [localEvents, calculateEventEnd]);
  
  // ================
  // DRAG AND DROP
  // ================
  
  const handleDragStart = useCallback((e: React.DragEvent, event: InvitationEvent, index: number) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);
  
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedEvent(null);
    setDragOverIndex(null);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(targetIndex);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverIndex(null);
    
    if (!draggedEvent) return;
    
    const dragIndex = localEvents.findIndex(evt => evt.id === draggedEvent.id);
    if (dragIndex === -1 || dragIndex === dropIndex) return;
    
    // Reorder events
    const newEvents = [...localEvents];
    const [movedEvent] = newEvents.splice(dragIndex, 1);
    newEvents.splice(dropIndex, 0, movedEvent);
    
    // Update order field
    const reorderedEvents = newEvents.map((evt, index) => ({
      ...evt,
      event_order: index
    }));
    
    setLocalEvents(reorderedEvents);
    
    try {
      await reorderEvents(reorderedEvents.map(evt => evt.id!).filter(Boolean));
      
      if (onEventsReordered) {
        onEventsReordered(reorderedEvents);
      }
    } catch (error) {
      console.error('Error reordering events:', error);
      // Revert on error
      setLocalEvents(events);
    }
  }, [draggedEvent, localEvents, events, reorderEvents, onEventsReordered]);
  
  // ================
  // EVENT HANDLERS
  // ================
  
  const handleCreateEvent = useCallback(async (formData: NewEventForm) => {
    try {
      const eventData = {
        event_name: formData.event_name,
        event_datetime: formData.event_datetime,
        event_venue: formData.event_venue,
        event_address: formData.event_address,
        event_description: formData.event_description,
        event_icon: formData.event_icon,
        event_order: localEvents.length
      };
      
      const createdEvent = await addEvent(eventData);
      
      if (onEventCreated) {
        onEventCreated(createdEvent);
      }
      
      setShowNewEventForm(false);
      setNewEventForm({
        event_name: '',
        event_datetime: '',
        duration: 60
      });
      
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }, [localEvents.length, addEvent, onEventCreated]);
  
  const handleUpdateEvent = useCallback(async (eventId: number, updates: Partial<InvitationEvent>) => {
    try {
      await updateEvent(eventId, updates);
      
      setLocalEvents(prev => prev.map(evt => 
        evt.id === eventId ? { ...evt, ...updates } : evt
      ));
      
      if (onEventUpdated) {
        onEventUpdated(eventId, updates);
      }
      
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }, [updateEvent, onEventUpdated]);
  
  const handleDeleteEvent = useCallback(async (eventId: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      await deleteEvent(eventId);
      
      setLocalEvents(prev => prev.filter(evt => evt.id !== eventId));
      
      if (onEventDeleted) {
        onEventDeleted(eventId);
      }
      
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, [deleteEvent, onEventDeleted]);
  
  // ================
  // FORM HANDLERS
  // ================
  
  const handleQuickEventAdd = useCallback((eventType: typeof DEFAULT_EVENT_TYPES[0]) => {
    const now = new Date();
    if (weddingDate) {
      const weddingDay = new Date(weddingDate);
      now.setFullYear(weddingDay.getFullYear(), weddingDay.getMonth(), weddingDay.getDate());
    }
    
    setNewEventForm({
      event_name: eventType.name,
      event_datetime: now.toISOString().slice(0, 16),
      event_venue: eventType.venue,
      event_icon: eventType.icon,
      duration: eventType.duration
    });
    setShowNewEventForm(true);
  }, [weddingDate]);
  
  // ================
  // RENDER HELPERS
  // ================
  
  const renderEventIcon = (iconName?: string, className = "w-5 h-5") => {
    const IconComponent = iconName ? EVENT_ICONS[iconName as keyof typeof EVENT_ICONS] : Star;
    return <IconComponent className={className} />;
  };
  
  const renderTimelineView = () => {
    if (localEvents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Calendar className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium mb-2">No hay eventos programados</p>
          <p className="text-sm">Agrega el primer evento para comenzar tu timeline</p>
        </div>
      );
    }
    
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />
        
        {/* Events */}
        <div className="space-y-6">
          {localEvents.map((event, index) => {
            const hasConflict = timeConflicts.some(conflict => conflict.eventId === event.id);
            const isDraggedOver = dragOverIndex === index && draggedEvent?.id !== event.id;
            
            return (
              <div
                key={event.id}
                className={cn(
                  "relative flex items-start gap-4 group transition-all duration-200",
                  isDraggedOver && "transform translate-y-2 bg-blue-50 rounded-lg p-2"
                )}
                draggable={allowEdit}
                onDragStart={(e) => handleDragStart(e, event, index)}
                onDragEnd={handleDragEnd}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 bg-white transition-colors",
                  hasConflict ? "border-red-400" : "border-gray-300 group-hover:border-primary"
                )}>
                  {renderEventIcon(event.event_icon, "w-6 h-6 text-gray-600")}
                  
                  {hasConflict && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Event card */}
                <div className={cn(
                  "flex-1 bg-white rounded-lg border shadow-sm p-4 transition-shadow group-hover:shadow-md",
                  hasConflict && "border-red-200 bg-red-50"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{event.event_name}</h3>
                        {allowEdit && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(event.event_datetime)}
                        </div>
                        
                        {event.event_venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.event_venue}
                          </div>
                        )}
                      </div>
                      
                      {event.event_description && (
                        <p className="text-sm text-gray-700 mb-2">{event.event_description}</p>
                      )}
                      
                      {event.event_address && (
                        <p className="text-xs text-gray-500">{event.event_address}</p>
                      )}
                      
                      {hasConflict && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Conflicto de horario detectado
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    {(allowEdit || allowDelete) && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {allowEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingEvent({ ...event, duration: 60 })}
                            className="h-8 w-8 p-0"
                            title="Editar evento"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {allowDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => event.id && handleDeleteEvent(event.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderNewEventForm = () => {
    if (!showNewEventForm) return null;
    
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nuevo Evento</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewEventForm(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del evento *
            </label>
            <input
              type="text"
              value={newEventForm.event_name}
              onChange={(e) => setNewEventForm(prev => ({ ...prev, event_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej. Ceremonia Civil"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora *
              </label>
              <input
                type="datetime-local"
                value={newEventForm.event_datetime}
                onChange={(e) => setNewEventForm(prev => ({ ...prev, event_datetime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                min="15"
                max="600"
                value={newEventForm.duration}
                onChange={(e) => setNewEventForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar
            </label>
            <input
              type="text"
              value={newEventForm.event_venue || ''}
              onChange={(e) => setNewEventForm(prev => ({ ...prev, event_venue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ej. Iglesia San Pedro"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={newEventForm.event_address || ''}
              onChange={(e) => setNewEventForm(prev => ({ ...prev, event_address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Av. Principal 123, Ciudad"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={newEventForm.event_description || ''}
              onChange={(e) => setNewEventForm(prev => ({ ...prev, event_description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={2}
              placeholder="Detalles adicionales del evento"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icono del evento
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(EVENT_ICONS).map(([key, IconComponent]) => (
                <Button
                  key={key}
                  variant={newEventForm.event_icon === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewEventForm(prev => ({ ...prev, event_icon: key }))}
                  className="h-10 w-10 p-0"
                  title={key}
                >
                  <IconComponent className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowNewEventForm(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleCreateEvent(newEventForm)}
              disabled={!newEventForm.event_name || !newEventForm.event_datetime}
            >
              Crear Evento
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderQuickActions = () => {
    if (!allowCreate) return null;
    
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Eventos sugeridos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {DEFAULT_EVENT_TYPES.map((eventType, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickEventAdd(eventType)}
              className="h-auto p-3 flex flex-col items-center gap-1 text-xs"
            >
              {renderEventIcon(eventType.icon, "w-5 h-5")}
              {eventType.name}
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
  // ================
  // RENDER
  // ================
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Timeline del Evento</h2>
          <p className="text-sm text-gray-600">
            {localEvents.length} evento{localEvents.length !== 1 ? 's' : ''} programado{localEvents.length !== 1 ? 's' : ''}
            {weddingDate && ` para el ${new Date(weddingDate).toLocaleDateString('es-ES')}`}
          </p>
        </div>
        
        {allowCreate && !showNewEventForm && (
          <Button
            onClick={() => setShowNewEventForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </Button>
        )}
      </div>
      
      {/* Quick actions */}
      {renderQuickActions()}
      
      {/* New event form */}
      {renderNewEventForm()}
      
      {/* Conflicts warning */}
      {timeConflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 mb-1">
                Conflictos de horario detectados
              </h3>
              <p className="text-sm text-red-700">
                Algunos eventos tienen horarios que se superponen o están muy cerca entre sí.
                Revisa los horarios para asegurar que todo fluya correctamente.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Timeline */}
      <div ref={timelineRef} className="bg-white rounded-lg border shadow-sm p-6">
        {renderTimelineView()}
      </div>
    </div>
  );
};

export default ScheduleEditor;