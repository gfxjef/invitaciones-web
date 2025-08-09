/**
 * Loading Spinner Component
 * 
 * WHY: Reusable loading spinner component that provides consistent
 * visual feedback during async operations across the application.
 * 
 * WHAT: Customizable spinning animation with different sizes and colors.
 */

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'border-2 border-current border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

export default LoadingSpinner;