/**
 * Empty State Component
 * 
 * WHY: Consistent empty state display for various scenarios like
 * empty cart, no search results, etc. Provides clear messaging
 * and appropriate actions for users.
 * 
 * WHAT: Reusable empty state with icon, title, description, and
 * customizable action buttons.
 */

'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode | {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-6">
          {icon}
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          typeof action === 'object' && 'label' in action ? (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className={action.variant === 'default' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {action.label}
            </Button>
          ) : action
        )}
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant={secondaryAction.variant || 'outline'}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;