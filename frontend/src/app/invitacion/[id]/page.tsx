/**
 * Invitation Preview Page (/invitacion/[id])
 * 
 * WHY: Displays the final invitation for guests to view. This is the
 * customer-facing invitation page that will be shared via links.
 * Must be optimized for mobile viewing and social sharing.
 * 
 * WHAT: Public invitation display page with responsive design,
 * RSVP functionality, event details, and social sharing features.
 */

'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Music, 
  Heart,
  Share2,
  MessageCircle,
  Check,
  X,
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InvitationPageProps {
  params: {
    id: string;
  };
}

// Mock invitation data - in real app, this would come from API
const mockInvitationData = {
  id: 'maria-carlos-2024',
  type: 'wedding',
  isActive: true,
  
  // Couple Information
  couple: {
    bride: 'María González',
    groom: 'Carlos Rodríguez',
    bridePhoto: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300',
    groomPhoto: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=300',
    couplePhoto: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  
  // Event Details
  event: {
    date: '2024-12-15',
    time: '16:00',
    venue: 'Iglesia San José',
    address: 'Av. Lima 456, Miraflores, Lima',
    reception: {
      venue: 'Hotel Marriott',
      address: 'Malecón de la Reserva 615, Miraflores',
      time: '19:00',
    },
  },
  
  // Design
  design: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#F3E8FF',
    backgroundImage: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260',
    musicUrl: '/sample-wedding-music.mp3',
  },
  
  // Messages
  message: {
    welcome: '¡Nos casamos!',
    details: 'Queremos compartir contigo este momento tan especial de nuestras vidas. Tu presencia será el regalo más importante.',
    dresscode: 'Código de vestimenta: Formal / Elegante',
  },
  
  // RSVP
  rsvp: {
    enabled: true,
    deadline: '2024-11-15',
    guestName: null, // Would be populated from URL params
  },
  
  // Countdown
  countdown: {
    enabled: true,
    targetDate: '2024-12-15T16:00:00',
  },
  
  // Statistics (for owner view)
  stats: {
    views: 234,
    rsvps: 89,
    confirmed: 67,
    declined: 12,
    pending: 10,
  },
};

// Countdown Component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="text-center text-white">
      <h3 className="text-xl font-bold mb-6">¡FALTAN!</h3>
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs opacity-80">Días</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs opacity-80">Horas</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs opacity-80">Min</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs opacity-80">Seg</div>
        </div>
      </div>
    </div>
  );
};

// RSVP Component
const RSVPSection = ({ invitation }: { invitation: any }) => {
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'confirmed' | 'declined'>('pending');
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRSVP = async (status: 'confirmed' | 'declined') => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRsvpStatus(status);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (rsvpStatus !== 'pending') {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          rsvpStatus === 'confirmed' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {rsvpStatus === 'confirmed' ? (
            <Check className="w-8 h-8 text-green-600" />
          ) : (
            <X className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {rsvpStatus === 'confirmed' ? '¡Gracias por confirmar!' : 'Lamentamos que no puedas asistir'}
        </h3>
        <p className="text-gray-600">
          {rsvpStatus === 'confirmed' 
            ? 'Estamos emocionados de celebrar contigo'
            : 'Esperamos verte en otra ocasión especial'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h3 className="text-2xl font-bold text-center mb-6">Confirma tu Asistencia</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Podrás acompañarnos?
          </label>
          <div className="flex gap-4">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleRSVP('confirmed')}
              disabled={isSubmitting}
            >
              <Check className="w-4 h-4 mr-2" />
              ¡Sí, asistiré!
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => handleRSVP('declined')}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              No podré asistir
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de acompañantes (incluyéndote)
          </label>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje especial (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 resize-none"
            placeholder="Deja un mensaje de felicitaciones..."
          />
        </div>

        <p className="text-sm text-gray-500 text-center">
          Por favor confirma antes del {new Date(invitation.rsvp.deadline).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default function InvitationPage({ params }: InvitationPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const invitationId = params.id;

  // Simulate loading invitation data
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (invitationId === 'demo' || invitationId === mockInvitationData.id) {
        setInvitation(mockInvitationData);
      }
      setIsLoading(false);
    }, 1000);
  }, [invitationId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invitación de ${invitation.couple.bride} y ${invitation.couple.groom}`,
        url: window.location.href,
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareMenu(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${invitation.design.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Audio Toggle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* Share Button */}
        <div className="absolute top-6 left-6">
          <div className="relative">
            <button
              onClick={handleShare}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            {showShareMenu && (
              <div className="absolute top-14 left-0 bg-white rounded-lg shadow-lg p-2 min-w-[150px]">
                <button
                  onClick={copyToClipboard}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Copiar enlace
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Te invito a mi boda: ${window.location.href}`)}`}
                  target="_blank"
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Compartir por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto px-6">
          {/* Welcome Message */}
          <div className="mb-8">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="text-sm uppercase tracking-widest">¡NOS CASAMOS!</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 font-serif">
              {invitation.couple.bride}
              <span className="block text-3xl md:text-4xl my-2">&</span>
              {invitation.couple.groom}
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              {new Date(invitation.event.date).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Countdown */}
          {invitation.countdown.enabled && (
            <CountdownTimer targetDate={invitation.countdown.targetDate} />
          )}

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Couple Photos */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Una Historia de Amor</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {invitation.message.details}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 shadow-lg">
                <img 
                  src={invitation.couple.bridePhoto}
                  alt={invitation.couple.bride}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{invitation.couple.bride}</h3>
            </div>

            <div className="flex justify-center">
              <Heart className="w-16 h-16 text-pink-500" />
            </div>

            <div className="text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-4 shadow-lg">
                <img 
                  src={invitation.couple.groomPhoto}
                  alt={invitation.couple.groom}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{invitation.couple.groom}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Detalles del Evento</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ceremony */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Ceremonia</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span>{invitation.event.time} hrs</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-medium">{invitation.event.venue}</p>
                    <p className="text-gray-600 text-sm">{invitation.event.address}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(invitation.event.address)}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver en Google Maps
                </Button>
              </div>
            </div>

            {/* Reception */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Recepción</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span>{invitation.event.reception.time} hrs</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-medium">{invitation.event.reception.venue}</p>
                    <p className="text-gray-600 text-sm">{invitation.event.reception.address}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(invitation.event.reception.address)}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver en Google Maps
                </Button>
              </div>
            </div>
          </div>

          {/* Dress Code */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Código de Vestimenta</h3>
              <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                Formal / Elegante
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      {invitation.rsvp.enabled && (
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-6">
            <RSVPSection invitation={invitation} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg mb-4">
            ¡Esperamos verte en nuestro día especial!
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => window.open(`https://wa.me/51987654321?text=Hola, tengo una consulta sobre la invitación de boda`, '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contactar por WhatsApp
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
            <p>Invitación creada con ❤️ por Graphica Eventos</p>
          </div>
        </div>
      </footer>
    </div>
  );
}