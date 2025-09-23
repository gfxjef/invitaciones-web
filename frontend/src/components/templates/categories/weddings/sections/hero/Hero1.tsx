/**
 * Hero Section 1 - Elegante con Parallax
 *
 * WHY: Hero section with elegant parallax background effect, navigation bar,
 * and central content display for couple names and event details.
 *
 * FEATURES:
 * - Full-screen hero with background image
 * - Navigation menu with smooth hover effects
 * - Great Vibes font for romantic styling
 * - Parallax background attachment
 * - Animated scroll indicator
 */

'use client';

import { useState, useEffect } from 'react';
import { TemplateProps } from '@/types/template';

interface Hero1Props {
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

export const Hero1: React.FC<Hero1Props> = ({
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
    { href: '#events', label: 'evrr' },
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

  return (
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
      <main className="flex-grow flex items-center justify-center px-6">
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

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center opacity-70">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Export default props for centralized access
export const Hero1DefaultProps = {
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
    { href: '#events', label: 'evrr' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#when-where', label: 'When & Where' },
    { href: '#rsvp', label: 'R.S.V.P' },
    { href: '#blog', label: 'Blog' }
  ]
};