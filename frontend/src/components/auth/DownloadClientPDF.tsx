/**
 * DownloadClientPDF Component
 *
 * WHY: Download PDF for authenticated users with invitations stored in database.
 * This component fetches invitation data from the database and generates PDF
 * using the real invitation URL instead of demo localStorage data.
 *
 * WHAT: Button that downloads PDF for production invitations using database data.
 * Used in /mi-cuenta/invitaciones page for user's saved invitations.
 */

'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useExportToPDF } from '@/lib/hooks/usePreview';
import { toast } from 'react-hot-toast';

interface DownloadClientPDFProps {
  /**
   * Invitation data from database
   */
  invitationData: {
    id: number;
    title: string;
    url_slug: string;  // ← CRITICAL: Used to construct production URL
    template_id?: number;
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
}

export function DownloadClientPDF({
  invitationData,
  buttonText = "Descargar",
  size = "default",
  className = "",
  onDownloadStart,
  onDownloadComplete
}: DownloadClientPDFProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // PDF export hook
  const exportToPDF = useExportToPDF();

  /**
   * Process the actual download using Playwright PDF service
   *
   * DIFFERENCE FROM DirectDownloadButton:
   * - Uses url_slug to construct production URL: /invitacion/{url_slug}
   * - Does NOT use localStorage customData
   * - Playwright renders production page which fetches from database
   */
  const processDownload = async () => {
    if (!invitationData || !invitationData.url_slug) {
      toast.error('No hay datos de invitación disponibles');
      return;
    }

    setIsDownloading(true);
    onDownloadStart?.();

    try {
      // Show progress toast with time estimate
      toast.loading('Generando PDF de alta calidad... (esto puede tomar 10-15 segundos)', {
        id: 'pdf-download-client',
        duration: 20000 // Show for 20 seconds max
      });

      console.log('📄 [DownloadClientPDF] Starting PDF generation for invitation:', {
        id: invitationData.id,
        url_slug: invitationData.url_slug,
        title: invitationData.title
      });

      // Use Playwright PDF service with production URL slug
      // Backend will construct: http://localhost:3000/invitacion/{url_slug}?embedded=true
      // That page will fetch data from database via /api/invitations/by-url/{url_slug}
      const result = await exportToPDF.mutateAsync({
        invitationId: invitationData.id,
        urlSlug: invitationData.url_slug,  // ← KEY: Pass url_slug to backend
        options: {
          format: 'A4',
          orientation: 'portrait',
          quality: 'high',
          include_rsvp: true,
          customData: null  // ← NO customData - page fetches from database
        }
      });

      console.log('✅ [DownloadClientPDF] PDF generated successfully:', result);

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = `${invitationData.title || 'invitation'}-${invitationData.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('¡PDF generado y descargado exitosamente!', { id: 'pdf-download-client' });

    } catch (error) {
      console.error('❌ [DownloadClientPDF] PDF Download error:', error);

      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          toast.error('La generación del PDF está tomando más tiempo del esperado. Inténtalo de nuevo.', {
            id: 'pdf-download-client'
          });
        } else if (error.message.includes('Network Error')) {
          toast.error('Error de conexión. Verifica que el servidor esté funcionando.', {
            id: 'pdf-download-client'
          });
        } else {
          toast.error(`Error al generar el PDF: ${error.message}`, {
            id: 'pdf-download-client'
          });
        }
      } else {
        toast.error('Error al generar el PDF. Verifica tu conexión e inténtalo de nuevo.', {
          id: 'pdf-download-client'
        });
      }
    } finally {
      setIsDownloading(false);
      onDownloadComplete?.();
    }
  };

  return (
    <Button
      onClick={processDownload}
      disabled={isDownloading}
      size={size}
      className={className}
    >
      {isDownloading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" className="text-white" />
          Descargando...
        </div>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
