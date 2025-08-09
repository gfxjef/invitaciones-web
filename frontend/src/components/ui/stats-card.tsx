/**
 * Stats Card Component
 * 
 * WHY: Provides a consistent way to display key metrics and statistics
 * throughout the dashboard. Essential for showing user data insights
 * and performance indicators.
 * 
 * WHAT: Flexible card component for displaying numerical data with
 * icons, trends, descriptions, and optional actions.
 */

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'gray';
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  action?: React.ReactNode;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'gradient' | 'outline';
}

const iconColorClasses = {
  purple: 'text-purple-600 bg-purple-100',
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  yellow: 'text-yellow-600 bg-yellow-100',
  red: 'text-red-600 bg-red-100',
  orange: 'text-orange-600 bg-orange-100',
  gray: 'text-gray-600 bg-gray-100',
};

/**
 * Statistics card component for dashboard metrics
 * 
 * @param title - Card title/label
 * @param value - Main statistic value
 * @param description - Additional descriptive text
 * @param icon - Lucide icon component
 * @param iconColor - Color theme for icon
 * @param trend - Trend information with value and direction
 * @param action - Optional action button/component
 * @param loading - Loading state
 * @param className - Additional CSS classes
 * @param variant - Visual style variant
 */
export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'purple',
  trend,
  action,
  loading = false,
  className,
  variant = 'default'
}: StatsCardProps) {
  const getCardClasses = () => {
    const baseClasses = "relative overflow-hidden transition-all duration-200 hover:shadow-md";
    
    switch (variant) {
      case 'gradient':
        return cn(
          baseClasses,
          "bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0"
        );
      case 'outline':
        return cn(
          baseClasses,
          "bg-white border-2 border-gray-200 hover:border-purple-200"
        );
      default:
        return cn(
          baseClasses,
          "bg-white border border-gray-200 shadow-sm"
        );
    }
  };

  const getTextClasses = () => {
    return variant === 'gradient' 
      ? "text-white" 
      : "text-gray-900";
  };

  const getDescriptionClasses = () => {
    return variant === 'gradient' 
      ? "text-purple-100" 
      : "text-gray-600";
  };

  if (loading) {
    return (
      <div className={cn("rounded-xl p-6", getCardClasses(), className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="w-32 h-3 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl p-6", getCardClasses(), className)}>
      {/* Header with Icon and Value */}
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            variant === 'gradient' 
              ? "bg-white bg-opacity-20 text-white" 
              : iconColorClasses[iconColor]
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <div className="text-right">
          <div className={cn(
            "text-2xl font-bold",
            getTextClasses()
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm",
              variant === 'gradient' 
                ? "text-white" 
                : trend.positive 
                  ? "text-green-600" 
                  : "text-red-600"
            )}>
              {trend.positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Title and Description */}
      <div className="space-y-1">
        <h3 className={cn(
          "font-medium text-sm",
          getTextClasses()
        )}>
          {title}
        </h3>
        
        {description && (
          <p className={cn(
            "text-xs",
            getDescriptionClasses()
          )}>
            {description}
          </p>
        )}

        {trend && (
          <p className={cn(
            "text-xs",
            getDescriptionClasses()
          )}>
            {trend.label}
          </p>
        )}
      </div>

      {/* Optional Action */}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}

      {/* Decorative Background Pattern (for gradient variant) */}
      {variant === 'gradient' && (
        <>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full -ml-8 -mb-8"></div>
        </>
      )}
    </div>
  );
}

/**
 * Stats Grid Component for displaying multiple stats cards
 */
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ 
  children, 
  columns = 4, 
  className 
}: StatsGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-6',
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}