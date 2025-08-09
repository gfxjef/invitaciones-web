/**
 * Copy Button Component
 * 
 * WHY: Provides consistent copy-to-clipboard functionality across the app.
 * Essential for URL sharing and user convenience.
 * 
 * WHAT: Button component that copies text to clipboard with visual feedback.
 * Includes loading states, success animation, and fallback handling.
 */

'use client';

import { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/lib/hooks/use-invitation-urls';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg' | 'icon' | 'default';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

export function CopyButton({
  text,
  label = 'Copiar',
  variant = 'outline',
  size = 'sm',
  className = '',
  showText = true,
  disabled = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copyMutation = useCopyToClipboard();

  const handleCopy = async () => {
    if (!text || disabled) return;

    try {
      await copyMutation.mutateAsync(text);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Copy failed:', error);
    }
  };

  const getIcon = () => {
    if (copyMutation.isPending) {
      return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
    }
    if (copied) {
      return <Check className="w-4 h-4 text-green-600" />;
    }
    return <Copy className="w-4 h-4" />;
  };

  const getButtonText = () => {
    if (copyMutation.isPending) return 'Copiando...';
    if (copied) return 'Copiado';
    return label;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={disabled || copyMutation.isPending || !text}
      className={`transition-all duration-200 ${copied ? 'text-green-600 border-green-600' : ''} ${className}`}
    >
      {getIcon()}
      {showText && <span className="ml-2">{getButtonText()}</span>}
    </Button>
  );
}

/**
 * Copy URL Card Component
 * 
 * WHY: Displays URL with copy functionality in a card format.
 * Provides better UX for URL sharing with visual context.
 */
interface CopyURLCardProps {
  url: string;
  title?: string;
  description?: string;
  shortCode?: string;
  className?: string;
}

export function CopyURLCard({
  url,
  title,
  description,
  shortCode,
  className = '',
}: CopyURLCardProps) {
  return (
    <div className={`bg-gray-50 border rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-gray-600 mb-2">{description}</p>
          )}
          <div className="bg-white border rounded px-3 py-2">
            <p className="text-sm font-mono text-gray-900 break-all">{url}</p>
          </div>
          {shortCode && (
            <p className="text-xs text-gray-500 mt-1">
              Código: <span className="font-mono">{shortCode}</span>
            </p>
          )}
        </div>
        <CopyButton
          text={url}
          label="Copiar"
          showText={false}
        />
      </div>
    </div>
  );
}

/**
 * Inline Copy Text Component
 * 
 * WHY: Shows copyable text inline with copy button.
 * Useful for displaying codes, URLs, or IDs within content.
 */
interface InlineCopyTextProps {
  text: string;
  displayText?: string;
  className?: string;
  buttonClassName?: string;
}

export function InlineCopyText({
  text,
  displayText,
  className = '',
  buttonClassName = '',
}: InlineCopyTextProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
        {displayText || text}
      </code>
      <CopyButton
        text={text}
        showText={false}
        variant="ghost"
        size="sm"
        className={buttonClassName}
      />
    </div>
  );
}

/**
 * Copy Link Component
 * 
 * WHY: Combines link functionality with copy capability.
 * Allows users to both visit and copy URLs.
 */
interface CopyLinkProps {
  url: string;
  text: string;
  external?: boolean;
  className?: string;
}

export function CopyLink({
  url,
  text,
  external = true,
  className = '',
}: CopyLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (external) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={url}
        onClick={handleClick}
        className="text-purple-600 hover:text-purple-700 hover:underline cursor-pointer flex-1 truncate"
        title={url}
      >
        {text}
      </a>
      <CopyButton
        text={url}
        showText={false}
        variant="ghost"
        size="sm"
      />
    </div>
  );
}

/**
 * Bulk Copy Component
 * 
 * WHY: Allows copying multiple URLs at once.
 * Useful for sharing multiple invitation links.
 */
interface BulkCopyProps {
  urls: Array<{
    url: string;
    title: string;
  }>;
  separator?: string;
  className?: string;
}

export function BulkCopyButton({
  urls,
  separator = '\n\n',
  className = '',
}: BulkCopyProps) {
  const formatText = () => {
    return urls
      .map(({ url, title }) => `${title}\n${url}`)
      .join(separator);
  };

  if (!urls.length) {
    return null;
  }

  return (
    <CopyButton
      text={formatText()}
      label={`Copiar todas (${urls.length})`}
      variant="outline"
      className={className}
    />
  );
}