import { motion, AnimatePresence } from 'framer-motion';
import { LoaderWedding } from './LoaderWedding';
import { LoaderKids } from './LoaderKids';

interface LoaderDynamicProps {
  category: 'weddings' | 'kids' | 'corporate';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  isLoading?: boolean;
  onComplete?: () => void;
}

export function LoaderDynamic({
  category,
  className = "",
  size = 'medium',
  message,
  isLoading = true,
  onComplete
}: LoaderDynamicProps) {
  const commonProps = { className, size, message };

  const renderLoader = () => {
    switch (category) {
      case 'weddings':
        return <LoaderWedding {...commonProps} />;
      case 'kids':
        return <LoaderKids {...commonProps} />;
      case 'corporate':
        return <LoaderWedding {...commonProps} />;
      default:
        return <LoaderWedding {...commonProps} />;
    }
  };

  // When used standalone (without LoaderOverlay)
  if (isLoading === false) {
    return null;
  }

  // Check if we need animation wrapper or just render the loader
  const shouldWrapWithAnimation = isLoading !== undefined;

  if (shouldWrapWithAnimation) {
    return (
      <AnimatePresence mode="wait" onExitComplete={onComplete}>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut"
            }}
          >
            {renderLoader()}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Direct render for use within LoaderOverlay
  return renderLoader();
}

export default LoaderDynamic;