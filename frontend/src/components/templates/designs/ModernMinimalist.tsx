/**
 * Modern Minimalist Template
 *
 * WHY: Clean, modern wedding invitation template with minimalist design
 * and focus on typography and white space.
 */

'use client';

import { useState } from 'react';
import {
  Calendar, Clock, MapPin, ExternalLink, Volume2, VolumeX, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateProps } from '@/types/template';
import { CountdownTimer } from '../shared/CountdownTimer';
import { ShareButtons } from '../shared/ShareButtons';
import { RSVPSection } from '../shared/RSVPSection';

export const ModernMinimalist: React.FC<TemplateProps> = ({
  invitation,
  data,
  template,
  colors,
  features,
  media,
  events,
  isPreview = false,
  isEditing = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Get main event (ceremony) and reception event
  const ceremonyEvent = events.find(e => e.event_type === 'ceremony') || events[0];
  const receptionEvent = events.find(e => e.event_type === 'reception');

  // Get media files
  const heroImage = media.find(m => m.media_type === 'hero');
  const coupleImage = media.find(m => m.media_type === 'couple');

  // Build share URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Invitación de ${data.couple_bride_name} y ${data.couple_groom_name}`;
  const shareDescription = `Te invitamos a celebrar nuestro matrimonio el ${data.event_date}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Fixed Header */}
      <header
        className="fixed top-0 w-full z-10 backdrop-blur-sm py-4 px-6"
        style={{ backgroundColor: `${colors.background}95` }}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Logo/Names */}
          <div className="font-light text-lg" style={{ color: colors.text }}>
            {data.couple_bride_name?.split(' ')[0]} & {data.couple_groom_name?.split(' ')[0]}
          </div>

          <div className="flex gap-4">
            {/* Share Button */}
            {features.includes('social_share') && (
              <ShareButtons
                data={data}
                colors={colors}
                url={shareUrl}
                title={shareTitle}
                description={shareDescription}
                hashtag={data.social_hashtag}
              />
            )}

            {/* Audio Toggle */}
            {features.includes('music') && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full flex items-center justify-center border hover:opacity-70 transition-opacity"
                style={{
                  borderColor: colors.border,
                  color: colors.text
                }}
                disabled={isPreview}
              >
                {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        {/* Background Image */}
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage.file_path})`,
              filter: 'brightness(0.3)'
            }}
          />
        )}

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Welcome Message */}
          <div className="mb-12">
            <div
              className="inline-block text-sm uppercase tracking-[0.3em] mb-8 font-light"
              style={{ color: heroImage ? '#FFFFFF' : colors.text_light }}
            >
              {data.message_welcome_text || 'Nos casamos'}
            </div>

            <h1
              className="text-6xl md:text-8xl font-thin mb-8 leading-tight"
              style={{
                color: heroImage ? '#FFFFFF' : colors.text,
                fontFamily: 'serif'
              }}
            >
              {data.couple_bride_name}
              <div className="text-2xl md:text-3xl my-4 font-light">y</div>
              {data.couple_groom_name}
            </h1>

            <div
              className="text-xl md:text-2xl font-light tracking-wide"
              style={{ color: heroImage ? '#FFFFFF' : colors.text_light }}
            >
              {new Date(data.event_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Countdown */}
          {features.includes('countdown') && (
            <div className="mb-12">
              <CountdownTimer
                targetDate={data.event_date}
                colors={heroImage ? {
                  ...colors,
                  text: '#FFFFFF',
                  text_light: '#FFFFFF',
                  accent: '#FFFFFF'
                } : colors}
                showLabels={true}
                size="medium"
              />
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div
            className="w-px h-16 animate-pulse"
            style={{ backgroundColor: heroImage ? '#FFFFFF' : colors.text_light }}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="py-24" style={{ backgroundColor: colors.background_alt }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Couple Photo */}
            <div className="order-2 md:order-1">
              {coupleImage ? (
                <img
                  src={coupleImage.file_path}
                  alt="Foto de la pareja"
                  className="w-full aspect-[4/5] object-cover"
                  style={{ filter: 'grayscale(20%)' }}
                />
              ) : (
                <div
                  className="w-full aspect-[4/5] flex items-center justify-center"
                  style={{ backgroundColor: colors.border }}
                >
                  <Users className="w-16 h-16" style={{ color: colors.text_light }} />
                </div>
              )}
            </div>

            {/* Story Text */}
            <div className="order-1 md:order-2 space-y-6">
              <h2
                className="text-3xl md:text-4xl font-thin"
                style={{ color: colors.text }}
              >
                Nuestra Historia
              </h2>
              <div
                className="text-lg leading-relaxed font-light"
                style={{ color: colors.text_light }}
              >
                {data.couple_story || data.message_invitation_text ||
                 'Dos corazones que se encontraron y decidieron escribir juntos la más hermosa historia de amor.'}
              </div>

              {(data.couple_bride_parents || data.couple_groom_parents) && (
                <div className="space-y-2 text-sm" style={{ color: colors.text_light }}>
                  {data.couple_bride_parents && (
                    <p>
                      <span className="font-medium">{data.couple_bride_name}</span>
                      <br />
                      Hija de {data.couple_bride_parents}
                    </p>
                  )}
                  {data.couple_groom_parents && (
                    <p>
                      <span className="font-medium">{data.couple_groom_name}</span>
                      <br />
                      Hijo de {data.couple_groom_parents}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-24" style={{ backgroundColor: colors.background }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-thin text-center mb-16"
            style={{ color: colors.text }}
          >
            Información del Evento
          </h2>

          <div className="space-y-12">
            {/* Ceremony */}
            {ceremonyEvent && (
              <div className="border-l-2 pl-8" style={{ borderColor: colors.accent }}>
                <div className="mb-4">
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    {ceremonyEvent.name || 'Ceremonia'}
                  </h3>
                  <div className="flex flex-wrap gap-6 text-sm" style={{ color: colors.text_light }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(ceremonyEvent.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {ceremonyEvent.time || data.event_time} hrs
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1" style={{ color: colors.text_light }} />
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {ceremonyEvent.venue_name || data.event_venue_name}
                      </p>
                      <p className="text-sm" style={{ color: colors.text_light }}>
                        {ceremonyEvent.venue_address || data.event_venue_address}
                      </p>
                    </div>
                  </div>

                  {features.includes('maps') && (ceremonyEvent.venue_location_url || data.event_venue_location_url) && (
                    <Button
                      variant="ghost"
                      className="mt-2 h-auto p-0 font-light"
                      style={{ color: colors.accent }}
                      onClick={() => {
                        const url = ceremonyEvent.venue_location_url || data.event_venue_location_url;
                        if (!isPreview && url) {
                          window.open(url, '_blank');
                        }
                      }}
                      disabled={isPreview}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver ubicación
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Reception */}
            {receptionEvent && (
              <div className="border-l-2 pl-8" style={{ borderColor: colors.primary }}>
                <div className="mb-4">
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    {receptionEvent.name || 'Recepción'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.text_light }}>
                    <Clock className="w-4 h-4" />
                    {receptionEvent.time} hrs
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1" style={{ color: colors.text_light }} />
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {receptionEvent.venue_name}
                      </p>
                      <p className="text-sm" style={{ color: colors.text_light }}>
                        {receptionEvent.venue_address}
                      </p>
                    </div>
                  </div>

                  {features.includes('maps') && receptionEvent.venue_location_url && (
                    <Button
                      variant="ghost"
                      className="mt-2 h-auto p-0 font-light"
                      style={{ color: colors.primary }}
                      onClick={() => {
                        if (!isPreview && receptionEvent.venue_location_url) {
                          window.open(receptionEvent.venue_location_url, '_blank');
                        }
                      }}
                      disabled={isPreview}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver ubicación
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dress Code */}
          {data.dress_code && (
            <div className="mt-16 text-center">
              <p className="text-sm mb-2" style={{ color: colors.text_light }}>
                Código de vestimenta
              </p>
              <p
                className="text-lg font-light"
                style={{ color: colors.text }}
              >
                {data.dress_code}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RSVP Section */}
      {features.includes('rsvp') && data.rsvp_enabled && (
        <section className="py-24" style={{ backgroundColor: colors.background_alt }}>
          <div className="max-w-2xl mx-auto px-6">
            <h2
              className="text-3xl md:text-4xl font-thin text-center mb-16"
              style={{ color: colors.text }}
            >
              Confirma tu Asistencia
            </h2>
            <RSVPSection
              data={data}
              colors={colors}
              rsvpData={{
                enabled: data.rsvp_enabled,
                deadline: data.rsvp_deadline,
                max_guests: data.rsvp_max_guests,
                phone: data.rsvp_phone,
                whatsapp: data.rsvp_whatsapp,
                email: data.rsvp_email,
                message: data.rsvp_message
              }}
              isPreview={isPreview}
              className="border-0 shadow-none bg-transparent"
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 text-center" style={{ backgroundColor: colors.background }}>
        <div className="max-w-4xl mx-auto px-6">
          <p
            className="text-lg font-light mb-6"
            style={{ color: colors.text }}
          >
            {data.message_thank_you || 'Esperamos celebrar junto a ti este momento tan especial'}
          </p>

          {data.social_hashtag && (
            <p
              className="text-sm font-light tracking-wider"
              style={{ color: colors.text_light }}
            >
              {data.social_hashtag}
            </p>
          )}

          <div
            className="mt-12 pt-8 border-t text-xs font-light"
            style={{
              borderColor: colors.border,
              color: colors.text_light
            }}
          >
            <p>Invitación creada con amor</p>
          </div>
        </div>
      </footer>
    </div>
  );
};