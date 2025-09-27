/**
 * Hero Section 2 - Elegante con Borde Ondulado
 *
 * WHY: Hero section identical to Hero1 but with a smooth SVG wave border
 * at the bottom to create seamless transition with the next section.
 *
 * FEATURES:
 * - Same as Hero1: Full-screen hero with background image
 * - Same navigation menu with smooth hover effects
 * - Same Great Vibes font for romantic styling
 * - Same parallax background attachment
 * - Same animated scroll indicator
 * - NEW: SVG wave border at bottom for section transition
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { TemplateProps } from '@/types/template';

interface Hero2Props {
  groom_name: string;
  bride_name: string;
  weddingDate: string;
  eventLocation: string;
  heroImageUrl: string;
  navigationItems?: Array<{
    href: string;
    label: string;
  }>;
}

export const Hero2: React.FC<Hero2Props> = ({
  groom_name = 'Jefferson',
  bride_name = 'Rosmery',
  weddingDate = '2024-12-15T17:00:00',
  eventLocation = 'LIMA - PERÚ',
  heroImageUrl = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/1-2.jpg',
  navigationItems = [
    { href: '#home', label: 'Home' },
    { href: '#couple', label: 'Couple' },
    { href: '#story', label: 'Story' },
    { href: '#friends', label: 'Friends' },
    { href: '#events', label: 'Events' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#when-where', label: 'When & Where' },
    { href: '#rsvp', label: 'R.S.V.P' },
    { href: '#blog', label: 'Blog' }
  ]
}) => {
  // Auto-generate couple names from individual names
  const coupleNames = `${groom_name} & ${bride_name}`;

  // Auto-generate eventDate from weddingDate
  const formatWeddingDate = (weddingDateTime: string): string => {
    if (!weddingDateTime) return 'Tu Fecha Especial';

    try {
      const date = new Date(weddingDateTime);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Tu Fecha Especial';
    }
  };

  const eventDate = formatWeddingDate(weddingDate);

  // Detect PDF mode - activated by backend pdf-mode class or pdf=1 query param
  const isPDF = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.location.search.includes('pdf=1') ||
           document.documentElement.classList.contains('pdf-mode');
  }, []);

  return (
    <section
      data-section="hero2"
      className={[
        "relative flex flex-col text-white avoid-break",
        // Avoid 100vh in PDF; use fixed "safe" height for mobile
        isPDF ? "min-h-[812px]" : "min-h-screen"
      ].join(' ')}
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Key: disable fixed attachment in PDF to prevent cropping
        backgroundAttachment: isPDF ? 'scroll' : 'fixed'
      }}
    >
      {/* Header with Navigation */}
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Couple Names in Corner */}
          <div
            className="text-3xl font-medium tracking-wide font-great-vibes"
            style={{
            }}
          >
            {coupleNames}
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-white hover:opacity-80 transition-opacity duration-300 text-sm uppercase tracking-wider font-montserrat font-medium"
                style={{  }}
              >
                {item.label}
              </a>
            ))}
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
      <main className={[
        "flex-grow flex items-center justify-center px-6",
        isPDF ? "animate-none" : ""
      ].join(' ')}>
        <div className="text-center">
          {/* Main Couple Names */}
          <h1
            className="text-7xl md:text-9xl mb-6 font-great-vibes"
            style={{
              color: '#FFFFFF',
              lineHeight: '1.2'
            }}
          >
            {coupleNames}
          </h1>

          {/* Date and Location */}
          <p
            className="text-lg md:text-xl tracking-[0.2em] uppercase font-montserrat font-light"
            style={{
              color: '#FFFFFF',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)'
            }}
          >
            {eventDate}
          </p>
          <p
            className="text-lg md:text-xl tracking-[0.2em] uppercase mt-2 font-montserrat font-light"
            style={{
              color: '#FFFFFF',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)'
            }}
          >
            — {eventLocation} —
          </p>
        </div>
      </main>

      {/* Scroll Indicator: hide in PDF */}
      {!isPDF && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center opacity-70">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Wave SVG: avoid absolute/rotate in PDF to prevent page breaks */}
      {isPDF ? (
        <WaveSVG className="block w-full h-[73px] -mb-px" flip />
      ) : (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180" style={{ bottom: -1 }}>
          <WaveSVG className="relative block w-[calc(100%+1.3px)] h-[73px]" />
        </div>
      )}
    </section>
  );
};

// Reusable Wave SVG Component with flip support
function WaveSVG({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={className}
    >
      {/* Si flip=true, invertimos verticalmente dentro del propio SVG */}
      <g transform={flip ? "scale(1,-1) translate(0,-120)" : undefined}>
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          opacity="0.25"
          className="fill-white"
        />
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          opacity="0.5"
          className="fill-white"
        />
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          className="fill-white"
        />
      </g>
    </svg>
  );
}

// Export default props - same as Hero1 for compatibility
export const Hero2DefaultProps = {
  groom_name: 'Jefferson',
  bride_name: 'Rosmery',
  weddingDate: '2024-12-15T17:00:00',
  eventLocation: 'LIMA - PERÚ',
  heroImageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/1-2.jpg',
  navigationItems: [
    { href: '#home', label: 'Home' },
    { href: '#couple', label: 'Couple' },
    { href: '#story', label: 'Story' },
    { href: '#friends', label: 'Friends' },
    { href: '#events', label: 'Events' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#when-where', label: 'When & Where' },
    { href: '#rsvp', label: 'R.S.V.P' },
    { href: '#blog', label: 'Blog' }
  ]
};