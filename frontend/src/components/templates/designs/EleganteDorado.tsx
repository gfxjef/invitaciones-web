/**
 * Clasico Romance Template
 *
 * WHY: A romantic and classic wedding template featuring a full-screen hero image
 * that beautifully showcases the couple. Its clean and centered typography,
 * along with a simple navigation bar, makes it elegant and easy to use.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Heart, Calendar, Clock, MapPin, ExternalLink, Music,
  Volume2, VolumeX, MessageCircle, Facebook, Twitter, Instagram,
  Play, X, ZoomIn, ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateProps } from '@/types/template';
import { CountdownTimer } from '../shared/CountdownTimer';
import { ShareButtons } from '../shared/ShareButtons';
import { RSVPSection } from '../shared/RSVPSection';

// --- Componente de la Tarjeta de Perfil Reutilizable ---
const ProfileCard = ({ imageUrl, name, role, description, socialLinks }: {
  imageUrl: string;
  name: string;
  role: string;
  description: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}) => (
  <div className="text-center flex flex-col items-center">
    {/* Imagen de Perfil */}
    <img
      src={imageUrl}
      alt={name}
      className="w-40 h-40 rounded-full object-cover mb-6 shadow-md"
    />

    {/* Nombre */}
    <h4 className="text-lg font-semibold tracking-wider text-gray-700 uppercase">{name}</h4>

    {/* Rol (The Bride/The Groom) */}
    <p
      className="text-amber-700 text-2xl mt-1 mb-4"
      style={{ fontFamily: '"Great Vibes", cursive' }}
    >
      {role}
    </p>

    {/* Descripción */}
    <p className="text-gray-500 text-sm leading-relaxed max-w-xs px-2">
      {description}
    </p>

    {/* Iconos de Redes Sociales */}
    <div className="flex space-x-3 mt-6">
      <a
        href={socialLinks.facebook}
        aria-label="Facebook profile"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-amber-700 transition-colors duration-300"
      >
        <Facebook size={16} />
      </a>
      <a
        href={socialLinks.twitter}
        aria-label="Twitter profile"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-amber-700 transition-colors duration-300"
      >
        <Twitter size={16} />
      </a>
      <a
        href={socialLinks.instagram}
        aria-label="Instagram profile"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-amber-700 transition-colors duration-300"
      >
        <Instagram size={16} />
      </a>
    </div>
  </div>
);

// --- Componente de la Cuenta Regresiva ---
const CountdownSection = () => {
  // URL de la imagen de fondo
  const backgroundImageUrl = 'https://i.imgur.com/7p4m1iH.png';

  // ¡IMPORTANTE! Reemplaza esta fecha con la fecha real de tu boda
  const weddingDate = '2025-12-15T17:00:00';

  const calculateTimeLeft = () => {
    const difference = +new Date(weddingDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
        // Si la fecha ya pasó, muestra ceros
        timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Limpia el temporizador si el componente se desmonta
    return () => clearTimeout(timer);
  });

  // Componente reutilizable para cada unidad de tiempo
  const TimeUnit = ({ value, label }: { value: string; label: string }) => (
    <div className="text-center">
      <span className="block text-5xl md:text-7xl font-sans font-bold">
        {value}
      </span>
      <span className="block mt-2 text-xs font-light tracking-[0.2em] uppercase">
        {label}
      </span>
    </div>
  );

  return (
    <section
      className="relative py-24 px-6 text-white text-center"
      style={{
        backgroundImage: `url('${backgroundImageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Efecto Parallax
      }}
    >
      {/* Capa de superposición para mejorar la legibilidad del texto */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Contenedor del contenido */}
      <div className="relative z-10 flex flex-col items-center">
        <p className="tracking-[0.3em] text-sm font-light uppercase">
            WE WILL BECOME A FAMILY IN
        </p>
        <h2
          className="text-4xl md:text-5xl my-4"
          style={{ fontFamily: '"Great Vibes", cursive' }}
        >
          We're getting married in
        </h2>

        {/* Contenedor de la cuenta regresiva */}
        <div className="flex justify-center items-start space-x-4 md:space-x-12 mt-8">
            <TimeUnit value={String(timeLeft.days || 0).padStart(2, '0')} label="Days" />
            <TimeUnit value={String(timeLeft.hours || 0).padStart(2, '0')} label="Hours" />
            <TimeUnit value={String(timeLeft.minutes || 0).padStart(2, '0')} label="Minutes" />
            <TimeUnit value={String(timeLeft.seconds || 0).padStart(2, '0')} label="Seconds" />
        </div>
      </div>
    </section>
  );
};

// --- Datos de la Historia ---
// Puedes añadir más objetos a este array para crear más diapositivas en el carrusel.
const storyMoments = [
  {
    date: 'JULY 20, 2015',
    title: 'First time we meet',
    description: 'First time we meet viverra tristique duis vitae diam the nesumen nivamus aestan ateuene artines finibus. Nedana setlie the love thermen inilla duimane elit finibus nec a lacus durana meeta nonsalere viventa miss the fermen.',
    imageUrl: 'https://i.imgur.com/83AAp8B.png',
  },
  {
    date: 'AUGUST 1, 2016',
    title: 'Our First Date',
    description: 'A wonderful evening under the stars that marked the beginning of our journey together. The conversation flowed as easily as the wine, and we both knew this was something special and unique.',
    imageUrl: 'https://images.pexels.com/photos/3784433/pexels-photo-3784433.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
  {
    date: 'JUNE 25, 2022',
    title: 'The Proposal',
    description: 'On a beautiful day, surrounded by nature, a question was asked that would change our lives forever. It was a moment of pure joy, surprise, and overwhelming love that we will cherish always.',
    imageUrl: 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=1260',
  },
];

// --- Componente de la Sección "Our Love Story" ---
const LoveStorySection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMoment = storyMoments[activeIndex];

  return (
    <section id="our-story" className="bg-white py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Encabezado de la sección */}
        <div className="text-center mb-16">
          <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold">
            MARY & BRIAN
          </p>
          <h3
            className="text-5xl md:text-6xl text-gray-800 mt-2"
            style={{ fontFamily: '"Great Vibes", cursive' }}
          >
            Our Love Story
          </h3>
        </div>

        {/* Contenedor del Slider */}
        <div className="flex flex-col md:flex-row items-center justify-center min-h-[400px]">
          {/* Columna de la Imagen */}
          <div className="w-full md:w-3/5">
            <img
              src={activeMoment.imageUrl}
              alt={activeMoment.title}
              className="w-full h-auto object-cover shadow-xl"
            />
          </div>

          {/* Columna del Texto */}
          <div className="w-full md:w-3/5 bg-[#fdfaf6] p-8 md:p-12 shadow-xl relative z-10
                       transform md:-translate-x-16 -translate-y-10 md:translate-y-0">
            <p className="text-xs text-amber-700 tracking-[0.2em] font-semibold uppercase">
              {activeMoment.date}
            </p>
            <h4
              className="text-4xl text-gray-700 my-3"
              style={{ fontFamily: '"Great Vibes", cursive' }}
            >
              {activeMoment.title}
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              {activeMoment.description}
            </p>
          </div>
        </div>

        {/* Paginación / Navegación de Puntos */}
        <div className="flex justify-center space-x-3 mt-12">
          {storyMoments.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to story moment ${index + 1}`}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                activeIndex === index ? 'bg-amber-700' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Datos de la Galería ---
const galleryImages = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Romantic couple moment',
    category: 'ceremony'
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Beautiful wedding ceremony',
    category: 'ceremony'
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/3784433/pexels-photo-3784433.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Celebration moments',
    category: 'party'
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Wedding rings',
    category: 'ceremony'
  },
  {
    id: 5,
    src: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Happy celebration',
    category: 'party'
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/1488315/pexels-photo-1488315.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Wedding decoration',
    category: 'ceremony'
  },
  {
    id: 7,
    src: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Party atmosphere',
    category: 'party'
  },
  {
    id: 8,
    src: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Beautiful wedding moment',
    category: 'ceremony'
  }
];

// --- Componente de Imagen con Overlay ---
const ImageWithOverlay = ({ image, onClick }: {
  image: { id: number; src: string; alt: string; category: string };
  onClick: () => void;
}) => (
  <div className="relative group cursor-pointer overflow-hidden" onClick={onClick}>
    <img
      src={image.src}
      alt={image.alt}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
    />
    {/* Overlay con icono de zoom */}
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
      <ZoomIn className="text-white w-8 h-8" />
    </div>
  </div>
);

// --- Componente de la Sección de Galería ---
const GallerySection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<typeof galleryImages[0] | null>(null);

  // Filtrar imágenes basado en la categoría seleccionada
  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  // Funciones para el lightbox
  const openLightbox = (image: typeof galleryImages[0]) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  // Navegación en el lightbox
  const goToNextImage = () => {
    if (!lightboxImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setLightboxImage(filteredImages[nextIndex]);
  };

  const goToPrevImage = () => {
    if (!lightboxImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
    const prevIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    setLightboxImage(filteredImages[prevIndex]);
  };

  return (
    <>
      {/* Sección principal de la galería */}
      <section id="gallery" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Encabezado de la sección */}
          <div className="text-center mb-16">
            <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold">
              MEMORIES
            </p>
            <h3
              className="text-5xl md:text-6xl text-gray-800 mt-2 mb-8"
              style={{ fontFamily: '"Great Vibes", cursive' }}
            >
              Wedding Gallery
            </h3>

            {/* Filtros de categoría */}
            <div className="flex justify-center space-x-2 md:space-x-4">
              {[
                { key: 'all', label: 'All' },
                { key: 'ceremony', label: 'Ceremony' },
                { key: 'party', label: 'Party' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedCategory(filter.key)}
                  className={`px-4 py-2 text-sm font-medium tracking-wider uppercase transition-colors duration-300 ${
                    selectedCategory === filter.key
                      ? 'text-amber-700 border-b-2 border-amber-700'
                      : 'text-gray-500 hover:text-amber-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de imágenes estilo masonry */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className={`${
                  // Variación en alturas para efecto masonry
                  index % 6 === 0 ? 'row-span-2' :
                  index % 4 === 0 ? 'row-span-1' :
                  'row-span-1'
                } h-48 md:h-56 lg:h-64`}
              >
                <ImageWithOverlay
                  image={image}
                  onClick={() => openLightbox(image)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-full"
            // Evita que el modal se cierre al hacer clic en la imagen
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen principal */}
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {/* Botón para cerrar */}
            <button
              onClick={closeLightbox}
              aria-label="Close lightbox"
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Navegación anterior */}
            {filteredImages.length > 1 && (
              <button
                onClick={goToPrevImage}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Navegación siguiente */}
            {filteredImages.length > 1 && (
              <button
                onClick={goToNextImage}
                aria-label="Next image"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Información de la imagen */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-sm bg-black/50 backdrop-blur-sm rounded px-3 py-1 inline-block">
                {filteredImages.findIndex(img => img.id === lightboxImage.id) + 1} / {filteredImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Componente de la Sección de Video ---
const VideoStorySection = () => {
  // Estado para controlar la visibilidad del modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- CONFIGURACIÓN ---
  // URL de la imagen de fondo de la sección
  const backgroundImageUrl = 'https://i.imgur.com/KxT5vJM.png';
  // URL del video de YouTube o Vimeo (usa la URL para "embed" o "incrustar")
  const videoEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // ¡Reemplaza esto con tu video!

  // Función para abrir el modal
  const openModal = () => setIsModalOpen(true);
  // Función para cerrar el modal
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Sección principal con la imagen de fondo */}
      <section
        className="relative h-[60vh] min-h-[400px] flex flex-col items-center justify-center text-white text-center px-6"
        style={{
          backgroundImage: `url('${backgroundImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', // Efecto Parallax
        }}
      >
        {/* Capa de superposición oscura para legibilidad */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Contenido centrado */}
        <div className="relative z-10">
          <p className="tracking-[0.3em] text-sm font-light uppercase">
            A LOVE STORY BEGINNING
          </p>
          <h2
            className="text-5xl md:text-6xl my-4"
            style={{ fontFamily: '"Great Vibes", cursive' }}
          >
            Watch our love story
          </h2>

          {/* Botón de Reproducción */}
          <button
            onClick={openModal}
            aria-label="Play video"
            className="relative flex items-center justify-center w-24 h-24 mt-6 group"
          >
            {/* Anillo exterior semitransparente */}
            <div className="absolute inset-0 rounded-full border-2 border-white/40 transition-transform duration-300 group-hover:scale-110"></div>
            {/* Círculo interior blanco */}
            <div className="absolute inset-2 rounded-full bg-white/90 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"></div>
            {/* Icono de Play */}
            <Play
              className="relative z-10 text-amber-800 transition-transform duration-300 group-hover:scale-110"
              size={32}
              fill="currentColor"
            />
          </button>
        </div>
      </section>

      {/* Modal del Video (se muestra condicionalmente) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black"
            // Evita que el modal se cierre al hacer clic dentro del video
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón para Cerrar el Modal */}
            <button
              onClick={closeModal}
              aria-label="Close video player"
              className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Iframe para el Video */}
            <iframe
              src={videoEmbedUrl + '?autoplay=1'} // Añade autoplay para que inicie al abrir
              title="Our Love Story Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

// --- Componente del Footer ---
const FooterSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Muestra el botón cuando el usuario se desplaza 300px hacia abajo
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Vuelve al inicio de la página suavemente
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <footer className="relative bg-[#222222] text-gray-400 pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Nombres de la Pareja */}
        <h2
          className="text-6xl md:text-7xl text-white"
          style={{ fontFamily: '"Great Vibes", cursive' }}
        >
          Mary & Brian
        </h2>

        {/* Fecha y Lugar */}
        <p className="mt-4 text-sm tracking-[0.2em] uppercase">
          24 DECEMBER 2022, NEW YORK
        </p>

        {/* Separador */}
        <hr className="border-t border-gray-700 w-1/2 mx-auto my-12" />

        {/* Copyright */}
        <p className="text-xs text-gray-500">
          Made with love. All right reserved.
        </p>
      </div>

      {/* Botón "Volver Arriba" */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Go to top of the page"
          className="fixed bottom-8 right-8 w-12 h-12 bg-transparent border-2 border-amber-600/70 text-amber-600/70 rounded-full
                     flex items-center justify-center
                     hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-300 z-50"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </footer>
  );
};

export const EleganteDorado: React.FC<TemplateProps> = ({
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

  // Hardcoded values for now (will use data later)
  const heroImageUrl = 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260';
  const coupleNames = 'María & Carlos';
  const eventDate = '15 December, 2024';
  const eventLocation = 'New York';

  // Datos de ejemplo para la novia y el novio
  const brideData = {
    imageUrl: 'https://i.imgur.com/u1wA4oo.png',
    name: 'Mary Brown',
    role: 'The Bride',
    description: 'Mary fringilla dui at elit finibus viverra nec alan seda couple the miss druane sema the wedding intono miss sollicitudin non the fermen.',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#'
    }
  };

  const groomData = {
    imageUrl: 'https://i.imgur.com/qL42vPA.png',
    name: 'Brian Martin',
    role: 'The Groom',
    description: 'Mary fringilla dui at elit finibus viverra nec alan seda couple the miss druane sema the wedding intono miss sollicitudin non the fermen.',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#'
    }
  };

  return (
    <div className="font-serif bg-white">
      {/* Hero Section with Navigation */}
      <section
        className="relative min-h-screen flex flex-col text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Header with Navigation */}
        <header className="absolute top-0 left-0 right-0 p-6 z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Couple Names in Corner */}
            <div
              className="text-2xl font-medium tracking-wide"
              style={{
                fontFamily: '"Great Vibes", cursive',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            >
              {coupleNames}
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Home
              </a>
              <a
                href="#couple"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Couple
              </a>
              <a
                href="#story"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Story
              </a>
              <a
                href="#friends"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Friends
              </a>
              <a
                href="#events"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Events
              </a>
              <a
                href="#gallery"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Gallery
              </a>
              <a
                href="#when-where"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                When & Where
              </a>
              <a
                href="#rsvp"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                R.S.V.P
              </a>
              <a
                href="#blog"
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Blog
              </a>
            </nav>

            {/* Mobile Menu Button (optional - for future) */}
            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Central Content */}
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-center">
            {/* Main Couple Names */}
            <h1
              className="text-7xl md:text-9xl mb-6"
              style={{
                fontFamily: '"Great Vibes", cursive',
                color: '#FFFFFF',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.6)',
                lineHeight: '1.2'
              }}
            >
              {coupleNames}
            </h1>

            {/* Date and Location */}
            <p
              className="text-lg md:text-xl tracking-[0.2em] uppercase"
              style={{
                color: '#FFFFFF',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
                fontFamily: 'sans-serif',
                fontWeight: '300'
              }}
            >
              {eventDate}
            </p>
            <p
              className="text-lg md:text-xl tracking-[0.2em] uppercase mt-2"
              style={{
                color: '#FFFFFF',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
                fontFamily: 'sans-serif',
                fontWeight: '300'
              }}
            >
              — {eventLocation} —
            </p>
          </div>
        </main>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center opacity-70">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Welcome Banner Section */}
      <section className="bg-white">
        {/* Banner Superior */}
        <div
          className="w-full h-48 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://i.imgur.com/svWa52m.png)'
          }}
        >
          {/* El propósito de este div es únicamente mostrar la imagen de fondo del jardín */}
        </div>

        {/* Contenedor Principal de Contenido */}
        <main className="bg-white w-full flex justify-center">
          <div className="w-full max-w-4xl px-4">

            {/* Contenedor de la Imagen de Perfil */}
            <div className="relative z-10 flex justify-center -mt-24">
              {/* Imagen de la pareja con borde y sombra */}
              <img
                className="w-48 h-48 rounded-full object-cover border-8 border-white shadow-lg"
                src="https://i.imgur.com/OFaT2vQ.png"
                alt="A beautiful couple kissing on their wedding day"
              />
            </div>

            {/* Contenido de Texto */}
            <div className="text-center mt-8 pb-16">
              <p className="text-sm text-amber-700 tracking-widest font-semibold">HELLO & WELCOME</p>
              <h1
                className="text-6xl text-gray-800 my-4"
                style={{
                  fontFamily: '"Great Vibes", cursive'
                }}
              >
                We're getting married!
              </h1>
              <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
                Today and always, beyond tomorrow, I need you beside me, always as my best friend, lover and forever soul mate. Curabitur aliquet orci elit genes tristique lorem commodo vitae. Tullaum tincidunt nete sede gravida alisuan neque libero hendrerit magnation sit amet mollis lacus ithe maurise. Dunya erat couple wedding eda the semper. Event elit miss eget the solin miss citudino phasellus rutrum in the lacusi events vestibulum elen ornare drana company tortori eget the solin miss citudino sellus rutrum in lacus miss semper.
              </p>
            </div>
          </div>
        </main>
      </section>

      {/* Happy Couple Section */}
      <section id="story" className="bg-[#fdfaf6] py-24 px-6">
        <div className="container mx-auto">
          {/* Encabezado de la sección */}
          <div className="text-center mb-16">
            <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold">
              BRIDE & GROOM
            </p>
            <h3
              className="text-5xl md:text-6xl text-gray-800 mt-2"
              style={{ fontFamily: '"Great Vibes", cursive' }}
            >
              Happy Couple
            </h3>
          </div>

          {/* Contenedor de la pareja (Grid) */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-y-16 gap-x-8">
            <ProfileCard {...brideData} />
            <ProfileCard {...groomData} />
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <CountdownSection />

      {/* Love Story Section */}
      <LoveStorySection />

      {/* Video Story Section */}
      <VideoStorySection />

      {/* Gallery Section */}
      <GallerySection />

      {/* When & Where Section */}
      <section id="when-where" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-5xl md:text-6xl mb-4"
              style={{
                fontFamily: '"Great Vibes", cursive',
                color: '#333333'
              }}
            >
              When & Where
            </h2>
            <div className="flex items-center justify-center mt-4">
              <div className="h-px bg-gray-300 w-24"></div>
              <Heart className="w-6 h-6 mx-4 text-red-400" />
              <div className="h-px bg-gray-300 w-24"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Ceremony */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-3xl mb-4" style={{ fontFamily: '"Great Vibes", cursive' }}>
                  The Ceremony
                </h3>
                <p className="text-gray-700 font-semibold text-lg">Saturday, December 15, 2024</p>
                <p className="text-gray-600 mt-2">4:00 PM - 5:00 PM</p>
                <p className="text-gray-700 mt-4 font-semibold">St. Patrick's Cathedral</p>
                <p className="text-gray-600">5th Avenue, New York, NY 10022</p>
                <button className="mt-6 px-6 py-2 border border-gray-400 hover:bg-gray-100 transition-colors">
                  View Map
                </button>
              </div>
            </div>

            {/* Reception */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-3xl mb-4" style={{ fontFamily: '"Great Vibes", cursive' }}>
                  The Reception
                </h3>
                <p className="text-gray-700 font-semibold text-lg">Saturday, December 15, 2024</p>
                <p className="text-gray-600 mt-2">7:00 PM - 2:00 AM</p>
                <p className="text-gray-700 mt-4 font-semibold">The Plaza Hotel</p>
                <p className="text-gray-600">768 5th Ave, New York, NY 10019</p>
                <button className="mt-6 px-6 py-2 border border-gray-400 hover:bg-gray-100 transition-colors">
                  View Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2
              className="text-5xl md:text-6xl mb-4"
              style={{
                fontFamily: '"Great Vibes", cursive',
                color: '#333333'
              }}
            >
              R.S.V.P
            </h2>
            <div className="flex items-center justify-center mt-4">
              <div className="h-px bg-gray-300 w-24"></div>
              <Heart className="w-6 h-6 mx-4 text-red-400" />
              <div className="h-px bg-gray-300 w-24"></div>
            </div>
            <p className="text-gray-600 mt-6">
              Please confirm your attendance before November 15, 2024
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Will you be attending?</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-400">
                  <option>Yes, I'll be there!</option>
                  <option>Sorry, can't make it</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Number of Guests</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-400">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-400"
                  placeholder="Share your wishes..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Send RSVP
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
};