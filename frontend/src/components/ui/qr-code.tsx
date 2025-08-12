/**
 * QR Code Component
 * 
 * WHY: Displays QR codes for invitation URLs with download functionality.
 * Essential for mobile sharing and quick access to invitations.
 * 
 * WHAT: Component that shows QR codes with loading states, error handling,
 * and download capabilities. Supports different sizes and styling options.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, QrCode, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useDownloadQRCode } from '@/lib/hooks/use-invitation-urls';

interface QRCodeProps {
  shortCode: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showDownload?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    container: 'w-24 h-24',
    image: 'w-full h-full',
    text: 'text-xs',
  },
  md: {
    container: 'w-32 h-32',
    image: 'w-full h-full', 
    text: 'text-sm',
  },
  lg: {
    container: 'w-48 h-48',
    image: 'w-full h-full',
    text: 'text-base',
  },
};

export function QRCodeDisplay({ 
  shortCode, 
  title, 
  size = 'md', 
  showDownload = true,
  className = '' 
}: QRCodeProps) {
  const [qrImageUrl, setQRImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const downloadQR = useDownloadQRCode();
  const sizeConfig = SIZE_CONFIG[size];

  const loadQRCode = useCallback(async () => {
    if (!shortCode) {
      setError('Código corto no disponible');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create URL for QR code endpoint
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const qrUrl = `${baseUrl}/r/${shortCode}/qr`;
      
      // Check if image loads successfully
      const img = new window.Image();
      img.onload = () => {
        setQRImageUrl(qrUrl);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError('Error al cargar el código QR');
        setIsLoading(false);
      };
      img.src = qrUrl;
      
    } catch (error) {
      console.error('Error loading QR code:', error);
      setError('Error al cargar el código QR');
      setIsLoading(false);
    }
  }, [shortCode]);

  useEffect(() => {
    loadQRCode();
  }, [loadQRCode]);

  const handleDownload = () => {
    if (shortCode) {
      downloadQR.mutate(shortCode);
    }
  };

  const handleRetry = () => {
    loadQRCode();
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* QR Code Display */}
      <div className={`${sizeConfig.container} bg-white border-2 border-gray-200 rounded-lg p-2 shadow-sm`}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-xs text-center">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="mt-1 text-xs"
            >
              Reintentar
            </Button>
          </div>
        ) : qrImageUrl ? (
          <Image
            src={qrImageUrl}
            alt={`Código QR para ${title || shortCode}`}
            width={sizeConfig.size}
            height={sizeConfig.size}
            className={`${sizeConfig.image} object-contain`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <QrCode className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Title */}
      {title && (
        <p className={`${sizeConfig.text} text-gray-700 text-center font-medium max-w-full truncate`}>
          {title}
        </p>
      )}

      {/* Short Code */}
      <p className={`${sizeConfig.text} text-gray-500 text-center font-mono`}>
        {shortCode}
      </p>

      {/* Download Button */}
      {showDownload && !isLoading && !error && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloadQR.isPending}
          className="flex items-center gap-2"
        >
          {downloadQR.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Descargar
        </Button>
      )}
    </div>
  );
}

/**
 * QR Code Grid Component
 * 
 * WHY: Shows multiple QR codes in a responsive grid layout.
 * Useful for displaying QR codes for multiple URLs in a compact format.
 */
interface QRCodeGridProps {
  qrCodes: Array<{
    shortCode: string;
    title: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  showDownload?: boolean;
  className?: string;
}

export function QRCodeGrid({ 
  qrCodes, 
  size = 'sm', 
  showDownload = false,
  className = '' 
}: QRCodeGridProps) {
  if (!qrCodes.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <QrCode className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No hay códigos QR disponibles</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${className}`}>
      {qrCodes.map(({ shortCode, title }) => (
        <QRCodeDisplay
          key={shortCode}
          shortCode={shortCode}
          title={title}
          size={size}
          showDownload={showDownload}
        />
      ))}
    </div>
  );
}

/**
 * QR Code Modal Component
 * 
 * WHY: Displays QR code in a modal for better visibility and interaction.
 * Provides larger view with enhanced download and sharing options.
 */
interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortCode: string;
  title: string;
  fullUrl: string;
}

export function QRCodeModal({ 
  isOpen, 
  onClose, 
  shortCode, 
  title, 
  fullUrl 
}: QRCodeModalProps) {
  if (!isOpen) return null;

  const handleShareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Te invito a mi evento: ${title}`,
          url: fullUrl,
        });
      } catch (error) {
        // User cancelled or share failed, fall back to copy
        navigator.clipboard.writeText(fullUrl);
      }
    } else {
      navigator.clipboard.writeText(fullUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Código QR</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </Button>
        </div>

        <div className="text-center">
          <QRCodeDisplay
            shortCode={shortCode}
            title={title}
            size="lg"
            showDownload={true}
          />
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">URL de invitación:</p>
            <p className="text-sm font-mono text-gray-900 break-all">{fullUrl}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShareUrl}
            >
              Compartir URL
            </Button>
            <Button
              className="flex-1"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}