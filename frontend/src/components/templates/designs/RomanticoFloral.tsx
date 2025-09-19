/**
 * Romantico Floral Template
 *
 * WHY: Romantic wedding invitation template with floral elements
 * and soft, romantic styling perfect for garden or outdoor weddings.
 */

'use client';

import { useState } from 'react';
import {
  Heart, Calendar, Clock, MapPin, ExternalLink, Music, Volume2, VolumeX,
  Flower2, Cherry
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateProps } from '@/types/template';
import { CountdownTimer } from '../shared/CountdownTimer';
import { ShareButtons } from '../shared/ShareButtons';
import { RSVPSection } from '../shared/RSVPSection';

export const RomanticoFloral: React.FC<TemplateProps> = ({
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
  const galleryImages = media.filter(m => m.media_type === 'gallery' && m.id !== coupleImage?.id);

  // Build share URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Invitación de ${data.couple_bride_name} y ${data.couple_groom_name}`;
  const shareDescription = `Te invitamos a celebrar nuestro matrimonio el ${data.event_date}`;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Decorative floral elements */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <Flower2 className="absolute top-10 left-10 w-32 h-32" style={{ color: colors.accent }} />
        <Cherry className="absolute top-32 right-16 w-24 h-24" style={{ color: colors.primary }} />
        <Flower2 className="absolute bottom-20 left-20 w-28 h-28" style={{ color: colors.secondary }} />
        <Cherry className="absolute bottom-10 right-32 w-20 h-20" style={{ color: colors.accent }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          {heroImage ? (
            <>
              <img
                src={heroImage.file_path}
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}60)`
                }}
              />
            </>
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}30, ${colors.accent}20)`
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between z-20">
          {/* Share Button */}
          {features.includes('social_share') && (
            <ShareButtons
              data={data}
              colors={{
                ...colors,
                text: '#FFFFFF',
                primary: colors.accent
              }}
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
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              disabled={isPreview}
            >
              {isPlaying ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Decorative border */}
          <div
            className="border-2 rounded-lg p-12 backdrop-blur-sm"
            style={{
              borderColor: `${colors.accent}60`,
              backgroundColor: `${colors.background}10`
            }}
          >
            {/* Welcome Message */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="flex-1 h-px" style={{ backgroundColor: colors.accent }} />
                <Heart className="mx-4 w-6 h-6" style={{ color: colors.accent }} />
                <div className="flex-1 h-px" style={{ backgroundColor: colors.accent }} />
              </div>

              <div
                className="text-sm uppercase tracking-[0.2em] mb-6 font-medium"
                style={{ color: colors.text }}
              >
                {data.message_welcome_text || 'Con mucha alegría te invitamos'}
              </div>

              <h1
                className="text-4xl md:text-6xl mb-6 leading-tight"
                style={{
                  color: colors.text,
                  fontFamily: 'serif'
                }}
              >
                {data.couple_bride_name}
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.accent }} />
                  <span className="text-2xl md:text-3xl mx-4 font-light">&</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.accent }} />
                </div>
                {data.couple_groom_name}
              </h1>

              <div
                className="text-lg md:text-xl font-medium tracking-wide"
                style={{ color: colors.text_light }}
              >
                {new Date(data.event_date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>

            {/* Quote */}
            <div className="mb-8">
              <p
                className="italic text-lg leading-relaxed"
                style={{ color: colors.text_light }}
              >
                "{data.couple_story || data.message_invitation_text || 'El amor es lo único que crece cuando se comparte'}"
              </p>
            </div>

            {/* Countdown */}
            {features.includes('countdown') && (
              <CountdownTimer
                targetDate={data.event_date}
                colors={colors}
                showLabels={true}
                size="small"
                className="mb-8"
              />
            )}
          </div>
        </div>
      </section>

      {/* Couple Section */}
      {coupleImage && (
        <section className="py-20 relative z-10" style={{ backgroundColor: colors.background_alt }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl mb-4 font-serif"
                style={{ color: colors.text }}
              >
                Nuestra Historia de Amor
              </h2>
              <div className="flex items-center justify-center">
                <div className="flex-1 max-w-20 h-px" style={{ backgroundColor: colors.accent }} />
                <Flower2 className="mx-4 w-5 h-5" style={{ color: colors.accent }} />
                <div className="flex-1 max-w-20 h-px" style={{ backgroundColor: colors.accent }} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img
                  src={coupleImage.file_path}
                  alt="Foto de la pareja"
                  className="w-full rounded-lg shadow-lg"
                />
                {/* Decorative corner */}
                <div
                  className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 rounded-tl-lg"
                  style={{ borderColor: colors.accent }}
                />
                <div
                  className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 rounded-br-lg"
                  style={{ borderColor: colors.accent }}
                />
              </div>

              <div className="space-y-6">
                {(data.couple_bride_parents || data.couple_groom_parents) && (
                  <div className="space-y-4">
                    {data.couple_bride_parents && (
                      <div
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: `${colors.primary}10` }}
                      >
                        <p className="font-medium mb-1" style={{ color: colors.text }}>
                          {data.couple_bride_name}
                        </p>
                        <p className="text-sm" style={{ color: colors.text_light }}>
                          Hija de {data.couple_bride_parents}
                        </p>
                      </div>
                    )}
                    {data.couple_groom_parents && (
                      <div
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: `${colors.secondary}10` }}
                      >
                        <p className="font-medium mb-1" style={{ color: colors.text }}>
                          {data.couple_groom_name}
                        </p>
                        <p className="text-sm" style={{ color: colors.text_light }}>
                          Hijo de {data.couple_groom_parents}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <p
                  className="text-lg leading-relaxed"
                  style={{ color: colors.text_light }}
                >
                  {data.couple_story ||
                   'Dos almas que se encontraron en el momento perfecto para escribir juntas la más hermosa historia de amor.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Event Details */}
      <section className="py-20 relative z-10" style={{ backgroundColor: colors.background }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl mb-4 font-serif"
              style={{ color: colors.text }}
            >
              Celebración
            </h2>
            <div className="flex items-center justify-center">
              <div className="flex-1 max-w-20 h-px" style={{ backgroundColor: colors.accent }} />
              <Cherry className="mx-4 w-5 h-5" style={{ color: colors.accent }} />
              <div className="flex-1 max-w-20 h-px" style={{ backgroundColor: colors.accent }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Ceremony */}
            {ceremonyEvent && (
              <div
                className="relative p-8 rounded-lg border-2"
                style={{
                  backgroundColor: `${colors.primary}05`,
                  borderColor: `${colors.primary}30`
                }}
              >
                <div className="absolute -top-3 left-6">
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.background
                    }}
                  >
                    {ceremonyEvent.name || 'Ceremonia'}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
                    <span style={{ color: colors.text }}>
                      {new Date(ceremonyEvent.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" style={{ color: colors.primary }} />
                    <span style={{ color: colors.text }}>
                      {ceremonyEvent.time || data.event_time} hrs
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1" style={{ color: colors.primary }} />
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
                      variant="outline"
                      className="w-full mt-4"
                      style={{
                        borderColor: colors.primary,
                        color: colors.primary
                      }}
                      onClick={() => {
                        const url = ceremonyEvent.venue_location_url || data.event_venue_location_url;
                        if (!isPreview && url) {
                          window.open(url, '_blank');
                        }
                      }}
                      disabled={isPreview}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver ubicación
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Reception */}
            {receptionEvent && (
              <div
                className="relative p-8 rounded-lg border-2"
                style={{
                  backgroundColor: `${colors.secondary}05`,
                  borderColor: `${colors.secondary}30`
                }}
              >
                <div className="absolute -top-3 left-6">
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.text
                    }}
                  >
                    {receptionEvent.name || 'Recepción'}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" style={{ color: colors.secondary }} />
                    <span style={{ color: colors.text }}>
                      {receptionEvent.time} hrs
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1" style={{ color: colors.secondary }} />
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
                      variant="outline"
                      className="w-full mt-4"
                      style={{
                        borderColor: colors.secondary,
                        color: colors.secondary
                      }}
                      onClick={() => {
                        if (!isPreview && receptionEvent.venue_location_url) {
                          window.open(receptionEvent.venue_location_url, '_blank');
                        }
                      }}
                      disabled={isPreview}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver ubicación
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dress Code */}
          {data.dress_code && (
            <div className="mt-12 text-center">
              <div
                className="inline-block p-6 rounded-lg border-2"
                style={{
                  backgroundColor: `${colors.accent}05`,
                  borderColor: `${colors.accent}30`
                }}
              >
                <Flower2 className="w-8 h-8 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Código de Vestimenta
                </h3>
                <p
                  className="text-lg"
                  style={{ color: colors.accent }}
                >
                  {data.dress_code}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RSVP Section */}
      {features.includes('rsvp') && data.rsvp_enabled && (
        <section className="py-20 relative z-10" style={{ backgroundColor: colors.background_alt }}>
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl mb-4 font-serif"
                style={{ color: colors.text }}
              >
                Confirma tu Asistencia
              </h2>
              <div className="flex items-center justify-center">
                <div className="flex-1 max-w-20 h-px" style={{ backgroundColor: colors.accent }} />
                <Heart className="mx-4 w-5 h-5" style={{ color: colors.accent }} />
                <div className="flex-1 max-w-20 h-px" style={{ backgroundColor: colors.accent }} />
              </div>
            </div>

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
              className="border-2"
              style={{
                borderColor: `${colors.primary}20`
              }}
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 text-center relative z-10" style={{ backgroundColor: colors.background }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex-1 max-w-32 h-px" style={{ backgroundColor: colors.accent }} />
            <Heart className="mx-4 w-6 h-6" style={{ color: colors.accent }} />
            <div className="flex-1 max-w-32 h-px" style={{ backgroundColor: colors.accent }} />
          </div>

          <p
            className="text-lg mb-6 font-serif"
            style={{ color: colors.text }}
          >
            {data.message_thank_you || '¡Esperamos celebrar junto a ti este momento tan especial!'}
          </p>

          {data.social_hashtag && (
            <p
              className="text-lg font-medium mb-6"
              style={{ color: colors.primary }}
            >
              {data.social_hashtag}
            </p>
          )}

          <div
            className="pt-8 border-t text-sm"
            style={{
              borderColor: `${colors.border}50`,
              color: colors.text_light
            }}
          >
            <p>Con amor, creado para vuestro día especial</p>
          </div>
        </div>
      </footer>
    </div>
  );
};