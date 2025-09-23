/**
 * Countdown Section 1 - Animated Timer with Parallax Background
 *
 * WHY: Creates anticipation and excitement by showing a live countdown to the wedding date
 * with elegant parallax background effect and romantic styling.
 *
 * FEATURES:
 * - Real-time countdown timer
 * - Parallax background effect
 * - Responsive design with scalable text
 * - Great Vibes font for romantic title
 * - Auto-cleanup of timer intervals
 * - Zero padding for consistent display
 */

'use client';

import { useState, useEffect } from 'react';

interface CountdownUnit {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Countdown1Props {
  weddingDate?: string;
  backgroundImageUrl?: string;
  preTitle?: string;
  title?: string;
}

export const Countdown1: React.FC<Countdown1Props> = ({
  weddingDate = '2025-12-15T17:00:00',
  backgroundImageUrl = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1.jpg',
  preTitle = 'DENTRO DE POCO SEREMOS UNA FAMILIA',
  title = "Nos Casaremos en ..."
}) => {

  const calculateTimeLeft = (): CountdownUnit => {
    const difference = +new Date(weddingDate) - +new Date();
    let timeLeft: CountdownUnit;

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

  const [timeLeft, setTimeLeft] = useState<CountdownUnit>(calculateTimeLeft());

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
      <span className="block text-5xl md:text-7xl font-montserrat font-bold">
        {value}
      </span>
      <span className="block mt-2 text-xs font-light tracking-[0.2em] uppercase font-montserrat">
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
        <p className="tracking-[0.3em] text-sm font-light uppercase font-montserrat">
          {preTitle}
        </p>
        <h2 className="text-[3rem] md:text-[5rem] font-great-vibes">
          {title}
        </h2>

        {/* Contenedor de la cuenta regresiva */}
        <div className="flex justify-center items-start space-x-4 md:space-x-12">
          <TimeUnit value={String(timeLeft.days || 0).padStart(2, '0')} label="Days" />
          <TimeUnit value={String(timeLeft.hours || 0).padStart(2, '0')} label="Hours" />
          <TimeUnit value={String(timeLeft.minutes || 0).padStart(2, '0')} label="Minutes" />
          <TimeUnit value={String(timeLeft.seconds || 0).padStart(2, '0')} label="Seconds" />
        </div>
      </div>
    </section>
  );
};

// Export default props for centralized access
export const Countdown1DefaultProps = {
  weddingDate: '2025-12-15T17:00:00',
  backgroundImageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1.jpg',
  preTitle: 'DENTRO DE POCO SEREMOS UNA FAMILIA',
  title: "Nos Casaremos en ..."
};