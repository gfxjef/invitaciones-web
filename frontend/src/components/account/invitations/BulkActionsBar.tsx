/**
 * Bulk Actions Bar Component
 * 
 * WHY: Provides efficient bulk operations for selected invitations
 * including delete, archive, duplicate, and status changes.
 * 
 * WHAT: Fixed action bar with selection count and bulk operation
 * buttons that appears when invitations are selected.
 */

'use client';

import { useState } from 'react';
import { 
  X,
  Check,
  Trash2,
  Archive,
  Copy,
  Download,
  Share2,
  Edit3,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll?: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => Promise<void> | void;
  onBulkArchive?: () => Promise<void> | void;
  onBulkDuplicate?: () => Promise<void> | void;
  onBulkPublish?: () => Promise<void> | void;
  onBulkUnpublish?: () => Promise<void> | void;
  onBulkExport?: () => Promise<void> | void;
  onBulkShare?: () => Promise<void> | void;
  className?: string;
}

export default function BulkActionsBar({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkArchive,
  onBulkDuplicate,
  onBulkPublish,
  onBulkUnpublish,
  onBulkExport,
  onBulkShare,
  className = ''
}: BulkActionsBarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');

  const handleBulkAction = async (action: () => Promise<void> | void, actionName: string) => {
    setIsLoading(true);
    setCurrentAction(actionName);
    
    try {
      await action();
    } catch (error) {
      console.error(`Error in bulk ${actionName}:`, error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
      setCurrentAction('');
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    await handleBulkAction(onBulkDelete, 'delete');
  };

  return (
    <>
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-6 py-4 min-w-[500px]">
          <div className="flex items-center justify-between">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
              </Badge>
              
              <div className="flex items-center gap-2">
                {onSelectAll && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAll}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Seleccionar todas
                  </Button>
                )}
                <span className="text-gray-300">|</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Deseleccionar todas
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Publishing Actions */}
              {onBulkPublish && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onBulkPublish, 'publish')}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading && currentAction === 'publish' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  Publicar
                </Button>
              )}

              {onBulkUnpublish && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onBulkUnpublish, 'unpublish')}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading && currentAction === 'unpublish' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  Despublicar
                </Button>
              )}

              {/* Duplicate Action */}
              {onBulkDuplicate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onBulkDuplicate, 'duplicate')}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading && currentAction === 'duplicate' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Duplicar
                </Button>
              )}

              {/* Export Action */}
              {onBulkExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onBulkExport, 'export')}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading && currentAction === 'export' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Exportar
                </Button>
              )}

              {/* Share Action */}
              {onBulkShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onBulkShare, 'share')}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  {isLoading && currentAction === 'share' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  Compartir
                </Button>
              )}

              <span className="text-gray-300">|</span>

              {/* Archive Action */}
              {onBulkArchive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onBulkArchive, 'archive')}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50"
                >
                  {isLoading && currentAction === 'archive' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  Archivar
                </Button>
              )}

              {/* Delete Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex items-center gap-1 text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
              >
                {isLoading && currentAction === 'delete' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Eliminar
              </Button>

              <span className="text-gray-300">|</span>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeselectAll}
                className="p-1 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pl-13">
              ¿Estás seguro de que quieres eliminar {selectedCount} invitación{selectedCount !== 1 ? 'es' : ''}? 
              Esta acción no se puede deshacer.
              <br />
              <br />
              <strong>Se eliminarán:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Las invitaciones y su contenido</li>
                <li>Todas las estadísticas asociadas</li>
                <li>Los códigos QR y URLs generados</li>
                <li>Las respuestas RSVP recibidas</li>
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
                  Eliminar {selectedCount} invitación{selectedCount !== 1 ? 'es' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}