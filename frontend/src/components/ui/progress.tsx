/**
 * Progress Component
 * 
 * WHY: Reusable progress bar component for showing completion status,
 * loading states, and step-by-step progress in wizards and forms.
 * 
 * WHAT: Accessible progress bar component with customizable styling
 * and smooth animations. Follows accessibility guidelines for screen
 * readers and keyboard navigation.
 * 
 * HOW: Uses HTML progress semantics with ARIA attributes for
 * accessibility and CSS animations for smooth transitions.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
  }
>(({ className, value = 0, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out"
      style={{
        transform: `translateX(-${100 - (value / max) * 100}%)`,
      }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    />
  </div>
));

Progress.displayName = "Progress";

export { Progress };