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

  // Helper: Break title into lines with max 10 chars per line
  const breakTitle = (title: string) => {
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= 10) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    return lines;
  };

  const titleLines = breakTitle(invitation.title);

  return (
    <>
      {/* Horizontal Minimalist Card - Reduced Height */}
      <div
        className={`relative w-full h-52 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group ${className}`}
        onClick={() => setShowDetailsModal(true)}
      >
        {/* Hero Image - Full Width (100%) */}
        {(invitation.hero_image_url || invitation.thumbnail_url) && (
          <img
            src={invitation.hero_image_url || invitation.thumbnail_url}
            alt={invitation.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Color Overlay Layer - 15% opacity for color tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 opacity-15" />

        {/* Gradient Overlay with Transparency - For text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 from-25% to-transparent" />

        {/* Content - Left side */}
        <div className="relative h-full flex flex-col justify-between px-6 md:px-8 py-4 md:py-6 z-10">
          {/* Top: Title */}
          <div className="flex-1 flex items-start pt-2">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-blue-300 transition-colors">
              {titleLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>

          {/* Bottom Row: VER MÁS (left) and Badges (right) */}
          <div className="flex items-center justify-between">
            {/* Left: Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailsModal(true);
              }}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm md:text-base group"
            >
              <span className="font-medium">VER MÁS</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Right: Badges */}
            <div className="flex flex-col gap-1.5 items-end">
              <span className="bg-purple-600 text-white px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium shadow-lg whitespace-nowrap">
                💍 {eventLabel}
              </span>
              {isPremium && (
                <span className="bg-amber-500 text-black px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold shadow-lg whitespace-nowrap">
                  ⭐ Premium
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Fallback background pattern if no image */}
        {!invitation.hero_image_url && !invitation.thumbnail_url && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-purple-800 to-slate-800 opacity-60" />
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
