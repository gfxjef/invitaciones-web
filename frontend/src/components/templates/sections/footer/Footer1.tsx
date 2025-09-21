/**
 * Footer Section 1 - Smart Back to Top Button
 *
 * WHY: Elegant footer with intelligent back-to-top functionality that improves
 * navigation UX with smooth scrolling and visibility controls.
 */

'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface Footer1Props {
  coupleNames?: string;
  eventDate?: string;
  eventLocation?: string;
  copyrightText?: string;
}

export const Footer1: React.FC<Footer1Props> = ({
  coupleNames = 'Jefferson & Rosmery',
  eventDate = '24 DECEMBER 2026',
  eventLocation = 'Lima, Peru',
  copyrightText = 'Hecho con Amor. All right reserved Amiras Gift.'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <footer className="relative bg-[#222222] text-gray-400 pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-6xl md:text-7xl text-white font-great-vibes">
          {coupleNames}
        </h2>

        <p className="mt-4 text-sm tracking-[0.2em] uppercase font-montserrat">
          {eventDate}, {eventLocation}
        </p>

        <hr className="border-t border-gray-700 w-1/2 mx-auto my-12" />

        <p className="text-xs text-gray-500 font-montserrat">
          {copyrightText}
        </p>
      </div>

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

// Export default props for centralized access
export const Footer1DefaultProps = {
  coupleNames: 'Jefferson & Rosmery',
  eventDate: '24 DECEMBER 2026',
  eventLocation: 'Lima, Peru',
  copyrightText: 'Hecho con Amor. All right reserved Amiras Gift.'
};