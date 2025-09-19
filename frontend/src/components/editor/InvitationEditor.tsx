/**
 * Main Invitation Editor Component
 * 
 * WHY: Central container for the invitation editor that orchestrates
 * all editor components, manages state, and provides the complete
 * editing experience for wedding invitations.
 * 
 * WHAT: Comprehensive editor interface that uses all the hooks and
 * components created in Issues #49-#51 to provide a professional
 * invitation editing experience.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Share2, 
  Settings, 
  Loader,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvitationEditorFixed as useInvitationEditor } from '@/lib/hooks/useInvitationEditorFixed';
import { useAutoSave, useAutoSaveStatus } from '@/lib/hooks/useAutoSave';
import { EDITOR_SECTIONS } from '@/types/invitation';

interface InvitationEditorProps {
  invitationId: number;
}

export const InvitationEditor: React.FC<InvitationEditorProps> = ({ 
  invitationId 
}) => {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('couple');

  // Initialize editor with our FIXED hook (no infinite loops)
  const editor = useInvitationEditor(invitationId);
  
  // Auto-save callbacks - memoized to prevent infinite renders
  const handleAutoSaveSuccess = useCallback(() => {
    console.log('Auto-saved successfully');
  }, []);

  const handleAutoSaveError = useCallback((error: string) => {
    console.error('Auto-save error:', error);
  }, []);

  // Auto-save functionality with our FIXED hooks
  const autoSave = useAutoSave({
    onSave: editor.saveData,
    data: editor.data,
    isDirty: editor.isDirty,
    interval: 30000, // 30 seconds
    debounceDelay: 2000, // 2 seconds
    onSaveSuccess: handleAutoSaveSuccess,
    onSaveError: handleAutoSaveError
  });

  const autoSaveStatus = useAutoSaveStatus(autoSave);

  // Load invitation data on mount (using our fixed hook)
  useEffect(() => {
    if (invitationId) {
      editor.loadData(invitationId).catch(error => {
        console.error('Failed to load invitation:', error);
      });
    }
  }, [invitationId]); // No circular dependencies

  // Handle save - memoized to prevent infinite renders
  const handleSave = useCallback(async () => {
    try {
      await editor.saveData();
      console.log('Saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [editor.saveData]);

  // Handle preview - memoized to prevent infinite renders
  const handlePreview = useCallback(async () => {
    try {
      const previewUrl = await editor.generatePreview();
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  }, [editor.generatePreview]);

  // Handle publish - memoized to prevent infinite renders
  const handlePublish = useCallback(async () => {
    try {
      if (!editor.isFormValid()) {
        alert('Por favor completa todos los campos requeridos antes de publicar.');
        return;
      }
      
      const publishedUrl = await editor.publishInvitation();
      alert(`¡Invitación publicada exitosamente! URL: ${publishedUrl}`);
    } catch (error) {
      console.error('Publish failed:', error);
      alert('Error al publicar la invitación. Por favor intenta de nuevo.');
    }
  }, [editor.isFormValid, editor.publishInvitation]);

  // Calculate overall progress - memoized to prevent infinite renders
  const overallProgress = useMemo(() => {
    return editor.getOverallCompleteness();
  }, [editor.data, editor.events, editor.media]);
  
  const completedSections = useMemo(() => {
    return EDITOR_SECTIONS.filter(section => 
      editor.getSectionCompleteness(section.id) === 100
    ).length;
  }, [editor.data, editor.events, editor.media]);

  // Memoized sections with completeness to avoid recalculating on every render
  const sectionsWithCompleteness = useMemo(() => {
    return EDITOR_SECTIONS.map(section => ({
      ...section,
      completeness: editor.getSectionCompleteness(section.id),
      hasErrors: editor.errors[section.id] && 
        Object.keys(editor.errors[section.id]).length > 0
    }));
  }, [editor.data, editor.events, editor.media, editor.errors]);

  // Show loading state
  if (editor.isLoading && !editor.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando editor de invitaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Toolbar - ORIGINAL DESIGN */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Progress & Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    Progreso: {completedSections}/{EDITOR_SECTIONS.length} secciones
                  </div>
                  <div className="text-gray-500">
                    {overallProgress < 100 ? 'En progreso' : 'Completo'}
                  </div>
                </div>
              </div>

              {/* Auto-save Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${autoSaveStatus.bgColor}`}>
                <span className="text-lg">{autoSaveStatus.icon}</span>
                <span className={autoSaveStatus.color}>
                  {autoSaveStatus.message}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={editor.isLoading || !editor.isDirty}
              >
                <Save className="w-4 h-4 mr-2" />
                {editor.isDirty ? 'Guardar' : 'Guardado'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={editor.isLoading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={editor.isLoading || !editor.isFormValid()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - ORIGINAL DESIGN */}
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Sidebar - ORIGINAL DESIGN */}
          <div className="w-80 bg-white border-r min-h-screen p-6">
            <h2 className="text-lg font-semibold mb-4">Secciones</h2>
            <div className="space-y-2">
              {sectionsWithCompleteness.map((section) => {
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-purple-100 border-purple-200 text-purple-900' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{section.label}</span>
                          {section.required && (
                            <Badge variant="secondary" className="text-xs">
                              Requerido
                            </Badge>
                          )}
                          {section.hasErrors && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          {section.completeness === 100 && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                section.completeness === 100 ? 'bg-green-500' : 
                                section.completeness > 0 ? 'bg-purple-500' : 'bg-gray-300'
                              }`}
                              style={{ width: `${section.completeness}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {section.completeness}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Content - WHERE INDIVIDUAL SECTION FORMS WILL GO */}
          <div className="flex-1 p-6">
            {/* FOR NOW: Basic section forms - WILL BE REPLACED WITH INDIVIDUAL COMPONENTS */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6">
                {EDITOR_SECTIONS.find(s => s.id === activeSection)?.label || 'Sección'}
              </h2>
              
              {/* Basic forms for each section */}
              {activeSection === 'couple' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Novio *
                    </label>
                    <input
                      type="text"
                      value={editor.data.couple_groom_name || ''}
                      onChange={(e) => editor.updateField('couple', 'couple_groom_name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      onChange={(e) => editor.updateField('couple', 'couple_bride_name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      onChange={(e) => editor.updateField('couple', 'couple_welcome_message', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                      placeholder="Con la bendición de Dios y nuestros padres..."
                    />
                  </div>
                </div>
              )}

              {activeSection === 'event' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del Evento *
                    </label>
                    <input
                      type="date"
                      value={editor.data.event_date || ''}
                      onChange={(e) => editor.updateField('event', 'event_date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora del Evento *
                    </label>
                    <input
                      type="time"
                      value={editor.data.event_time || ''}
                      onChange={(e) => editor.updateField('event', 'event_time', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Lugar *
                    </label>
                    <input
                      type="text"
                      value={editor.data.event_venue_name || ''}
                      onChange={(e) => editor.updateField('event', 'event_venue_name', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Iglesia, salón, etc."
                    />
                  </div>
                </div>
              )}

              {/* Placeholder for other sections */}
              {!['couple', 'event'].includes(activeSection) && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium">Formulario de {EDITOR_SECTIONS.find(s => s.id === activeSection)?.label}</p>
                  <p className="mt-2">Esta sección será implementada con su propio componente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationEditor;