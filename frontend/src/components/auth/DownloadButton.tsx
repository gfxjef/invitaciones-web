/**
 * DownloadButton Component
 *
 * WHY: Smart button that handles download logic with authentication checks.
 * Shows auth modal for non-authenticated users and processes downloads for authenticated users.
 *
 * WHAT: Button that either triggers download immediately (if authenticated)
 * or shows registration modal (if not authenticated).
 */

'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { AuthModal } from './AuthModal';
import { useAuthHook } from '@/lib/hooks/useAuth';
import { useExportToPDF } from '@/lib/hooks/usePreview';
import { toast } from 'react-hot-toast';

interface DownloadButtonProps {
  /**
   * Template/invitation data to download
   */
  templateData?: {
    id: number;
    name: string;
    template?: any;
  };

  /**
   * Custom button text
   */
  buttonText?: string;

  /**
   * Button size variant
   */
  size?: 'sm' | 'default' | 'lg';

  /**
   * Custom button className
   */
  className?: string;

  /**
   * Callback when download is initiated
   */
  onDownloadStart?: () => void;

  /**
   * Callback when download completes
   */
  onDownloadComplete?: () => void;

  /**
   * Callback when user authenticates via modal
   */
  onAuthSuccess?: () => void;
}

export function DownloadButton({
  templateData,
  buttonText = "Descargar Invitación",
  size = "default",
  className = "",
  onDownloadStart,
  onDownloadComplete,
  onAuthSuccess
}: DownloadButtonProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Get auth state
  const { user, isAuthenticated, isLoading: authLoading } = useAuthHook();

  // PDF export hook
  const exportToPDF = useExportToPDF();

  /**
   * Process the actual download using Playwright PDF service
   */
  const processDownload = async () => {
    if (!templateData) {
      toast.error('No hay datos de plantilla disponibles');
      return;
    }

    setIsDownloading(true);
    onDownloadStart?.();

    try {
      // Show progress toast with time estimate
      toast.loading('Generando PDF de alta calidad... (esto puede tomar 10-15 segundos)', {
        id: 'pdf-download',
        duration: 20000 // Show for 20 seconds max
      });

      // Use new Playwright PDF service
      const result = await exportToPDF.mutateAsync({
        invitationId: templateData.id,
        options: {
          format: 'A4',
          orientation: 'portrait',
          quality: 'high',
          include_rsvp: true
        }
      });

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = `${templateData.name || 'invitation'}-${templateData.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('¡PDF generado y descargado exitosamente!', { id: 'pdf-download' });

    } catch (error) {
      console.error('PDF Download error:', error);

      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          toast.error('La generación del PDF está tomando más tiempo del esperado. Inténtalo de nuevo.', { id: 'pdf-download' });
        } else if (error.message.includes('Network Error')) {
          toast.error('Error de conexión. Verifica que el servidor esté funcionando.', { id: 'pdf-download' });
        } else {
          toast.error(`Error al generar el PDF: ${error.message}`, { id: 'pdf-download' });
        }
      } else {
        toast.error('Error al generar el PDF. Verifica tu conexión e inténtalo de nuevo.', { id: 'pdf-download' });
      }
    } finally {
      setIsDownloading(false);
      onDownloadComplete?.();
    }
  };

  /**
   * Handle button click
   */
  const handleClick = () => {
    if (authLoading) {
      return; // Still checking auth state
    }

    if (isAuthenticated) {
      // User is authenticated, process download immediately
      processDownload();
    } else {
      // User is not authenticated, show auth modal
      setShowAuthModal(true);
    }
  };

  /**
   * Handle successful authentication from modal
   */
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onAuthSuccess?.();

    // Auto-trigger download after successful auth
    setTimeout(() => {
      processDownload();
    }, 500); // Small delay for better UX
  };

  const isLoading = authLoading || isDownloading;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        size={size}
        className={`bg-purple-600 hover:bg-purple-700 ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" className="text-white" />
            {isDownloading ? 'Descargando...' : 'Verificando...'}
          </div>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab="register" // Start with register for better conversion
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}

/**
 * Hook for download functionality (optional utility)
 */
export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { isAuthenticated } = useAuthHook();

  const download = async (templateData: any) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para descargar');
      return false;
    }

    setIsDownloading(true);

    try {
      // Download logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Descarga completada');
      return true;
    } catch (error) {
      toast.error('Error al descargar');
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    download,
    isDownloading
  };
}