/**
 * Custom Tabs Component
 * 
 * WHY: Provides a more flexible tabs component with icon support
 * and custom styling that matches our dashboard design requirements.
 * 
 * WHAT: Tab navigation component with icons, active state management,
 * and responsive design for dashboard sections.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

/**
 * Custom tabs component with icon support
 * 
 * @param tabs - Array of tab configurations
 * @param activeTab - Currently active tab ID
 * @param onTabChange - Callback when tab is changed
 * @param className - Additional CSS classes
 * @param variant - Visual style variant
 */
export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'default'
}: TabsProps) {
  const getTabClasses = (tab: Tab, isActive: boolean) => {
    const baseClasses = "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2";
    
    switch (variant) {
      case 'pills':
        return cn(
          baseClasses,
          "rounded-lg",
          isActive
            ? "bg-purple-600 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        );
      
      case 'underline':
        return cn(
          baseClasses,
          "border-b-2 rounded-none",
          isActive
            ? "border-purple-600 text-purple-600"
            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
        );
      
      default:
        return cn(
          baseClasses,
          "border border-gray-200 first:rounded-l-lg last:rounded-r-lg first:border-r-0 last:border-l-0",
          isActive
            ? "bg-white text-purple-600 border-purple-200 shadow-sm z-10 relative"
            : "bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        );
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'pills':
        return "flex flex-wrap gap-2";
      case 'underline':
        return "flex border-b border-gray-200";
      default:
        return "flex bg-gray-100 rounded-lg p-1";
    }
  };

  return (
    <div className={cn(getContainerClasses(), className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={getTabClasses(tab, isActive)}
            type="button"
            role="tab"
            aria-selected={isActive}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                isActive
                  ? variant === 'pills' 
                    ? "bg-white bg-opacity-20 text-white"
                    : "bg-purple-100 text-purple-700"
                  : "bg-gray-200 text-gray-600"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}