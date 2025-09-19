/**
 * Invitation Edit Page (/invitacion/[id]/edit)
 * 
 * WHY: Provides the main editor interface for users to customize their
 * wedding invitations. Uses all the editor components and hooks created
 * in Issues #49-#51 to provide a complete editing experience.
 * 
 * WHAT: Protected page that loads an existing invitation and allows
 * full customization using the InvitationEditor component.
 */

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/authStore';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import InvitationEditor from '@/components/editor/InvitationEditor';

interface InvitationEditPageProps {
  params: {
    id: string;
  };
}

export default function InvitationEditPage({ params }: InvitationEditPageProps) {
  const router = useRouter();
  const invitationId = parseInt(params.id);
  
  // Require authentication
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();

  // Validate invitation ID
  if (isNaN(invitationId) || invitationId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invitación no válida
          </h1>
          <p className="text-gray-600 mb-6">
            El ID de invitación proporcionado no es válido.
          </p>
          <Button onClick={() => router.push('/mi-cuenta/invitaciones')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Mis Invitaciones
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Show auth required if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Restringido
          </h1>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para editar invitaciones.
          </p>
          <Button onClick={() => router.push('/login')}>
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/mi-cuenta/invitaciones')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Editor de Invitación
                </h1>
                <p className="text-sm text-gray-600">
                  Editando invitación #{invitationId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {user?.first_name || 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <InvitationEditor invitationId={invitationId} />
    </div>
  );
}