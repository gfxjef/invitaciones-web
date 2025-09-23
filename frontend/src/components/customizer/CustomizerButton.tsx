/**
 * Customizer Button Component
 *
 * WHY: Floating button that triggers the customizer panel.
 * Features animated hamburger-to-X icon transition using Framer Motion.
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { Edit3 } from 'lucide-react';

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

  // SVG Path animation variants for hamburger to X transition
  const pathVariants: Variants = {
    closed: {
      d: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    },
    open: {
      d: "M6 18L18 6M6 6l12 12"
    }
  };

  const buttonVariants: Variants = {
    closed: {
      scale: 1,
      rotate: 0
    },
    open: {
      scale: 1.05,
      rotate: 180
    }
  };

  const textVariants: Variants = {
    closed: {
      rotate: 0
    },
    open: {
      rotate: -180  // Counter-rotation to keep text readable
    }
  };

  return (
    <motion.button
      onClick={onClick}
      variants={buttonVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`
        fixed bottom-6 right-6 z-50
        px-6 py-3
        bg-gradient-to-r from-purple-600 to-pink-600
        hover:from-purple-700 hover:to-pink-700
        text-white font-semibold
        rounded-full shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
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
      {/* Animated SVG Icon */}
      <div className="flex items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            variants={pathVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>

      {/* Text */}
      <motion.span
        variants={textVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="hidden sm:inline text-sm font-medium"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isOpen ? 'Cerrar' : 'Personalizar'}
      </motion.span>

      {/* Pulse indicator when not open */}
      {!isOpen && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  );
};