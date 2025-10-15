/**
 * Invitation Actions Menu Component
 * 
 * WHY: Centralized action menu for individual invitations with
 * comprehensive management options including edit, duplicate,
 * delete, share, and advanced settings.
 * 
 * WHAT: Dropdown menu with contextual actions based on invitation
 * status and user permissions.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal,
  Edit3,
  Copy,
  Share2,
  ExternalLink,
  Download,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Link2,
  QrCode,
  FileText,
  BarChart3,
  Clock,
  Users,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface InvitationActionsMenuProps {
  invitation: Invitation;
  onEdit?: (invitation: Invitation) => void;
  onDuplicate?: (invitation: Invitation) => void;
  onDelete?: (invitation: Invitation) => void;
  onArchive?: (invitation: Invitation) => void;
  onShare?: (invitation: Invitation) => void;
  onPublish?: (invitation: Invitation) => void;
  onUnpublish?: (invitation: Invitation) => void;
  onExport?: (invitation: Invitation) => void;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export default function InvitationActionsMenu({
  invitation,
  onEdit,
  onDuplicate,
  onDelete,
  onArchive,
  onShare,
  onPublish,
  onUnpublish,
  onExport,
  trigger,
  align = 'end',
  className = ''
}: InvitationActionsMenuProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const handleAction = async (action: () => Promise<void> | void, actionName: string) => {
    setIsLoading(true);
    try {
      await action();
      toast.success(`Invitación ${actionName} exitosamente`);
    } catch (error) {
      console.error(`Error in ${actionName}:`, error);
      toast.error(`Error al ${actionName} la invitación`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitation.full_url);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: invitation.title,
        text: `Te invito a mi evento: ${invitation.title}`,
        url: invitation.full_url,
      }).catch(error => {
        console.error('Error sharing:', error);
        handleCopyLink(); // Fallback to copy
      });
    } else {
      handleCopyLink();
    }
    onShare?.(invitation);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(invitation);
    } else {
      router.push(`/invitacion/${invitation.id}/edit`);
    }
  };

  const handleViewAnalytics = () => {
    router.push(`/mi-cuenta/invitaciones/${invitation.id}`);
  };

  const handleManageUrls = () => {
    router.push(`/mi-cuenta/invitaciones/${invitation.id}/urls`);
  };

  const handleSettings = () => {
    router.push(`/mi-cuenta/invitaciones/${invitation.id}/settings`);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      handleAction(() => onDuplicate(invitation), 'duplicada');
    } else {
      toast('Función de duplicado próximamente');
    }
  };

  const handlePublishToggle = () => {
    const isActive = invitation.status === 'active';
    const action = isActive ? onUnpublish : onPublish;
    
    if (action) {
      handleAction(
        () => action(invitation), 
        isActive ? 'despublicada' : 'publicada'
      );
    } else {
      toast('Función de publicación próximamente');
    }
  };

  const handleExport = () => {
    if (onExport) {
      handleAction(() => onExport(invitation), 'exportada');
    } else {
      toast('Función de exportación próximamente');
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    if (onDelete) {
      await handleAction(() => onDelete(invitation), 'eliminada');
    }
  };

  const confirmArchive = () => {
    setShowArchiveConfirm(true);
  };

  const executeArchive = async () => {
    setShowArchiveConfirm(false);
    if (onArchive) {
      await handleAction(() => onArchive(invitation), 'archivada');
    }
  };

  const canEdit = invitation.status === 'draft' || invitation.status === 'active';
  const canPublish = invitation.status === 'draft';
  const canUnpublish = invitation.status === 'active';
  const canArchive = invitation.status === 'completed' || invitation.status === 'expired';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button 
              variant="ghost" 
              size="sm" 
              className={className}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align={align} className="w-56">
          <DropdownMenuLabel className="font-medium">
            Acciones de invitación
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />

          {/* View/Analytics */}
          <DropdownMenuItem onClick={handleViewAnalytics}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver analíticas
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => window.open(invitation.full_url, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir invitación
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Edit Actions */}
          {canEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit3 className="w-4 h-4 mr-2" />
              Editar invitación
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleManageUrls}>
            <Link2 className="w-4 h-4 mr-2" />
            Gestionar URLs
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Sharing Actions */}
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar enlace
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => toast('Función de QR próximamente')}>
            <QrCode className="w-4 h-4 mr-2" />
            Descargar QR
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Publishing Actions */}
          {canPublish && (
            <DropdownMenuItem onClick={handlePublishToggle}>
              <Eye className="w-4 h-4 mr-2" />
              Publicar invitación
            </DropdownMenuItem>
          )}

          {canUnpublish && (
            <DropdownMenuItem onClick={handlePublishToggle}>
              <EyeOff className="w-4 h-4 mr-2" />
              Despublicar
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar invitación
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar datos
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Archive/Delete Actions */}
          {canArchive && (
            <DropdownMenuItem onClick={confirmArchive} className="text-yellow-700">
              <Archive className="w-4 h-4 mr-2" />
              Archivar
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            onClick={confirmDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle>Eliminar invitación</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pl-13">
              ¿Estás seguro de que quieres eliminar la invitación <strong>"{invitation.title}"</strong>?
              <br />
              <br />
              Esta acción no se puede deshacer y se eliminarán:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>La invitación y todo su contenido</li>
                <li>Las estadísticas de {invitation.stats.views} vistas</li>
                <li>Las {invitation.stats.rsvps} respuestas RSVP</li>
                <li>Todos los códigos QR y URLs generados</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar invitación
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Archive className="w-5 h-5 text-yellow-600" />
              </div>
              <AlertDialogTitle>Archivar invitación</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pl-13">
              ¿Quieres archivar la invitación <strong>"{invitation.title}"</strong>?
              <br />
              <br />
              La invitación archivada:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Se moverá a la sección de archivadas</li>
                <li>Conservará todas sus estadísticas</li>
                <li>Seguirá siendo accesible por su URL</li>
                <li>Podrá ser restaurada en cualquier momento</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeArchive}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Archivando...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-2" />
                  Archivar invitación
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}