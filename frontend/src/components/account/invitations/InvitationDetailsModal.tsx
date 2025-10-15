/**
 * Invitation Details Modal Component
 *
 * WHY: Displays all invitation details and actions in a modal when user clicks "VER MÁS"
 * Keeps the card view clean and minimal while providing full functionality on demand.
 *
 * WHAT: Modal with stats, action buttons (download, copy URL, analytics, QR)
 */

'use client';

import { type Invitation } from '@/lib/api';
import {
  X,
  Eye,
  Users,
  TrendingUp,
  Link2,
  ChartColumn,
  QrCode
} from 'lucide-react';
import { DownloadClientPDF } from '@/components/auth/DownloadClientPDF';
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

  // Handle copy URL
  const handleCopyURL = () => {
    if (invitation.full_url) {
      navigator.clipboard.writeText(invitation.full_url);
      toast.success('URL copiada al portapapeles');
    } else {
      toast.error('URL no disponible');
    }
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
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

        {/* Action Buttons Grid */}
        <div className="space-y-2 lg:space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <DownloadClientPDF
              invitationData={{
                id: invitation.id,
                title: invitation.title,
                url_slug: invitation.url_slug,
                template_id: invitation.template_id
              }}
              buttonText="Descargar"
              size="default"
              className="bg-white border-2 border-black rounded-2xl py-2 px-2 lg:px-3 text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 h-auto"
            />
            <button
              onClick={handleCopyURL}
              className="bg-white border-2 border-black rounded-2xl py-2 px-2 lg:px-3 text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
            >
              <Link2 className="w-3 h-3 lg:w-4 lg:h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Copiar URL</span>
              <span className="sm:hidden">URL</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleStatistics}
              className="bg-white border-2 border-black rounded-2xl py-2 px-2 lg:px-3 text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
            >
              <ChartColumn className="w-3 h-3 lg:w-4 lg:h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Estadísticas</span>
              <span className="sm:hidden">Stats</span>
            </button>
            <button
              onClick={handleGetQR}
              className="bg-white border-2 border-black rounded-2xl py-2 px-2 lg:px-3 text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
            >
              <QrCode className="w-3 h-3 lg:w-4 lg:h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Obtener QR</span>
              <span className="sm:hidden">QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
