/**
 * Individual Invitation Card Component - Horizontal Minimalist Design
 *
 * WHY: Clean horizontal card with hero image, minimal info, and "VER MÁS" action
 * Opens modal with full details on click
 *
 * WHAT: Card with background hero image, gradient overlay, badges, title, and action button
 */

'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { type Invitation } from '@/lib/api';
import { InvitationDetailsModal } from './InvitationDetailsModal';

interface InvitationCardProps {
  invitation: Invitation;
  className?: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Format date: "15 oct. 2027"
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Format time: "09:04 p. m."
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  // Get event type label
  const getEventTypeLabel = (eventType?: string) => {
    return EVENT_TYPE_LABELS[eventType || ''] || 'Evento';
  };

  const eventLabel = getEventTypeLabel(invitation.event_type);
  const isPremium = invitation.plan_name?.toLowerCase() === 'premium';

  return (
    <>
      {/* Horizontal Minimalist Card */}
      <div
        className={`relative w-full h-80 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group ${className}`}
        onClick={() => setShowDetailsModal(true)}
      >
        {/* Hero Image - Right side (75% width) */}
        {(invitation.hero_image_url || invitation.thumbnail_url) && (
          <img
            src={invitation.hero_image_url || invitation.thumbnail_url}
            alt={invitation.title}
            className="absolute right-0 top-0 h-full w-3/4 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 from-25% to-transparent" />

        {/* Content - Left side */}
        <div className="relative h-full flex flex-col justify-between px-6 md:px-12 py-6 md:py-10 z-10">
          {/* Top: Badges */}
          <div className="flex flex-col gap-2">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium w-fit shadow-lg">
              💍 {eventLabel}
            </span>
            {isPremium && (
              <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-xs md:text-sm font-bold w-fit shadow-lg">
                ⭐ Premium
              </span>
            )}
          </div>

          {/* Middle: Title & Date */}
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
              {invitation.title}
            </h2>
            <p className="text-base md:text-lg text-gray-300">
              {formatDate(invitation.event_date)}
              {invitation.event_date && formatTime(invitation.event_date) && (
                <> • {formatTime(invitation.event_date)}</>
              )}
            </p>
          </div>

          {/* Bottom: Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailsModal(true);
            }}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-base md:text-lg group self-start"
          >
            <span className="font-medium">VER MÁS</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Fallback background pattern if no image */}
        {!invitation.hero_image_url && !invitation.thumbnail_url && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-50" />
        )}
      </div>

      {/* Details Modal */}
      <InvitationDetailsModal
        invitation={invitation}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </>
  );
}
