/**
 * Customizer Button Component
 *
 * WHY: Floating button that triggers the customizer panel.
 * Positioned fixed in the bottom-right corner with a modern design.
 */

'use client';

import { Edit3, Settings } from 'lucide-react';

interface CustomizerButtonProps {
  onClick: () => void;
  isOpen: boolean;
  hasFields: boolean;
  className?: string;
}

export const CustomizerButton: React.FC<CustomizerButtonProps> = ({
  onClick,
  isOpen,
  hasFields,
  className = ''
}) => {
  // Don't render if no fields available
  if (!hasFields) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        px-6 py-3
        bg-gradient-to-r from-purple-600 to-pink-600
        hover:from-purple-700 hover:to-pink-700
        text-white font-semibold
        rounded-full shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:scale-105 active:scale-95
        flex items-center gap-3
        border border-white/20
        backdrop-blur-sm
        ${isOpen ? 'bg-gray-600 from-gray-600 to-gray-700' : ''}
        ${className}
      `}
      style={{ zIndex: 9999 }}
      aria-label={isOpen ? 'Cerrar personalizador' : 'Personalizar invitación'}
      title={isOpen ? 'Cerrar personalizador' : 'Personalizar invitación'}
    >
      {/* Icon */}
      <div className="flex items-center justify-center">
        {isOpen ? (
          <Settings className="w-5 h-5 animate-spin" />
        ) : (
          <Edit3 className="w-5 h-5" />
        )}
      </div>

      {/* Text */}
      <span className="hidden sm:inline text-sm font-medium">
        {isOpen ? 'Cerrar' : 'Personalizar'}
      </span>

      {/* Pulse indicator when not open */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
      )}
    </button>
  );
};