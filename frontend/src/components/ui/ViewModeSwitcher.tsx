/**
 * ViewModeSwitcher Component
 *
 * WHY: Switch component to toggle between Desktop and Mobile view modes
 * in the demo page, allowing users to preview invitations in different viewports.
 *
 * WHAT: Animated toggle switch similar to CustomizerPanel's mode switcher
 * but adapted for Desktop/Mobile viewport switching.
 */

'use client';

import { motion } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';

export type ViewMode = 'desktop' | 'mobile';

interface ViewModeSwitcherProps {
  /**
   * Current selected view mode
   */
  selectedMode: ViewMode;

  /**
   * Callback when mode changes
   */
  onModeChange: (mode: ViewMode) => void;

  /**
   * Optional custom className
   */
  className?: string;
}

export function ViewModeSwitcher({
  selectedMode,
  onModeChange,
  className = ""
}: ViewModeSwitcherProps) {

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Container */}
      <button
        onClick={() => onModeChange(selectedMode === 'desktop' ? 'mobile' : 'desktop')}
        className={`
          relative flex items-center
          w-80 h-16 px-4
          bg-white rounded-full
          shadow-sm border border-gray-200
          cursor-pointer
          hover:shadow-md
          transition-shadow duration-200
          ${selectedMode === 'desktop' ? 'justify-start' : 'justify-end'}
        `}
        aria-label={`Cambiar a vista ${selectedMode === 'desktop' ? 'móvil' : 'escritorio'}`}
      >
        {/* Animated Handle */}
        <motion.div
          layout
          className="
            flex justify-center items-center gap-3
            w-36 h-12
            bg-gradient-to-r from-purple-600 to-purple-700
            text-white font-medium text-sm
            rounded-full
            shadow-lg
          "
          transition={{
            type: 'spring',
            duration: 0.2,
            bounce: 0.2
          }}
        >
          {selectedMode === 'desktop' ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
          <span>
            {selectedMode === 'desktop' ? 'Escritorio' : 'Móvil'}
          </span>
        </motion.div>

        {/* Static Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
          <div className={`flex items-center gap-2 transition-opacity duration-200 ${
            selectedMode === 'desktop' ? 'opacity-0' : 'opacity-60'
          }`}>
            <Monitor className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Escritorio</span>
          </div>
          <div className={`flex items-center gap-2 transition-opacity duration-200 ${
            selectedMode === 'mobile' ? 'opacity-0' : 'opacity-60'
          }`}>
            <Smartphone className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Móvil</span>
          </div>
        </div>
      </button>
    </div>
  );
}