/**
 * Alert Dialog Components
 * 
 * WHY: Reusable alert dialog components for confirmations
 * and important user interactions that require attention.
 * 
 * WHAT: Modal dialog system with overlay, content, and
 * action buttons for confirmations and alerts.
 */

"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Context for alert dialog state management
interface AlertDialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | undefined>(undefined)

// Main alert dialog container
interface AlertDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const AlertDialog = ({ children, open: controlledOpen, onOpenChange }: AlertDialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

// Hook to use alert dialog context
const useAlertDialog = () => {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("useAlertDialog must be used within an AlertDialog")
  }
  return context
}

// Trigger component
interface AlertDialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ asChild = false, children, className, ...props }, ref) => {
    const { setOpen } = useAlertDialog()

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      setOpen(true)
    }

    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        onClick: handleClick,
      })
    }

    return (
      <button
        ref={ref}
        type="button"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
AlertDialogTrigger.displayName = "AlertDialogTrigger"

// Overlay component
const AlertDialogOverlay = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => {
    const { open } = useAlertDialog()

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className
        )}
        {...props}
      />
    )
  }
)
AlertDialogOverlay.displayName = "AlertDialogOverlay"

// Content component
interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open, setOpen } = useAlertDialog()
    const contentRef = React.useRef<HTMLDivElement>(null)

    // Close on escape key
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
      }
    }, [open, setOpen])

    if (!open) return null

    return (
      <>
        <AlertDialogOverlay />
        <div
          ref={contentRef}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }
)
AlertDialogContent.displayName = "AlertDialogContent"

// Header component
interface AlertDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

const AlertDialogHeader = ({ children, className, ...props }: AlertDialogHeaderProps) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  >
    {children}
  </div>
)
AlertDialogHeader.displayName = "AlertDialogHeader"

// Footer component
interface AlertDialogFooterProps {
  children: React.ReactNode
  className?: string
}

const AlertDialogFooter = ({ children, className, ...props }: AlertDialogFooterProps) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  >
    {children}
  </div>
)
AlertDialogFooter.displayName = "AlertDialogFooter"

// Title component
interface AlertDialogTitleProps {
  children: React.ReactNode
  className?: string
}

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ children, className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    >
      {children}
    </h2>
  )
)
AlertDialogTitle.displayName = "AlertDialogTitle"

// Description component
interface AlertDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  ({ children, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-500", className)}
      {...props}
    >
      {children}
    </p>
  )
)
AlertDialogDescription.displayName = "AlertDialogDescription"

// Action button component
interface AlertDialogActionProps {
  children: React.ReactNode
  className?: string
  onClick?: (event: React.MouseEvent) => void
  disabled?: boolean
}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ children, className, onClick, disabled = false, ...props }, ref) => {
    const { setOpen } = useAlertDialog()

    const handleClick = (event: React.MouseEvent) => {
      if (!disabled) {
        onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(false)
        }
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)
AlertDialogAction.displayName = "AlertDialogAction"

// Cancel button component
interface AlertDialogCancelProps {
  children: React.ReactNode
  className?: string
  onClick?: (event: React.MouseEvent) => void
}

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog()

    const handleClick = (event: React.MouseEvent) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(false)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:mt-0",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}