/**
 * Draft Recovery Component
 * 
 * WHY: Provides advanced draft recovery capabilities including
 * version comparison, conflict resolution, and emergency retrieval
 * of lost or corrupted invitation drafts.
 * 
 * WHAT: Recovery interface with version history, conflict resolution,
 * data restoration, and backup management.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw,
  AlertTriangle,
  Clock,
  FileText,
  Save,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  GitCompare,
  RotateCcw,
  Shield,
  Database,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import toast from 'react-hot-toast';

interface RecoveryVersion {
  id: string;
  timestamp: string;
  version_number: number;
  data_size: number;
  completion_percentage: number;
  auto_save_type: 'user' | 'auto' | 'backup' | 'emergency';
  is_corrupted: boolean;
  has_conflicts: boolean;
  recovery_confidence: 'high' | 'medium' | 'low';
  changed_fields: string[];
  data_preview: any;
}

interface RecoverySession {
  invitation_id: number;
  invitation_name: string;
  last_saved: string;
  versions: RecoveryVersion[];
  corruption_detected: boolean;
  emergency_backup_available: boolean;
  total_data_loss_risk: 'low' | 'medium' | 'high';
}

interface DraftRecoveryProps {
  invitationId?: number;
  onRecoveryComplete?: (version: RecoveryVersion) => void;
  onCancel?: () => void;
}

// Mock recovery data
const mockRecoverySession: RecoverySession = {
  invitation_id: 1001,
  invitation_name: 'Cumpleaños Jorge',
  last_saved: '2024-08-19T15:30:00Z',
  corruption_detected: false,
  emergency_backup_available: true,
  total_data_loss_risk: 'low',
  versions: [
    {
      id: 'v1-1692454200',
      timestamp: '2024-08-19T15:30:00Z',
      version_number: 23,
      data_size: 2847,
      completion_percentage: 65,
      auto_save_type: 'auto',
      is_corrupted: false,
      has_conflicts: false,
      recovery_confidence: 'high',
      changed_fields: ['descripción', 'horarios'],
      data_preview: {
        name: 'Cumpleaños Jorge',
        description: 'Celebración de los 30 años de Jorge',
        date: '2024-09-25T20:00:00Z'
      }
    },
    {
      id: 'v1-1692453600',
      timestamp: '2024-08-19T15:20:00Z',
      version_number: 22,
      data_size: 2785,
      completion_percentage: 62,
      auto_save_type: 'auto',
      is_corrupted: false,
      has_conflicts: false,
      recovery_confidence: 'high',
      changed_fields: ['ubicación', 'invitados'],
      data_preview: {
        name: 'Cumpleaños Jorge',
        description: 'Celebración especial',
        date: '2024-09-25T20:00:00Z'
      }
    },
    {
      id: 'v1-1692450000',
      timestamp: '2024-08-19T14:20:00Z',
      version_number: 21,
      data_size: 2234,
      completion_percentage: 58,
      auto_save_type: 'user',
      is_corrupted: false,
      has_conflicts: true,
      recovery_confidence: 'medium',
      changed_fields: ['información básica', 'plantilla'],
      data_preview: {
        name: 'Cumpleaños Jorge',
        description: '',
        date: '2024-09-25T20:00:00Z'
      }
    },
    {
      id: 'backup-emergency',
      timestamp: '2024-08-19T09:00:00Z',
      version_number: 1,
      data_size: 1456,
      completion_percentage: 30,
      auto_save_type: 'emergency',
      is_corrupted: false,
      has_conflicts: false,
      recovery_confidence: 'medium',
      changed_fields: ['configuración inicial'],
      data_preview: {
        name: 'Cumpleaños Jorge',
        description: '',
        date: '2024-09-25T00:00:00Z'
      }
    }
  ]
};

export default function DraftRecovery({ 
  invitationId, 
  onRecoveryComplete, 
  onCancel 
}: DraftRecoveryProps) {
  const router = useRouter();
  const [recoverySession, setRecoverySession] = useState<RecoverySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<RecoveryVersion | null>(null);
  const [compareVersions, setCompareVersions] = useState<RecoveryVersion[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [recoveryInProgress, setRecoveryInProgress] = useState(false);
  const [confirmRecovery, setConfirmRecovery] = useState<{
    open: boolean;
    version: RecoveryVersion | null;
  }>({ open: false, version: null });

  useEffect(() => {
    if (invitationId) {
      loadRecoveryData();
    }
  }, [invitationId]);

  const loadRecoveryData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await invitationsApi.getRecoveryData(invitationId);
      // setRecoverySession(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecoverySession(mockRecoverySession);
    } catch (error) {
      toast.error('Error cargando datos de recuperación');
      console.error('Error loading recovery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'user': return Save;
      case 'auto': return RefreshCw;
      case 'backup': return Database;
      case 'emergency': return Shield;
      default: return FileText;
    }
  };

  const getVersionColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auto': return 'bg-green-100 text-green-800 border-green-200';
      case 'backup': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleRecoverVersion = async (version: RecoveryVersion) => {
    setConfirmRecovery({ open: true, version });
  };

  const executeRecovery = async () => {
    if (!confirmRecovery.version) return;

    setRecoveryInProgress(true);
    try {
      // TODO: Implement recovery API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Versión ${confirmRecovery.version.version_number} recuperada exitosamente`);
      onRecoveryComplete?.(confirmRecovery.version);
    } catch (error) {
      toast.error('Error durante la recuperación');
      console.error('Error recovering version:', error);
    } finally {
      setRecoveryInProgress(false);
      setConfirmRecovery({ open: false, version: null });
    }
  };

  const handleCompareVersions = (version: RecoveryVersion) => {
    if (compareVersions.includes(version)) {
      setCompareVersions(prev => prev.filter(v => v.id !== version.id));
    } else if (compareVersions.length < 2) {
      setCompareVersions(prev => [...prev, version]);
    }
    
    if (compareVersions.length === 1 && !compareVersions.includes(version)) {
      setShowComparison(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Analizando versiones disponibles...</p>
        </div>
      </div>
    );
  }

  if (!recoverySession) {
    return (
      <EmptyState
        icon={<RefreshCw className="w-12 h-12 text-gray-400" />}
        title="No hay datos de recuperación"
        description="No se encontraron versiones recuperables para esta invitación"
        action={
          <Button onClick={onCancel}>
            Volver
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Recovery Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Recuperación de Borrador
            </h2>
            <p className="text-gray-600 mt-1">
              {recoverySession.invitation_name} • Última guardada: {formatDateTime(recoverySession.last_saved)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getRiskColor(recoverySession.total_data_loss_risk)}>
              Riesgo de pérdida: {
                recoverySession.total_data_loss_risk === 'low' ? 'Bajo' :
                recoverySession.total_data_loss_risk === 'medium' ? 'Medio' : 'Alto'
              }
            </Badge>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Recovery Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Versiones disponibles</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{recoverySession.versions.length}</p>
          </div>

          <div className={`rounded-lg p-4 ${
            recoverySession.corruption_detected ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {recoverySession.corruption_detected ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              <span className={`font-medium ${
                recoverySession.corruption_detected ? 'text-red-900' : 'text-green-900'
              }`}>
                Estado de datos
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              recoverySession.corruption_detected ? 'text-red-900' : 'text-green-900'
            }`}>
              {recoverySession.corruption_detected ? 'Corrupción detectada' : 'Datos íntegros'}
            </p>
          </div>

          <div className={`rounded-lg p-4 ${
            recoverySession.emergency_backup_available ? 'bg-purple-50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-5 h-5 ${
                recoverySession.emergency_backup_available ? 'text-purple-600' : 'text-gray-600'
              }`} />
              <span className={`font-medium ${
                recoverySession.emergency_backup_available ? 'text-purple-900' : 'text-gray-900'
              }`}>
                Backup de emergencia
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              recoverySession.emergency_backup_available ? 'text-purple-900' : 'text-gray-900'
            }`}>
              {recoverySession.emergency_backup_available ? 'Disponible' : 'No disponible'}
            </p>
          </div>
        </div>
      </div>

      {/* Version Selection */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Versiones disponibles para recuperación</h3>
          <p className="text-gray-600 mt-1">
            Selecciona la versión que deseas recuperar. Las versiones más recientes aparecen primero.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {recoverySession.versions.map((version, index) => {
            const VersionIcon = getVersionIcon(version.auto_save_type);
            const isSelected = selectedVersion?.id === version.id;
            const isCompareSelected = compareVersions.some(v => v.id === version.id);

            return (
              <div
                key={version.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Version Icon */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <VersionIcon className="w-5 h-5 text-gray-600" />
                  </div>

                  {/* Version Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Versión {version.version_number}
                      </h4>
                      
                      <Badge className={`border ${getVersionColor(version.auto_save_type)}`}>
                        {version.auto_save_type === 'user' ? 'Manual' :
                         version.auto_save_type === 'auto' ? 'Auto-guardado' :
                         version.auto_save_type === 'backup' ? 'Backup' : 'Emergencia'}
                      </Badge>
                      
                      {version.is_corrupted && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Corrupción
                        </Badge>
                      )}
                      
                      {version.has_conflicts && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Conflictos
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Fecha:</span><br />
                        {formatDateTime(version.timestamp)}
                      </div>
                      <div>
                        <span className="font-medium">Completado:</span><br />
                        {version.completion_percentage}%
                      </div>
                      <div>
                        <span className="font-medium">Tamaño:</span><br />
                        {formatFileSize(version.data_size)}
                      </div>
                      <div>
                        <span className="font-medium">Confianza:</span><br />
                        <span className={getConfidenceColor(version.recovery_confidence)}>
                          {version.recovery_confidence === 'high' ? 'Alta' :
                           version.recovery_confidence === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                    </div>

                    {/* Changed Fields */}
                    {version.changed_fields.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Campos modificados:</p>
                        <div className="flex flex-wrap gap-1">
                          {version.changed_fields.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-gray-700 mb-1">Vista previa de datos:</p>
                      <div className="text-gray-600">
                        <p><strong>Nombre:</strong> {version.data_preview.name}</p>
                        <p><strong>Descripción:</strong> {version.data_preview.description || 'Sin descripción'}</p>
                        <p><strong>Fecha:</strong> {formatDateTime(version.data_preview.date)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleRecoverVersion(version)}
                      disabled={version.is_corrupted || recoveryInProgress}
                      className="min-w-[100px]"
                    >
                      {recoveryInProgress ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-1" />
                      )}
                      Recuperar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompareVersions(version)}
                      disabled={version.is_corrupted}
                      className={isCompareSelected ? 'bg-blue-50 border-blue-300' : ''}
                    >
                      <GitCompare className="w-4 h-4 mr-1" />
                      {isCompareSelected ? 'Quitar' : 'Comparar'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Download version data
                        toast('Función de descarga próximamente');
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Panel */}
      {compareVersions.length === 2 && showComparison && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparación de versiones
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowComparison(false);
                  setCompareVersions([]);
                }}
              >
                Cerrar comparación
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {compareVersions.map((version, index) => (
                <div key={version.id} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Versión {version.version_number} ({formatDateTime(version.timestamp)})
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Completado:</strong> {version.completion_percentage}%</p>
                    <p><strong>Tamaño:</strong> {formatFileSize(version.data_size)}</p>
                    <p><strong>Campos modificados:</strong> {version.changed_fields.join(', ')}</p>
                    <div className="mt-3 bg-gray-50 rounded p-3">
                      <p className="font-medium mb-1">Datos:</p>
                      <p>Nombre: {version.data_preview.name}</p>
                      <p>Descripción: {version.data_preview.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recovery Confirmation Dialog */}
      <AlertDialog open={confirmRecovery.open} onOpenChange={(open) => setConfirmRecovery({ open, version: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <AlertDialogTitle>Confirmar recuperación</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pl-13">
              ¿Estás seguro de que quieres recuperar la versión {confirmRecovery.version?.version_number} de la invitación?
              <br />
              <br />
              <strong>Detalles de la recuperación:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Fecha: {confirmRecovery.version && formatDateTime(confirmRecovery.version.timestamp)}</li>
                <li>Completado: {confirmRecovery.version?.completion_percentage}%</li>
                <li>Confianza: {
                  confirmRecovery.version?.recovery_confidence === 'high' ? 'Alta' :
                  confirmRecovery.version?.recovery_confidence === 'medium' ? 'Media' : 'Baja'
                }</li>
                <li>Campos: {confirmRecovery.version?.changed_fields.join(', ')}</li>
              </ul>
              <br />
              Esta acción reemplazará el estado actual del borrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeRecovery}
              disabled={recoveryInProgress}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {recoveryInProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Recuperando...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recuperar versión
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}