/**
 * Drafts List Component
 * 
 * WHY: Manages incomplete/draft invitations with recovery options,
 * auto-save tracking, and draft lifecycle management.
 * 
 * WHAT: Draft invitation management interface with recovery,
 * continuation, deletion, and conversion to active invitations.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText,
  Clock,
  Edit3,
  Trash2,
  Play,
  Save,
  AlertTriangle,
  Calendar,
  Heart,
  Star,
  Users,
  Baby,
  RefreshCw,
  Archive,
  Copy,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type Invitation } from '@/lib/api';
import toast from 'react-hot-toast';

interface DraftInvitation extends Invitation {
  completion_percentage?: number;
  last_auto_save?: string;
  auto_save_count?: number;
  missing_fields?: string[];
  is_recoverable?: boolean;
  recovery_data?: any;
  time_spent_editing?: number;
}

// Mock draft invitations data
const mockDrafts: DraftInvitation[] = [
  {
    id: 1001,
    name: 'Cumpleaños Jorge',
    event_type: 'cumpleanos',
    event_date: '2024-09-25T20:00:00Z',
    url_slug: 'jorge-cumple-draft',
    full_url: '',
    status: 'draft',
    template_name: 'Moderno Azul',
    created_at: '2024-08-01T09:00:00Z',
    updated_at: '2024-08-19T15:30:00Z',
    completion_percentage: 65,
    last_auto_save: '2024-08-19T15:30:00Z',
    auto_save_count: 23,
    missing_fields: ['descripción', 'ubicación', 'configuración RSVP'],
    is_recoverable: true,
    time_spent_editing: 45,
    stats: {
      total_views: 0,
      unique_visitors: 0,
      rsvp_responses: 0,
      rsvp_confirmed: 0,
      rsvp_declined: 0,
      shares: 0,
    },
    settings: {
      rsvp_enabled: false,
      is_public: false,
      password_protected: false,
    },
  },
  {
    id: 1002,
    name: 'Bautizo Sofía',
    event_type: 'bautizo',
    event_date: '2024-10-15T11:00:00Z',
    url_slug: 'bautizo-sofia-draft',
    full_url: '',
    status: 'draft',
    template_name: 'Clásico Blanco',
    created_at: '2024-08-15T14:20:00Z',
    updated_at: '2024-08-18T10:15:00Z',
    completion_percentage: 30,
    last_auto_save: '2024-08-18T10:15:00Z',
    auto_save_count: 8,
    missing_fields: ['fecha del evento', 'información de contacto', 'galería', 'ubicación'],
    is_recoverable: true,
    time_spent_editing: 15,
    stats: {
      total_views: 0,
      unique_visitors: 0,
      rsvp_responses: 0,
      rsvp_confirmed: 0,
      rsvp_declined: 0,
      shares: 0,
    },
    settings: {
      rsvp_enabled: false,
      is_public: false,
      password_protected: false,
    },
  },
  {
    id: 1003,
    name: 'Reunión familiar',
    event_type: 'otro',
    event_date: '2024-09-30T16:00:00Z',
    url_slug: 'reunion-familiar-draft',
    full_url: '',
    status: 'draft',
    template_name: 'Simple Verde',
    created_at: '2024-07-28T11:45:00Z',
    updated_at: '2024-07-28T12:30:00Z',
    completion_percentage: 15,
    last_auto_save: '2024-07-28T12:30:00Z',
    auto_save_count: 3,
    missing_fields: ['información básica', 'fecha del evento', 'descripción', 'ubicación', 'configuración'],
    is_recoverable: false,
    time_spent_editing: 5,
    stats: {
      total_views: 0,
      unique_visitors: 0,
      rsvp_responses: 0,
      rsvp_confirmed: 0,
      rsvp_declined: 0,
      shares: 0,
    },
    settings: {
      rsvp_enabled: false,
      is_public: false,
      password_protected: false,
    },
  }
];

const EVENT_TYPE_LABELS = {
  boda: 'Boda',
  quince: 'XV Años',
  bautizo: 'Bautizo',
  cumpleanos: 'Cumpleaños',
  baby_shower: 'Baby Shower',
  otro: 'Otro',
};

export default function DraftsList() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOldDrafts, setShowOldDrafts] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; draft: DraftInvitation | null }>({
    open: false,
    draft: null
  });

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await invitationsApi.getDrafts();
      // setDrafts(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 600));
      setDrafts(mockDrafts);
    } catch (error) {
      toast.error('Error cargando borradores');
      console.error('Error loading drafts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = !searchQuery.trim() || 
      draft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.template_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!showOldDrafts) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(draft.updated_at) > weekAgo;
    }

    return true;
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'boda': return Heart;
      case 'quince': return Star;
      case 'bautizo': return Users;
      case 'cumpleanos': return Calendar;
      case 'baby_shower': return Baby;
      default: return FileText;
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `Hace ${diffInWeeks} semana${diffInWeeks !== 1 ? 's' : ''}`;
  };

  const handleContinueEditing = (draft: DraftInvitation) => {
    router.push(`/editor/invitation/${draft.id}`);
  };

  const handleDuplicateDraft = async (draft: DraftInvitation) => {
    try {
      // TODO: Implement duplication logic
      toast.success(`Borrador "${draft.name}" duplicado`);
      loadDrafts();
    } catch (error) {
      toast.error('Error duplicando borrador');
    }
  };

  const handleRecoverDraft = async (draft: DraftInvitation) => {
    try {
      // TODO: Implement recovery logic
      toast.success(`Borrador "${draft.name}" recuperado exitosamente`);
      router.push(`/editor/invitation/${draft.id}?recovery=true`);
    } catch (error) {
      toast.error('Error recuperando borrador');
    }
  };

  const handleDeleteDraft = async (draft: DraftInvitation) => {
    try {
      // TODO: Implement delete API call
      setDrafts(prev => prev.filter(d => d.id !== draft.id));
      toast.success(`Borrador "${draft.name}" eliminado`);
      setDeleteConfirm({ open: false, draft: null });
    } catch (error) {
      toast.error('Error eliminando borrador');
    }
  };

  const handleArchiveDraft = async (draft: DraftInvitation) => {
    try {
      // TODO: Implement archive logic
      toast.success(`Borrador "${draft.name}" archivado`);
      loadDrafts();
    } catch (error) {
      toast.error('Error archivando borrador');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Borradores</h1>
            <p className="text-gray-600">Invitaciones guardadas automáticamente</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borradores</h1>
          <p className="text-gray-600">
            {filteredDrafts.length} borrador{filteredDrafts.length !== 1 ? 'es' : ''} guardado{filteredDrafts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowOldDrafts(!showOldDrafts)}
          >
            {showOldDrafts ? 'Solo recientes' : 'Ver todos'}
          </Button>
          
          <Button onClick={() => router.push('/plantillas')}>
            <FileText className="w-4 h-4 mr-2" />
            Nuevo borrador
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar borradores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Drafts Display */}
      {filteredDrafts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12 text-gray-400" />}
          title={searchQuery ? 'No se encontraron borradores' : 'No tienes borradores guardados'}
          description={
            searchQuery 
              ? 'Intenta ajustar los términos de búsqueda'
              : 'Los borradores se guardan automáticamente mientras editas tus invitaciones'
          }
          action={
            <Button onClick={() => router.push('/plantillas')}>
              <FileText className="w-4 h-4 mr-2" />
              Crear nueva invitación
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => {
            const EventIcon = getEventTypeIcon(draft.event_type);
            const completionColor = getCompletionColor(draft.completion_percentage || 0);
            
            return (
              <div key={draft.id} className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Event Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <EventIcon className="w-6 h-6 text-gray-600" />
                  </div>

                  {/* Draft Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {draft.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {EVENT_TYPE_LABELS[draft.event_type]} • {draft.template_name}
                        </p>
                      </div>
                      
                      {/* Completion Badge */}
                      <Badge className={`${completionColor} font-medium`}>
                        {draft.completion_percentage}% completado
                      </Badge>
                    </div>

                    {/* Auto-save info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(draft.last_auto_save || draft.updated_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Save className="w-3 h-3" />
                        <span>{draft.auto_save_count} auto-guardados</span>
                      </div>
                      
                      {draft.time_spent_editing && (
                        <div className="flex items-center gap-1">
                          <Edit3 className="w-3 h-3" />
                          <span>{draft.time_spent_editing} min editando</span>
                        </div>
                      )}
                    </div>

                    {/* Missing Fields */}
                    {draft.missing_fields && draft.missing_fields.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Campos pendientes:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {draft.missing_fields.slice(0, 4).map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {draft.missing_fields.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{draft.missing_fields.length - 4} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recovery Status */}
                    {draft.is_recoverable ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <RefreshCw className="w-4 h-4" />
                          <span>Este borrador es recuperable y tiene datos guardados</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-yellow-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Borrador incompleto - algunos datos podrían haberse perdido</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleContinueEditing(draft)}
                      className="min-w-[120px]"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continuar
                    </Button>
                    
                    {draft.is_recoverable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecoverDraft(draft)}
                        className="min-w-[120px]"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Recuperar
                      </Button>
                    )}
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateDraft(draft)}
                        className="p-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveDraft(draft)}
                        className="p-2"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm({ open: true, draft })}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, draft: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle>Eliminar borrador</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pl-13">
              ¿Estás seguro de que quieres eliminar el borrador <strong>"{deleteConfirm.draft?.name}"</strong>?
              <br />
              <br />
              Esta acción no se puede deshacer y se perderán:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Todo el progreso de edición ({deleteConfirm.draft?.completion_percentage}% completado)</li>
                <li>Los {deleteConfirm.draft?.auto_save_count} auto-guardados</li>
                <li>Los {deleteConfirm.draft?.time_spent_editing} minutos de trabajo</li>
                <li>Todos los datos de configuración</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm.draft && handleDeleteDraft(deleteConfirm.draft)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar borrador
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}