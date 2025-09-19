/**
 * Checkbox Component
 * 
 * WHY: Reusable checkbox component with consistent styling
 * and accessibility features.
 * 
 * WHAT: Custom checkbox with indeterminate state support
 * and proper focus management.
 */

"use client"

import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, indeterminate = false, onCheckedChange, disabled = false, className, id, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked || indeterminate 
            ? "bg-purple-600 border-purple-600 text-white" 
            : "bg-white border-gray-300",
          className
        )}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        id={id}
        {...props}
      >
        {indeterminate ? (
          <Minus className="h-3 w-3" />
        ) : checked ? (
          <Check className="h-3 w-3" />
        ) : null}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }