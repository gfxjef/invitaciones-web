/**
 * Invitation Editor Demo Component
 * 
 * WHY: Demonstration component to manually test all the editor hooks
 * and validate their integration with backend APIs. Provides a visual
 * interface to test data management, auto-save, and file uploads.
 * 
 * WHAT: Interactive demo showing all editor functionality including
 * field updates, validation, auto-save indicators, file uploads,
 * and publishing workflow.
 * 
 * HOW: Uses all the hooks created in Issue #49 to provide a
 * comprehensive testing interface for the invitation editor system.
 */

'use client';

import React, { useState, useCallback } from 'react';
// import { useInvitationEditor } from '../../lib/hooks/useInvitationEditor';
import { useInvitationEditorFixed as useInvitationEditor } from '../../lib/hooks/useInvitationEditorFixed';
import { useAutoSave, useAutoSaveStatus } from '../../lib/hooks/useAutoSave';
// import { useFileUpload, useUploadStats } from '../../lib/hooks/useFileUpload';
import { EDITOR_SECTIONS } from '../../types/invitation';

interface InvitationEditorDemoProps {
  invitationId?: number;
}

/**
 * Demo component for testing invitation editor hooks
 */
export const InvitationEditorDemo: React.FC<InvitationEditorDemoProps> = ({
  invitationId = 1
}) => {
  // ================
  // STATE
  // ================
  
  const [activeSection, setActiveSection] = useState('couple');
  const [messages, setMessages] = useState<string[]>([]);
  
  // ================
  // HOOKS
  // ================
  
  // Main editor hook
  const editor = useInvitationEditor(invitationId);
  
  // Auto-save hook
  const autoSave = useAutoSave({
    onSave: editor.saveData,
    data: editor.data,
    isDirty: editor.isDirty,
    interval: 10000, // 10 seconds for demo
    debounceDelay: 2000, // 2 seconds for demo
    onSaveSuccess: () => addMessage('✅ Auto-guardado exitoso'),
    onSaveError: (error) => addMessage(`❌ Error en auto-guardado: ${error}`)
  });
  
  // Auto-save status display
  const autoSaveStatus = useAutoSaveStatus(autoSave);
  
  // TEMPORARILY DISABLE File upload hook to fix errors
  const fileUpload = {
    uploads: [],
    uploadFile: async (file: File, mediaType: string) => {
      addMessage(`🚫 Upload temporarily disabled: ${file.name}`);
    },
    uploadFiles: async (files: File[], mediaType: string) => {
      addMessage(`🚫 Batch upload temporarily disabled: ${files.length} files`);
    }
  };
  
  // Mock upload statistics
  const uploadStats = {
    hasUploads: false,
    totalFiles: 0,
    completedFiles: 0,
    overallProgress: 0,
    hasErrors: false,
    errorFiles: 0
  };
  
  // ================
  // UTILITY FUNCTIONS
  // ================
  
  const addMessage = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  }, []);
  
  const handleFieldChange = useCallback((category: string, field: string, value: any) => {
    editor.updateField(category, field, value);
    addMessage(`📝 Campo actualizado: ${field} = ${value}`);
  }, [editor, addMessage]);
  
  const handleFileUpload = useCallback(async (files: FileList | null, mediaType: string) => {
    if (!files || files.length === 0) return;
    
    try {
      const fileArray = Array.from(files);
      addMessage(`📁 Subiendo ${fileArray.length} archivo(s)...`);
      
      if (fileArray.length === 1) {
        await fileUpload.uploadFile(fileArray[0], mediaType);
      } else {
        await fileUpload.uploadFiles(fileArray, mediaType);
      }
    } catch (error) {
      addMessage(`❌ Error en upload: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [fileUpload, addMessage]);
  
  // ================
  // EVENT HANDLERS
  // ================
  
  const handleAddEvent = useCallback(async () => {
    try {
      await editor.addEvent({
        event_name: 'Nuevo Evento',
        event_datetime: '2025-06-15T20:00:00',
        event_venue: 'Venue de prueba',
        event_icon: 'party'
      });
      addMessage('🎉 Evento agregado');
    } catch (error) {
      addMessage(`❌ Error agregando evento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [editor, addMessage]);
  
  const handleSaveData = useCallback(async () => {
    try {
      await editor.saveData();
      addMessage('💾 Datos guardados manualmente');
    } catch (error) {
      addMessage(`❌ Error guardando: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [editor, addMessage]);
  
  const handleGeneratePreview = useCallback(async () => {
    try {
      const previewUrl = await editor.generatePreview();
      addMessage(`👀 Preview generado: ${previewUrl}`);
    } catch (error) {
      addMessage(`❌ Error generando preview: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [editor, addMessage]);
  
  const handlePublish = useCallback(async () => {
    try {
      const publishedUrl = await editor.publishInvitation();
      addMessage(`🚀 Invitación publicada: ${publishedUrl}`);
    } catch (error) {
      addMessage(`❌ Error publicando: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [editor, addMessage]);
  
  // ================
  // RENDER
  // ================
  
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Editor de Invitaciones - Demo
        </h1>
        <p className="text-gray-600">
          Prueba todos los hooks del editor de invitaciones (Issue #49)
        </p>
      </div>
      
      {/* Status Bar */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Estado del Editor</h2>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              editor.isDirty 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {editor.isDirty ? 'Cambios pendientes' : 'Guardado'}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-sm ${
              editor.isLoading 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {editor.isLoading ? 'Cargando...' : 'Listo'}
            </span>
          </div>
        </div>
        
        {/* Auto-save Status */}
        <div className={`flex items-center gap-2 p-2 rounded ${autoSaveStatus.bgColor}`}>
          <span className="text-lg">{autoSaveStatus.icon}</span>
          <span className={`text-sm ${autoSaveStatus.color}`}>
            {autoSaveStatus.message}
          </span>
          {autoSaveStatus.lastSavedText && (
            <span className="text-xs text-gray-500 ml-auto">
              {autoSaveStatus.lastSavedText}
            </span>
          )}
        </div>
        
        {/* Completeness Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso general</span>
            <span>{editor.getOverallCompleteness()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${editor.getOverallCompleteness()}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-4">Secciones</h3>
            <div className="space-y-2">
              {EDITOR_SECTIONS.map((section) => {
                const completeness = editor.getSectionCompleteness(section.id);
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-100 border-blue-200 text-blue-900' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{section.label}</div>
                        <div className="text-xs text-gray-500">
                          {completeness}% completo
                          {section.required && ' (requerido)'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleSaveData}
                disabled={editor.isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg transition-colors"
              >
                💾 Guardar Manualmente
              </button>
              
              <button
                onClick={() => autoSave.isAutoSaveEnabled ? autoSave.disableAutoSave() : autoSave.enableAutoSave()}
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  autoSave.isAutoSaveEnabled
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {autoSave.isAutoSaveEnabled ? '⏸️ Pausar Auto-guardado' : '▶️ Activar Auto-guardado'}
              </button>
              
              <button
                onClick={handleGeneratePreview}
                disabled={editor.isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-2 px-4 rounded-lg transition-colors"
              >
                👀 Generar Preview
              </button>
              
              <button
                onClick={handlePublish}
                disabled={editor.isLoading || !editor.isFormValid()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2 px-4 rounded-lg transition-colors"
              >
                🚀 Publicar Invitación
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Fields */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">
              {EDITOR_SECTIONS.find(s => s.id === activeSection)?.label}
            </h3>
            
            {activeSection === 'couple' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Novio *
                  </label>
                  <input
                    type="text"
                    value={editor.data.couple_groom_name || ''}
                    onChange={(e) => handleFieldChange('couple', 'couple_groom_name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre completo del novio"
                  />
                  {editor.getFieldErrors('couple', 'couple_groom_name') && (
                    <p className="text-red-500 text-sm mt-1">
                      {editor.getFieldErrors('couple', 'couple_groom_name')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Novia *
                  </label>
                  <input
                    type="text"
                    value={editor.data.couple_bride_name || ''}
                    onChange={(e) => handleFieldChange('couple', 'couple_bride_name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre completo de la novia"
                  />
                  {editor.getFieldErrors('couple', 'couple_bride_name') && (
                    <p className="text-red-500 text-sm mt-1">
                      {editor.getFieldErrors('couple', 'couple_bride_name')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de Bienvenida
                  </label>
                  <textarea
                    value={editor.data.couple_welcome_message || ''}
                    onChange={(e) => handleFieldChange('couple', 'couple_welcome_message', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Con la bendición de Dios y nuestros padres..."
                  />
                </div>
              </div>
            )}
            
            {activeSection === 'event' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Evento *
                  </label>
                  <input
                    type="date"
                    value={editor.data.event_date || ''}
                    onChange={(e) => handleFieldChange('event', 'event_date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {editor.getFieldErrors('event', 'event_date') && (
                    <p className="text-red-500 text-sm mt-1">
                      {editor.getFieldErrors('event', 'event_date')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora del Evento *
                  </label>
                  <input
                    type="time"
                    value={editor.data.event_time || ''}
                    onChange={(e) => handleFieldChange('event', 'event_time', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Lugar *
                  </label>
                  <input
                    type="text"
                    value={editor.data.event_venue_name || ''}
                    onChange={(e) => handleFieldChange('event', 'event_venue_name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Iglesia, salón, etc."
                  />
                </div>
              </div>
            )}
            
            {activeSection === 'gallery' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Principal *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files, 'hero')}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Recomendado: 1920x1080px, máx 5MB
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Galería de Fotos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, 'gallery')}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Máximo 20 imágenes, 5MB cada una
                  </p>
                </div>
                
                {/* Upload Progress */}
                {uploadStats.hasUploads && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Progreso de Subida</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Archivos: {uploadStats.completedFiles}/{uploadStats.totalFiles}</span>
                        <span>{uploadStats.overallProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadStats.overallProgress}%` }}
                        />
                      </div>
                      {uploadStats.hasErrors && (
                        <p className="text-red-500 text-sm">
                          {uploadStats.errorFiles} archivo(s) con errores
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'schedule' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Eventos del Itinerario</h4>
                  <button
                    onClick={handleAddEvent}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Agregar Evento
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editor.events.map((event, index) => (
                    <div key={event.id || index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{event.event_name}</h5>
                          <p className="text-sm text-gray-600">
                            {new Date(event.event_datetime).toLocaleString()}
                          </p>
                          {event.event_venue && (
                            <p className="text-sm text-gray-500">{event.event_venue}</p>
                          )}
                        </div>
                        <button
                          onClick={() => event.id && editor.deleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Debug Log */}
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Log de Actividad</h3>
              <button
                onClick={() => setMessages([])}
                className="text-gray-400 hover:text-white text-sm"
              >
                Limpiar
              </button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay actividad reciente...</p>
              ) : (
                messages.map((message, index) => (
                  <p key={index} className="text-sm font-mono">
                    {message}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationEditorDemo;