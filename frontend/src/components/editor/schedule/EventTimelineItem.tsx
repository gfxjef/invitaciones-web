/**
 * EventTimelineItem Component
 * 
 * WHY: Provides individual event display and inline editing capabilities
 * for the wedding timeline. Allows couples to quickly edit event details
 * without opening separate modals or forms.
 * 
 * WHAT: Interactive event card with inline editing, drag handle, time
 * display, venue information, and quick actions. Supports touch interactions
 * and keyboard shortcuts for efficient editing.
 * 
 * HOW: Uses inline editing pattern with save/cancel actions, integrates
 * with parent timeline component for data management, and provides
 * visual feedback for different event states.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Edit2,
  Check,
  X,
  GripVertical,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  Heart,
  Music,
  Camera,
  Utensils,
  Car,
  Home,
  Star,
  Trash2
} from 'lucide-react';
import { InvitationEvent } from '../../../types/invitation';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface EventTimelineItemProps {
  /**
   * Event data
   */
  event: InvitationEvent;
  
  /**
   * Item index in the timeline
   */
  index: number;
  
  /**
   * Whether this item has time conflicts
   */
  hasConflict?: boolean;
  
  /**
   * Conflict details
   */
  conflictDetails?: string[];
  
  /**
   * Whether inline editing is allowed
   */
  allowEdit?: boolean;
  
  /**
   * Whether deletion is allowed
   */
  allowDelete?: boolean;
  
  /**
   * Whether drag and drop is enabled
   */
  allowDrag?: boolean;
  
  /**
   * Whether item is being dragged
   */
  isDragging?: boolean;
  
  /**
   * Whether item is being dragged over
   */
  isDraggedOver?: boolean;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Callback when event is updated
   */
  onUpdate?: (eventId: number, updates: Partial<InvitationEvent>) => void;
  
  /**
   * Callback when event is deleted
   */
  onDelete?: (eventId: number) => void;
  
  /**
   * Callback when drag starts
   */
  onDragStart?: (e: React.DragEvent, event: InvitationEvent, index: number) => void;
  
  /**
   * Callback when drag ends
   */
  onDragEnd?: (e: React.DragEvent) => void;
  
  /**
   * Callback when dragged over
   */
  onDragEnter?: (e: React.DragEvent, index: number) => void;
  
  /**
   * Callback when drag leaves
   */
  onDragLeave?: (e: React.DragEvent) => void;
  
  /**
   * Callback when dragged over
   */
  onDragOver?: (e: React.DragEvent) => void;
  
  /**
   * Callback when dropped
   */
  onDrop?: (e: React.DragEvent, index: number) => void;
}

interface EditableFields {
  event_name: string;
  event_venue: string;
  event_address: string;
  event_description: string;
  event_datetime: string;
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
 * Format time for display
 */
const formatTime = (datetime: string): string => {
  return new Date(datetime).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format datetime for input
 */
const formatDateTimeForInput = (datetime: string): string => {
  const date = new Date(datetime);
  return date.toISOString().slice(0, 16);
};

/**
 * Individual timeline event item with inline editing
 */
export const EventTimelineItem: React.FC<EventTimelineItemProps> = ({
  event,
  index,
  hasConflict = false,
  conflictDetails = [],
  allowEdit = true,
  allowDelete = true,
  allowDrag = true,
  isDragging = false,
  isDraggedOver = false,
  className,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}) => {
  // ================
  // STATE
  // ================
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    event_name: event.event_name,
    event_venue: event.event_venue || '',
    event_address: event.event_address || '',
    event_description: event.event_description || '',
    event_datetime: event.event_datetime
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // ================
  // REFS
  // ================
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // ================
  // COMPUTED VALUES
  // ================
  
  const eventIcon = event.event_icon && EVENT_ICONS[event.event_icon as keyof typeof EVENT_ICONS]
    ? EVENT_ICONS[event.event_icon as keyof typeof EVENT_ICONS]
    : Star;
  
  const cardClassName = cn(
    "relative flex items-start gap-4 group transition-all duration-200",
    isDraggedOver && "transform translate-y-2 bg-blue-50 rounded-lg p-2",
    isDragging && "opacity-50",
    isEditing && "ring-2 ring-primary ring-opacity-50",
    className
  );
  
  // ================
  // HANDLERS
  // ================
  
  const handleEditStart = useCallback(() => {
    if (!allowEdit) return;
    
    setIsEditing(true);
    setEditableFields({
      event_name: event.event_name,
      event_venue: event.event_venue || '',
      event_address: event.event_address || '',
      event_description: event.event_description || '',
      event_datetime: event.event_datetime
    });
    
    // Focus name input after state update
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  }, [allowEdit, event]);
  
  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditableFields({
      event_name: event.event_name,
      event_venue: event.event_venue || '',
      event_address: event.event_address || '',
      event_description: event.event_description || '',
      event_datetime: event.event_datetime
    });
  }, [event]);
  
  const handleEditSave = useCallback(async () => {
    if (!onUpdate || !event.id || isSaving) return;
    
    try {
      setIsSaving(true);
      
      const updates: Partial<InvitationEvent> = {};
      
      // Only include changed fields
      if (editableFields.event_name !== event.event_name) {
        updates.event_name = editableFields.event_name;
      }
      if (editableFields.event_venue !== (event.event_venue || '')) {
        updates.event_venue = editableFields.event_venue || undefined;
      }
      if (editableFields.event_address !== (event.event_address || '')) {
        updates.event_address = editableFields.event_address || undefined;
      }
      if (editableFields.event_description !== (event.event_description || '')) {
        updates.event_description = editableFields.event_description || undefined;
      }
      if (editableFields.event_datetime !== event.event_datetime) {
        updates.event_datetime = editableFields.event_datetime;
      }
      
      if (Object.keys(updates).length > 0) {
        await onUpdate(event.id, updates);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving event:', error);
      // Could show error message to user here
    } finally {
      setIsSaving(false);
    }
  }, [onUpdate, event, editableFields, isSaving]);
  
  const handleDelete = useCallback(() => {
    if (!onDelete || !event.id || !allowDelete) return;
    
    if (confirm(`¿Estás seguro de eliminar "${event.event_name}"?`)) {
      onDelete(event.id);
    }
  }, [onDelete, event, allowDelete]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isEditing) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  }, [isEditing, handleEditSave, handleEditCancel]);
  
  // ================
  // EFFECTS
  // ================
  
  // Focus name input when editing starts
  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);
  
  // ================
  // RENDER HELPERS
  // ================
  
  const renderTimelineDot = () => (
    <div className={cn(
      "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 bg-white transition-colors",
      hasConflict ? "border-red-400" : "border-gray-300 group-hover:border-primary",
      isEditing && "border-primary"
    )}>
      <eventIcon className="w-6 h-6 text-gray-600" />
      
      {hasConflict && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
  
  const renderEditableContent = () => {
    if (!isEditing) {
      return (
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{event.event_name}</h3>
            {allowDrag && (
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
          
          {event.event_address && !showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="text-xs text-primary hover:text-primary/80"
            >
              Ver dirección
            </button>
          )}
          
          {event.event_address && showDetails && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
              <div className="flex items-center justify-between">
                <span>{event.event_address}</span>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex-1 space-y-3" onKeyDown={handleKeyDown}>
        {/* Event name */}
        <div>
          <input
            ref={nameInputRef}
            type="text"
            value={editableFields.event_name}
            onChange={(e) => setEditableFields(prev => ({ ...prev, event_name: e.target.value }))}
            className="w-full font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-primary focus:outline-none pb-1"
            placeholder="Nombre del evento"
          />
        </div>
        
        {/* Date and venue row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha y hora</label>
            <input
              type="datetime-local"
              value={formatDateTimeForInput(editableFields.event_datetime)}
              onChange={(e) => setEditableFields(prev => ({ ...prev, event_datetime: e.target.value }))}
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:border-primary focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Lugar</label>
            <input
              type="text"
              value={editableFields.event_venue}
              onChange={(e) => setEditableFields(prev => ({ ...prev, event_venue: e.target.value }))}
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:border-primary focus:outline-none"
              placeholder="Lugar del evento"
            />
          </div>
        </div>
        
        {/* Address */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dirección</label>
          <input
            type="text"
            value={editableFields.event_address}
            onChange={(e) => setEditableFields(prev => ({ ...prev, event_address: e.target.value }))}
            className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:border-primary focus:outline-none"
            placeholder="Dirección completa"
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Descripción</label>
          <textarea
            value={editableFields.event_description}
            onChange={(e) => setEditableFields(prev => ({ ...prev, event_description: e.target.value }))}
            className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:border-primary focus:outline-none resize-none"
            rows={2}
            placeholder="Detalles adicionales"
          />
        </div>
      </div>
    );
  };
  
  const renderActions = () => {
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditCancel}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditSave}
            disabled={isSaving || !editableFields.event_name.trim()}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Guardar"
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      );
    }
    
    if (!allowEdit && !allowDelete) {
      return null;
    }
    
    return (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {allowEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditStart}
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
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Eliminar evento"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  };
  
  const renderConflictWarning = () => {
    if (!hasConflict) return null;
    
    return (
      <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
        <div className="flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Conflicto de horario</div>
            {conflictDetails.length > 0 && (
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {conflictDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // ================
  // RENDER
  // ================
  
  return (
    <div
      ref={cardRef}
      className={cardClassName}
      draggable={allowDrag && !isEditing}
      onDragStart={(e) => onDragStart && onDragStart(e, event, index)}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => onDragEnter && onDragEnter(e, index)}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, index)}
    >
      {/* Timeline dot */}
      {renderTimelineDot()}
      
      {/* Event card */}
      <div className={cn(
        "flex-1 bg-white rounded-lg border shadow-sm p-4 transition-all duration-200",
        "group-hover:shadow-md",
        hasConflict && "border-red-200 bg-red-50",
        isEditing && "shadow-md border-primary"
      )}>
        <div className="flex items-start justify-between">
          {renderEditableContent()}
          {renderActions()}
        </div>
        
        {renderConflictWarning()}
      </div>
    </div>
  );
};

export default EventTimelineItem;