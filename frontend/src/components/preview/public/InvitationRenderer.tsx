/**
 * Invitation Renderer Component
 * 
 * WHY: Core rendering engine for invitation templates with dynamic content
 * insertion, responsive design, and optimized performance. Handles all
 * template types and provides consistent rendering across devices.
 * 
 * WHAT: Template-based rendering system with dynamic data binding,
 * image optimization, animation support, and accessibility features.
 */

'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  Music,
  Gift,
  Camera,
  Share2,
  Phone,
  Mail,
  Navigation
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PreviewData } from '@/lib/hooks/usePreview';
import { InvitationEvent } from '@/lib/api';

interface InvitationRendererProps {
  previewData: PreviewData;
  template?: string;
  theme?: 'classic' | 'modern' | 'rustic' | 'beach' | 'garden' | 'elegant';
  showRSVP?: boolean;
  showGallery?: boolean;
  showMusic?: boolean;
  onRSVPClick?: () => void;
  onShareClick?: () => void;
  onDirectionsClick?: (address: string) => void;
  className?: string;
  isPublic?: boolean;
}

export function InvitationRenderer({
  previewData,
  template = 'modern',
  theme = 'modern',
  showRSVP = true,
  showGallery = true,
  showMusic = true,
  onRSVPClick,
  onShareClick,
  onDirectionsClick,
  className = '',
  isPublic = false
}: InvitationRendererProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const intersectionRef = useRef<HTMLDivElement>(null);
  
  const { invitation, custom_data, media, events } = previewData;
  
  // Extract data with fallbacks
  const coupleData = {
    groomName: custom_data.couple_groom_name || 'Novio',
    brideName: custom_data.couple_bride_name || 'Novia',
    displayOrder: custom_data.couple_display_order || 'bride_first',
    welcomeTitle: custom_data.couple_welcome_title || 'Nos casamos',
    welcomeMessage: custom_data.couple_welcome_message || 'Te invitamos a celebrar nuestro día especial',
    quote: custom_data.couple_quote
  };
  
  const eventData = {
    date: custom_data.event_date,
    time: custom_data.event_time,
    timezone: custom_data.event_timezone || 'America/Lima',
    venueName: custom_data.event_venue_name,
    venueAddress: custom_data.event_venue_address,
    mapsLink: custom_data.event_venue_maps_link,
    venueReference: custom_data.event_venue_reference
  };
  
  const styleData = {
    primaryColor: custom_data.style_primary_color || '#8b5cf6',
    secondaryColor: custom_data.style_secondary_color || '#a78bfa',
    accentColor: custom_data.style_accent_color || '#c4b5fd',
    fontFamily: custom_data.style_font_family || 'Inter',
    headingFont: custom_data.style_heading_font || 'Playfair Display'
  };
  
  const contactData = {
    email: custom_data.contact_email,
    groomPhone: custom_data.contact_groom_phone,
    groomWhatsapp: custom_data.contact_groom_whatsapp,
    bridePhone: custom_data.contact_bride_phone,
    brideWhatsapp: custom_data.contact_bride_whatsapp
  };
  
  // Gallery images
  const galleryImages = media.gallery || [];
  const heroImage = media.hero?.[0] || galleryImages[0];
  const couplePhoto = media.couple?.[0];
  
  // Format event date
  const eventDateFormatted = useMemo(() => {
    if (!eventData.date) return null;
    
    const date = new Date(eventData.date);
    return {
      full: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      day: date.toLocaleDateString('es-ES', { day: 'numeric' }),
      month: date.toLocaleDateString('es-ES', { month: 'long' }),
      year: date.toLocaleDateString('es-ES', { year: 'numeric' }),
      weekday: date.toLocaleDateString('es-ES', { weekday: 'long' })
    };
  }, [eventData.date]);
  
  // Format event time
  const eventTimeFormatted = useMemo(() => {
    if (!eventData.time) return null;
    
    const [hours, minutes] = eventData.time.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }, [eventData.time]);
  
  // Couple names display order
  const coupleNamesDisplay = useMemo(() => {
    if (coupleData.displayOrder === 'groom_first') {
      return `${coupleData.groomName} & ${coupleData.brideName}`;
    }
    return `${coupleData.brideName} & ${coupleData.groomName}`;
  }, [coupleData]);
  
  // Handle music playback
  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    
    setHasInteracted(true);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [isPlaying]);
  
  // Auto-start music on user interaction (if enabled)
  useEffect(() => {
    if (custom_data.gallery_music_enabled && !hasInteracted && isPublic) {
      const startMusic = () => {
        setHasInteracted(true);
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      };
      
      document.addEventListener('click', startMusic, { once: true });
      document.addEventListener('touchstart', startMusic, { once: true });
      
      return () => {
        document.removeEventListener('click', startMusic);
        document.removeEventListener('touchstart', startMusic);
      };
    }
  }, [custom_data.gallery_music_enabled, hasInteracted, isPublic]);
  
  // Gallery auto-advance
  useEffect(() => {
    if (galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [galleryImages.length]);
  
  // Intersection observer for animations
  useEffect(() => {
    if (!intersectionRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const sections = intersectionRef.current.querySelectorAll('.animate-on-scroll');
    sections.forEach((section) => observer.observe(section));
    
    return () => observer.disconnect();
  }, []);
  
  // Theme styles
  const themeStyles = {
    classic: {
      backgroundColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      textColor: 'text-amber-900',
      accentColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      buttonStyle: 'bg-amber-600 hover:bg-amber-700 text-white',
      fontFamily: 'font-serif'
    },
    modern: {
      backgroundColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      textColor: 'text-gray-900',
      accentColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white',
      fontFamily: 'font-sans'
    },
    rustic: {
      backgroundColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      textColor: 'text-yellow-900',
      accentColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      buttonStyle: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      fontFamily: 'font-serif'
    },
    beach: {
      backgroundColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      textColor: 'text-blue-900',
      accentColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      fontFamily: 'font-sans'
    },
    garden: {
      backgroundColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      textColor: 'text-green-900',
      accentColor: 'text-green-600',
      borderColor: 'border-green-200',
      buttonStyle: 'bg-green-600 hover:bg-green-700 text-white',
      fontFamily: 'font-sans'
    },
    elegant: {
      backgroundColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
      textColor: 'text-gray-900',
      accentColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      buttonStyle: 'bg-gray-600 hover:bg-gray-700 text-white',
      fontFamily: 'font-serif'
    }
  };
  
  const currentTheme = themeStyles[theme];
  
  return (
    <div 
      ref={intersectionRef}
      className={`min-h-screen ${currentTheme.backgroundColor} ${currentTheme.fontFamily} ${className}`}
      style={{
        '--primary-color': styleData.primaryColor,
        '--secondary-color': styleData.secondaryColor,
        '--accent-color': styleData.accentColor
      } as React.CSSProperties}
    >
      {/* Background Music */}
      {custom_data.gallery_music_enabled && (custom_data.gallery_music_file || custom_data.gallery_music_url) && (
        <>
          <audio
            ref={audioRef}
            loop
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={custom_data.gallery_music_file || custom_data.gallery_music_url} type="audio/mpeg" />
          </audio>
          
          {/* Music Control */}
          {showMusic && (
            <button
              onClick={toggleMusic}
              className="fixed top-4 right-4 z-50 p-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-300"
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              <Music className={`w-5 h-5 ${isPlaying ? 'text-purple-600' : 'text-gray-600'}`} />
            </button>
          )}
        </>
      )}
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden animate-on-scroll">
        {/* Hero Background */}
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.file_path}
              alt="Wedding Hero"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
            {/* Welcome Title */}
            <h1 className={`text-sm md:text-base ${currentTheme.accentColor} font-medium tracking-wider uppercase mb-4`}>
              {coupleData.welcomeTitle}
            </h1>
            
            {/* Couple Names */}
            <h2 className={`text-4xl md:text-6xl lg:text-7xl font-bold ${currentTheme.textColor} mb-6`}
                style={{ fontFamily: styleData.headingFont }}>
              {coupleNamesDisplay}
            </h2>
            
            {/* Welcome Message */}
            <p className={`text-lg md:text-xl ${currentTheme.textColor} opacity-80 mb-8 max-w-2xl mx-auto leading-relaxed`}>
              {coupleData.welcomeMessage}
            </p>
            
            {/* Date Display */}
            {eventDateFormatted && (
              <div className={`inline-flex items-center gap-3 ${currentTheme.accentColor} bg-white bg-opacity-50 rounded-full px-6 py-3 text-lg font-semibold`}>
                <Calendar className="w-5 h-5" />
                <span>{eventDateFormatted.full}</span>
              </div>
            )}
            
            {/* Quote */}
            {coupleData.quote && (
              <blockquote className={`mt-8 text-lg ${currentTheme.textColor} opacity-70 italic max-w-lg mx-auto`}>
                &ldquo;{coupleData.quote}&rdquo;
              </blockquote>
            )}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>
      
      {/* Event Details Section */}
      <section className="py-16 md:py-24 animate-on-scroll">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h3 className={`text-3xl md:text-4xl font-bold ${currentTheme.textColor} mb-4`}
                  style={{ fontFamily: styleData.headingFont }}>
                Detalles del Evento
              </h3>
              <div className={`w-24 h-1 ${currentTheme.accentColor.replace('text-', 'bg-')} mx-auto rounded-full`}></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Date & Time */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 ${currentTheme.accentColor.replace('text-', 'bg-')} bg-opacity-10 rounded-full`}>
                    <Calendar className={`w-6 h-6 ${currentTheme.accentColor}`} />
                  </div>
                  <h4 className={`text-xl font-semibold ${currentTheme.textColor}`}>Fecha y Hora</h4>
                </div>
                
                {eventDateFormatted && (
                  <div className="space-y-3">
                    <div className={`text-3xl font-bold ${currentTheme.accentColor}`}>
                      {eventDateFormatted.day}
                    </div>
                    <div className={`text-lg ${currentTheme.textColor}`}>
                      {eventDateFormatted.month} {eventDateFormatted.year}
                    </div>
                    <div className={`text-base ${currentTheme.textColor} opacity-70 capitalize`}>
                      {eventDateFormatted.weekday}
                    </div>
                  </div>
                )}
                
                {eventTimeFormatted && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <Clock className={`w-5 h-5 ${currentTheme.accentColor}`} />
                      <span className={`text-lg font-medium ${currentTheme.textColor}`}>
                        {eventTimeFormatted} hrs
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Venue */}
              {eventData.venueName && (
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 ${currentTheme.accentColor.replace('text-', 'bg-')} bg-opacity-10 rounded-full`}>
                      <MapPin className={`w-6 h-6 ${currentTheme.accentColor}`} />
                    </div>
                    <h4 className={`text-xl font-semibold ${currentTheme.textColor}`}>Lugar</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className={`text-xl font-bold ${currentTheme.accentColor}`}>
                      {eventData.venueName}
                    </h5>
                    
                    {eventData.venueAddress && (
                      <p className={`${currentTheme.textColor} opacity-80`}>
                        {eventData.venueAddress}
                      </p>
                    )}
                    
                    {eventData.venueReference && (
                      <p className={`text-sm ${currentTheme.textColor} opacity-60`}>
                        {eventData.venueReference}
                      </p>
                    )}
                    
                    {(eventData.mapsLink || eventData.venueAddress) && (
                      <Button
                        onClick={() => onDirectionsClick?.(eventData.venueAddress || eventData.mapsLink || '')}
                        className={`mt-4 ${currentTheme.buttonStyle} flex items-center gap-2`}
                        size="sm"
                      >
                        <Navigation className="w-4 h-4" />
                        Ver Ubicación
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Timeline/Events Section */}
      {events && events.length > 0 && (
        <section className="py-16 md:py-24 bg-white bg-opacity-50 animate-on-scroll">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h3 className={`text-3xl md:text-4xl font-bold ${currentTheme.textColor} mb-4`}
                    style={{ fontFamily: styleData.headingFont }}>
                  Itinerario
                </h3>
                <div className={`w-24 h-1 ${currentTheme.accentColor.replace('text-', 'bg-')} mx-auto rounded-full`}></div>
              </div>
              
              <div className="space-y-8">
                {events.map((event: InvitationEvent, index: number) => (
                  <div key={event.id || index} className="flex gap-6 group">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 ${currentTheme.accentColor.replace('text-', 'bg-')} rounded-full group-hover:scale-125 transition-transform duration-300`}></div>
                      {index < events.length - 1 && (
                        <div className={`w-px h-16 ${currentTheme.borderColor} mt-4`}></div>
                      )}
                    </div>
                    
                    {/* Event Content */}
                    <div className="flex-1 pb-8">
                      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className={`text-xl font-semibold ${currentTheme.textColor} mb-2`}>
                              {event.event_name}
                            </h4>
                            {event.event_description && (
                              <p className={`${currentTheme.textColor} opacity-80 mb-3`}>
                                {event.event_description}
                              </p>
                            )}
                            {event.event_venue && (
                              <div className="flex items-center gap-2 text-sm opacity-70">
                                <MapPin className="w-4 h-4" />
                                <span>{event.event_venue}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className={`text-right ${currentTheme.accentColor}`}>
                            <div className="text-2xl font-bold">
                              {new Date(event.event_datetime).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </div>
                            <div className="text-sm opacity-70">
                              {new Date(event.event_datetime).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Gallery Section */}
      {showGallery && galleryImages.length > 0 && (
        <section className="py-16 md:py-24 animate-on-scroll">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h3 className={`text-3xl md:text-4xl font-bold ${currentTheme.textColor} mb-4`}
                    style={{ fontFamily: styleData.headingFont }}>
                  Nuestra Historia
                </h3>
                <div className={`w-24 h-1 ${currentTheme.accentColor.replace('text-', 'bg-')} mx-auto rounded-full`}></div>
              </div>
              
              {couplePhoto && (
                <div className="text-center mb-12">
                  <div className="relative inline-block">
                    <Image
                      src={couplePhoto.file_path}
                      alt="Couple Photo"
                      width={400}
                      height={400}
                      className="rounded-full object-cover shadow-2xl"
                    />
                    <div className="absolute inset-0 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((image, index) => (
                  <div 
                    key={image.id || index}
                    className="relative aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                  >
                    <Image
                      src={image.file_path}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* RSVP Section */}
      {showRSVP && (
        <section className="py-16 md:py-24 bg-white bg-opacity-50 animate-on-scroll">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${currentTheme.accentColor.replace('text-', 'bg-')} bg-opacity-10 rounded-full mb-6`}>
                <Heart className={`w-8 h-8 ${currentTheme.accentColor}`} />
              </div>
              
              <h3 className={`text-3xl md:text-4xl font-bold ${currentTheme.textColor} mb-6`}
                  style={{ fontFamily: styleData.headingFont }}>
                Confirma tu Asistencia
              </h3>
              
              <p className={`text-lg ${currentTheme.textColor} opacity-80 mb-8`}>
                Tu presencia es el mejor regalo. Por favor confirma tu asistencia para compartir este momento tan especial con nosotros.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={onRSVPClick}
                  size="lg"
                  className={`${currentTheme.buttonStyle} text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Confirmar Asistencia
                </Button>
                
                {contactData.email && (
                  <div className="flex items-center justify-center gap-4 text-sm opacity-70">
                    <Mail className="w-4 h-4" />
                    <span>¿Dudas? Escríbenos a {contactData.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Contact Section */}
      {(contactData.groomPhone || contactData.bridePhone || contactData.email) && (
        <section className="py-16 md:py-24 animate-on-scroll">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h3 className={`text-3xl md:text-4xl font-bold ${currentTheme.textColor} mb-4`}
                    style={{ fontFamily: styleData.headingFont }}>
                  Contacto
                </h3>
                <div className={`w-24 h-1 ${currentTheme.accentColor.replace('text-', 'bg-')} mx-auto rounded-full`}></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Groom Contact */}
                {(contactData.groomPhone || contactData.groomWhatsapp) && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    <h4 className={`text-xl font-semibold ${currentTheme.textColor} mb-6`}>
                      {coupleData.groomName}
                    </h4>
                    <div className="space-y-4">
                      {contactData.groomPhone && (
                        <a
                          href={`tel:${contactData.groomPhone}`}
                          className={`inline-flex items-center gap-3 ${currentTheme.accentColor} hover:underline`}
                        >
                          <Phone className="w-5 h-5" />
                          {contactData.groomPhone}
                        </a>
                      )}
                      {contactData.groomWhatsapp && (
                        <a
                          href={`https://wa.me/${contactData.groomWhatsapp.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-3 ${currentTheme.accentColor} hover:underline`}
                        >
                          <Phone className="w-5 h-5" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Bride Contact */}
                {(contactData.bridePhone || contactData.brideWhatsapp) && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    <h4 className={`text-xl font-semibold ${currentTheme.textColor} mb-6`}>
                      {coupleData.brideName}
                    </h4>
                    <div className="space-y-4">
                      {contactData.bridePhone && (
                        <a
                          href={`tel:${contactData.bridePhone}`}
                          className={`inline-flex items-center gap-3 ${currentTheme.accentColor} hover:underline`}
                        >
                          <Phone className="w-5 h-5" />
                          {contactData.bridePhone}
                        </a>
                      )}
                      {contactData.brideWhatsapp && (
                        <a
                          href={`https://wa.me/${contactData.brideWhatsapp.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-3 ${currentTheme.accentColor} hover:underline`}
                        >
                          <Phone className="w-5 h-5" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Footer */}
      <footer className={`py-12 text-center ${currentTheme.textColor} opacity-60`}>
        <div className="container mx-auto px-4">
          <Heart className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p>
            Con amor, {coupleNamesDisplay}
          </p>
          {eventDateFormatted && (
            <p className="text-sm mt-2">
              {eventDateFormatted.full}
            </p>
          )}
          
          {onShareClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShareClick}
              className="mt-4 opacity-60 hover:opacity-100 transition-opacity"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}