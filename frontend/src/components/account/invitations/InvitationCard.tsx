/**
 * Individual Invitation Card Component - New Design
 *
 * WHY: Modern card design with left preview and right info/actions layout
 *
 * WHAT: Two-column card with preview, stats, and action buttons
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Star,
  Users,
  Calendar,
  Baby,
  Eye,
  QrCode,
  Link2,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { type Invitation } from '@/lib/api';
import { DownloadClientPDF } from '@/components/auth/DownloadClientPDF';
import { ShareURLModal } from './ShareURLModal';
import toast from 'react-hot-toast';

interface InvitationCardProps {
  invitation: Invitation;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onView?: (invitation: Invitation) => void;
  onEdit?: (invitation: Invitation) => void;
  onDuplicate?: (invitation: Invitation) => void;
  onDelete?: (invitation: Invitation) => void;
  onShare?: (invitation: Invitation) => void;
  onArchive?: (invitation: Invitation) => void;
  className?: string;
}

const EVENT_TYPE_LABELS = {
  boda: 'Boda',
  weddings: 'Boda',
  quince: 'XV Años',
  bautizo: 'Bautizo',
  cumpleanos: 'Cumpleaños',
  baby_shower: 'Baby Shower',
  otro: 'Otro',
};

export default function InvitationCard({
  invitation,
  className = ''
}: InvitationCardProps) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'boda':
      case 'weddings':
        return Heart;
      case 'quince':
        return Star;
      case 'bautizo':
        return Users;
      case 'cumpleanos':
        return Calendar;
      case 'baby_shower':
        return Baby;
      default:
        return Calendar;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha configurada';

    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';

    try {
      return new Date(dateString).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const calculateResponseRate = () => {
    const { stats } = invitation;
    // Backend only provides total rsvps count
    return stats.rsvps > 0 ? 100 : 0;
  };

  // Action Handlers
  const handleCopyURL = () => {
    // Open share modal instead of direct copy
    setShowShareModal(true);
  };

  const handleGetQR = () => {
    // Download QR code
    const qrUrl = `/r/${invitation.url_slug}/qr`;
    window.open(qrUrl, '_blank');
    toast.info('Abriendo código QR...');
  };

  const handleStatistics = () => {
    router.push(`/mi-cuenta/invitaciones/${invitation.id}/analytics`);
  };

  const EventTypeIcon = getEventTypeIcon(invitation.event_type);
  const responseRate = calculateResponseRate();
  const eventLabel = EVENT_TYPE_LABELS[invitation.event_type] || 'Evento';

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-2 lg:gap-3 ${className}`}>
      {/* Left Card - Preview with Background Image */}
      <div
        className="rounded-2xl border-2 border-black p-3 flex flex-col justify-between min-h-[200px] bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: (invitation.hero_image_url || invitation.thumbnail_url)
            ? `url(${invitation.hero_image_url || invitation.thumbnail_url})`
            : 'none',
          backgroundColor: (invitation.hero_image_url || invitation.thumbnail_url) ? 'transparent' : 'white'
        }}
      >
        {/* Overlay para mejorar legibilidad de badges si hay imagen */}
        {(invitation.hero_image_url || invitation.thumbnail_url) && (
          <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
        )}

        {/* Event Type Badge */}
        <div className="inline-flex items-center justify-center bg-black text-white rounded-full px-3 py-1 text-xs font-medium self-start relative z-10">
          <EventTypeIcon className="w-3 h-3 mr-1" />
          {eventLabel}
        </div>

        {/* Icon fallback if no image */}
        {!invitation.hero_image_url && !invitation.thumbnail_url && (
          <div className="flex-1 flex items-center justify-center">
            <EventTypeIcon className="w-16 h-16 text-gray-200" />
          </div>
        )}

        {/* Plan Name Badge */}
        <div className="inline-flex items-center justify-center bg-black text-white rounded-full px-3 py-1 text-xs font-medium self-start relative z-10">
          {invitation.plan_name || 'Plan Estándar'}
        </div>
      </div>

      {/* Right Section - Info & Actions */}
      <div className="space-y-2 lg:space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-lg lg:text-xl xl:text-2xl font-bold mb-1 lg:mb-2 line-clamp-2">
            {invitation.title}
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-gray-600">
            {formatDate(invitation.event_date)}
            {invitation.event_date && formatTime(invitation.event_date) && (
              <> • {formatTime(invitation.event_date)}</>
            )}
          </p>
        </div>

        {/* Stats Grid - 3 columns */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-200 rounded-xl p-2 flex flex-col items-center justify-center">
            <Eye className="w-4 h-4 mb-1" />
            <p className="text-base lg:text-lg font-semibold mb-0.5">{invitation.stats.views}</p>
            <p className="text-[10px] lg:text-xs text-gray-700">Vistas</p>
          </div>

          <div className="bg-gray-200 rounded-xl p-2 flex flex-col items-center justify-center">
            <Users className="w-4 h-4 mb-1" />
            <p className="text-base lg:text-lg font-semibold mb-0.5">{invitation.stats.rsvps}</p>
            <p className="text-[10px] lg:text-xs text-gray-700">RSVPs</p>
          </div>

          <div className="bg-gray-200 rounded-xl p-2 flex flex-col items-center justify-center">
            <TrendingUp className="w-4 h-4 mb-1" />
            <p className="text-base lg:text-lg font-semibold mb-0.5">{responseRate}%</p>
            <p className="text-[10px] lg:text-xs text-gray-700">Respuesta</p>
          </div>
        </div>

        {/* Action Buttons Grid - 2 columns */}
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
            <Link2 className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Copiar URL</span>
          </button>
        </div>

        {/* Bottom Buttons Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleStatistics}
            className="bg-white border-2 border-black rounded-2xl py-2 px-2 lg:px-3 text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Estadísticas</span>
          </button>

          <button
            onClick={handleGetQR}
            className="bg-white border-2 border-black rounded-2xl py-2 px-2 lg:px-3 text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <QrCode className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Obtener QR</span>
          </button>
        </div>
      </div>

      {/* Share URL Modal */}
      <ShareURLModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
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
    </div>
  );
}
