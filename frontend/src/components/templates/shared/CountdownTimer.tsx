/**
 * Countdown Timer Component
 *
 * WHY: Reusable countdown timer that can be used across different templates
 * with customizable styling and sizes.
 */

'use client';

import { useState, useEffect } from 'react';
import { CountdownTimerProps } from '@/types/template';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  colors,
  showLabels = true,
  size = 'medium',
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

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
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Size variants
  const sizeClasses = {
    small: {
      container: 'gap-1 max-w-xs',
      item: 'p-2',
      number: 'text-lg font-bold',
      label: 'text-xs'
    },
    medium: {
      container: 'gap-2 max-w-sm',
      item: 'p-3',
      number: 'text-2xl font-bold',
      label: 'text-xs'
    },
    large: {
      container: 'gap-4 max-w-lg',
      item: 'p-4',
      number: 'text-4xl font-bold',
      label: 'text-sm'
    }
  };

  const currentSize = sizeClasses[size];

  if (isExpired) {
    return (
      <div className={`text-center text-white ${className}`}>
        <h3 className="text-xl font-bold mb-2">¡Día Especial!</h3>
        <p className="opacity-80">El gran día ha llegado</p>
      </div>
    );
  }

  return (
    <div className={`text-center text-white ${className}`}>
      {showLabels && (
        <h3 className="text-xl font-bold mb-6">¡FALTAN!</h3>
      )}
      <div className={`grid grid-cols-4 ${currentSize.container} mx-auto`}>
        <div
          className={`bg-white/20 backdrop-blur-sm rounded-lg ${currentSize.item}`}
          style={{ borderColor: colors.accent }}
        >
          <div
            className={currentSize.number}
            style={{ color: colors.text }}
          >
            {timeLeft.days}
          </div>
          {showLabels && (
            <div className={`${currentSize.label} opacity-80`}>
              Días
            </div>
          )}
        </div>

        <div
          className={`bg-white/20 backdrop-blur-sm rounded-lg ${currentSize.item}`}
          style={{ borderColor: colors.accent }}
        >
          <div
            className={currentSize.number}
            style={{ color: colors.text }}
          >
            {timeLeft.hours}
          </div>
          {showLabels && (
            <div className={`${currentSize.label} opacity-80`}>
              Horas
            </div>
          )}
        </div>

        <div
          className={`bg-white/20 backdrop-blur-sm rounded-lg ${currentSize.item}`}
          style={{ borderColor: colors.accent }}
        >
          <div
            className={currentSize.number}
            style={{ color: colors.text }}
          >
            {timeLeft.minutes}
          </div>
          {showLabels && (
            <div className={`${currentSize.label} opacity-80`}>
              Min
            </div>
          )}
        </div>

        <div
          className={`bg-white/20 backdrop-blur-sm rounded-lg ${currentSize.item}`}
          style={{ borderColor: colors.accent }}
        >
          <div
            className={currentSize.number}
            style={{ color: colors.text }}
          >
            {timeLeft.seconds}
          </div>
          {showLabels && (
            <div className={`${currentSize.label} opacity-80`}>
              Seg
            </div>
          )}
        </div>
      </div>
    </div>
  );
};