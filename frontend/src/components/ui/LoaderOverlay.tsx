import { motion, AnimatePresence } from 'framer-motion';
import { LoaderDynamic } from './LoaderDynamic';

interface LoaderOverlayProps {
  isLoading: boolean;
  category: 'weddings' | 'kids' | 'corporate';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlayClassName?: string;
  backgroundColor?: string;
  zIndex?: number;
}

/**
 * LoaderOverlay Component
 *
 * WHAT: An overlay wrapper that displays a category-based loader on top of content
 * WHY: Provides smooth loading transitions while content renders underneath
 * HOW: Uses Framer Motion for fade animations with a fixed position overlay
 *
 * @param isLoading - Controls whether the overlay is visible
 * @param category - Determines which themed loader to display
 * @param className - Additional classes for the loader content
 * @param size - Size of the loader icon (small/medium/large)
 * @param message - Optional message to display below the loader
 * @param overlayClassName - Additional classes for the overlay container
 * @param backgroundColor - Custom background color (defaults to white)
 * @param zIndex - Custom z-index value (defaults to 50)
 */
export function LoaderOverlay({
  isLoading,
  category,
  className = "",
  size = 'medium',
  message,
  overlayClassName = "",
  backgroundColor = "bg-white",
  zIndex = 50
}: LoaderOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut"
          }}
          className={`
            fixed inset-0 flex items-center justify-center
            ${backgroundColor}
            ${overlayClassName}
          `}
          style={{ zIndex }}
        >
          {/* Content container with subtle fade-in animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              delay: 0.1
            }}
            className="flex flex-col items-center justify-center"
          >
            <LoaderDynamic
              category={category}
              size={size}
              message={message}
              className={className}
              isLoading={true}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoaderOverlay;