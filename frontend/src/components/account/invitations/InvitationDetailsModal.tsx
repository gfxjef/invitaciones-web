/**
 * Invitation Details Modal Component
 *
 * WHY: Displays all invitation details and actions in a modal when user clicks "VER MÁS"
 * Keeps the card view clean and minimal while providing full functionality on demand.
 *
 * WHAT: Modal with stats, action buttons (download, copy URL, analytics, QR)
 */

'use client';

import { useState } from 'react';
import { type Invitation } from '@/lib/api';
import {
  X,
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';
import { ShareURLModal } from './ShareURLModal';
import { useExportToPDF } from '@/lib/hooks/usePreview';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface InvitationDetailsModalProps {
  invitation: Invitation;
  isOpen: boolean;
  onClose: () => void;
}

export function InvitationDetailsModal({
  invitation,
  isOpen,
  onClose
}: InvitationDetailsModalProps) {
  const router = useRouter();
  const [showShareURLModal, setShowShareURLModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const exportToPDF = useExportToPDF();

  // Don't render if not open
  if (!isOpen) return null;

  // Format date: "15 oct. 2027"
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time: "09:04 p. m."
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate response rate
  const calculateResponseRate = () => {
    const { stats } = invitation;
    if (!stats || !stats.views || stats.views === 0) return 0;
    return Math.round((stats.rsvps / stats.views) * 100);
  };

  // Handle download PDF
  const handleDownload = async () => {
    if (!invitation || !invitation.url_slug) {
      toast.error('No hay datos de invitación disponibles');
      return;
    }

    setIsDownloading(true);

    try {
      const result = await exportToPDF.mutateAsync({
        invitationId: invitation.id,
        urlSlug: invitation.url_slug,
        options: {
          format: 'A4',
          orientation: 'portrait',
          quality: 'high',
          include_rsvp: true,
          customData: null
        }
      });

      if (result && result.pdf_url) {
        const link = document.createElement('a');
        link.href = result.pdf_url;
        link.download = `${invitation.title || 'invitacion'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF descargado exitosamente');
      } else {
        toast.error('Error al generar PDF');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Error al descargar PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle copy URL - Open ShareURLModal
  const handleCopyURL = () => {
    setShowShareURLModal(true);
  };

  // Handle get QR
  const handleGetQR = () => {
    const qrUrl = `/r/${invitation.url_slug}/qr`;
    window.open(qrUrl, '_blank');
    toast.success('Abriendo código QR...');
  };

  // Handle statistics navigation
  const handleStatistics = () => {
    router.push(`/mi-cuenta/invitaciones/${invitation.id}/analytics`);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Add event listener for ESC key
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  return (
    <>
      {/* ShareURL Modal */}
      <ShareURLModal
        isOpen={showShareURLModal}
        onClose={() => setShowShareURLModal(false)}
        invitation={{
          id: invitation.id,
          url_slug: invitation.url_slug,
          groom_name: invitation.groom_name,
          bride_name: invitation.bride_name,
          short_code: invitation.short_code,
          custom_names: invitation.custom_names,
          plan_id: invitation.plan_id
        }}
      />

      {/* Invitation Details Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Header with Close Button */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h1 className="text-xl lg:text-2xl font-bold mb-1 line-clamp-2">
              {invitation.title}
            </h1>
            <p className="text-sm lg:text-base text-gray-600">
              {formatDate(invitation.event_date)} • {formatTime(invitation.event_date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-4 lg:mb-6">
          <div className="bg-gray-200 rounded-xl p-2 lg:p-3 flex flex-col items-center justify-center">
            <Eye className="w-4 h-4 mb-1" aria-hidden="true" />
            <p className="text-base lg:text-lg font-semibold mb-0.5">
              {invitation.stats?.views || 0}
            </p>
            <p className="text-[10px] lg:text-xs text-gray-700">Vistas</p>
          </div>
          <div className="bg-gray-200 rounded-xl p-2 lg:p-3 flex flex-col items-center justify-center">
            <Users className="w-4 h-4 mb-1" aria-hidden="true" />
            <p className="text-base lg:text-lg font-semibold mb-0.5">
              {invitation.stats?.rsvps || 0}
            </p>
            <p className="text-[10px] lg:text-xs text-gray-700">RSVPs</p>
          </div>
          <div className="bg-gray-200 rounded-xl p-2 lg:p-3 flex flex-col items-center justify-center">
            <TrendingUp className="w-4 h-4 mb-1" aria-hidden="true" />
            <p className="text-base lg:text-lg font-semibold mb-0.5">
              {calculateResponseRate()}%
            </p>
            <p className="text-[10px] lg:text-xs text-gray-700">Respuesta</p>
          </div>
        </div>

        {/* Action Cards Grid - 2x2 with horizontal card design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card 1: Descargar PDF */}
          <div
            onClick={handleDownload}
            className="relative h-40 rounded-xl overflow-hidden bg-slate-800 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
          >
            {/* Background Image - Full width, object-right to start from right edge */}
            <img
              src="https://www.kossomet.com/AppUp/default/download.webp"
              alt="Descargar PDF"
              className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500"
            />
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 opacity-15" />
            {/* Gradient for text readability - Dark from left, transparent to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 from-10% via-slate-900/80 via-50% to-transparent" />
            {/* Content - Left Side */}
            <div className="relative h-full flex flex-col justify-center pl-8 pr-[40%] z-10">
              <h3 className="text-white font-bold text-base md:text-lg mb-1">
                {isDownloading ? 'Descargando...' : 'Descargar PDF'}
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-tight">
                Descarga los PDF's de manera fácil para compartir con tus invitados
              </p>
            </div>
          </div>

          {/* Card 2: Copiar URL */}
          <div
            onClick={handleCopyURL}
            className="relative h-40 rounded-xl overflow-hidden bg-slate-800 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
          >
            {/* Background Image - Full width, object-right to start from right edge */}
            <img
              src="https://www.kossomet.com/AppUp/default/link_url.webp"
              alt="Copiar URL"
              className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500"
            />
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 opacity-15" />
            {/* Gradient for text readability - Dark from left, transparent to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 from-10% via-slate-900/80 via-50% to-transparent" />
            {/* Content - Left Side */}
            <div className="relative h-full flex flex-col justify-center pl-8 pr-[40%] z-10">
              <h3 className="text-white font-bold text-base md:text-lg mb-1">
                Copiar URL
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-tight">
                Comparte el enlace por WhatsApp, redes sociales o email
              </p>
            </div>
          </div>

          {/* Card 3: Estadísticas */}
          <div
            onClick={handleStatistics}
            className="relative h-40 rounded-xl overflow-hidden bg-slate-800 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
          >
            {/* Background Image - Full width, object-right to start from right edge */}
            <img
              src="https://www.kossomet.com/AppUp/default/staditic.webp"
              alt="Estadísticas"
              className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500"
            />
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 opacity-15" />
            {/* Gradient for text readability - Dark from left, transparent to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 from-10% via-slate-900/80 via-50% to-transparent" />
            {/* Content - Left Side */}
            <div className="relative h-full flex flex-col justify-center pl-8 pr-[40%] z-10">
              <h3 className="text-white font-bold text-base md:text-lg mb-1">
                Estadísticas
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-tight">
                Visualiza métricas detalladas de visitas, confirmaciones y más
              </p>
            </div>
          </div>

          {/* Card 4: Obtener QR */}
          <div
            onClick={handleGetQR}
            className="relative h-40 rounded-xl overflow-hidden bg-slate-800 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
          >
            {/* Background Image - Full width, object-right to start from right edge */}
            <img
              src="https://www.kossomet.com/AppUp/default/qrcode.webp"
              alt="Obtener QR"
              className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-500"
            />
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 opacity-15" />
            {/* Gradient for text readability - Dark from left, transparent to right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 from-10% via-slate-900/80 via-50% to-transparent" />
            {/* Content - Left Side */}
            <div className="relative h-full flex flex-col justify-center pl-8 pr-[40%] z-10">
              <h3 className="text-white font-bold text-base md:text-lg mb-1">
                Obtener QR
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-tight">
                Genera un código QR para imprimir en tus tarjetas físicas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
