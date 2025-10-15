/**
 * Responsive Preview Frame Component
 * 
 * WHY: Provides device frame simulation with accurate viewport dimensions,
 * user agent simulation, and interactive preview capabilities. Essential for
 * testing responsive design across different devices.
 * 
 * WHAT: Device frame container with viewport simulation, scroll handling,
 * click detection, and performance optimization for smooth rendering.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvitationRenderer } from '../public/InvitationRenderer';
import { PreviewCache } from '../performance/PreviewCache';
import { DeviceFrame, PreviewData } from '@/lib/hooks/usePreview';

interface ResponsivePreviewFrameProps {
  previewData: PreviewData;
  device: DeviceFrame;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  className?: string;
  onInteraction?: (type: 'click' | 'scroll' | 'hover', data: any) => void;
  enableInteraction?: boolean;
  showScrollbars?: boolean;
}

export function ResponsivePreviewFrame({
  previewData,
  device,
  zoom,
  orientation,
  className = '',
  onInteraction,
  enableInteraction = true,
  showScrollbars = true
}: ResponsivePreviewFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [frameOffset, setFrameOffset] = useState({ x: 0, y: 0 });
  
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Device dimensions based on orientation
  const frameWidth = orientation === 'portrait' ? device.width : device.height;
  const frameHeight = orientation === 'portrait' ? device.height : device.width;
  
  // Scaled dimensions
  const scaledWidth = frameWidth * zoom;
  const scaledHeight = frameHeight * zoom;
  
  // Handle iframe load
  const handleIFrameLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    
    if (iframeRef.current && enableInteraction) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Set viewport meta tag for proper mobile simulation
        const viewport = iframeDoc.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', `width=${frameWidth}, initial-scale=1, user-scalable=no`);
        } else {
          const meta = iframeDoc.createElement('meta');
          meta.name = 'viewport';
          meta.content = `width=${frameWidth}, initial-scale=1, user-scalable=no`;
          iframeDoc.head.appendChild(meta);
        }
        
        // Override user agent if different device
        if (device.userAgent) {
          Object.defineProperty(iframeDoc.defaultView!.navigator, 'userAgent', {
            value: device.userAgent,
            writable: false
          });
        }
        
        // Add interaction listeners
        const handleInteractionEvent = (type: 'click' | 'scroll' | 'hover') => (event: Event) => {
          onInteraction?.(type, {
            element: event.target,
            coordinates: 'clientX' in event && 'clientY' in event ? { x: (event as any).clientX, y: (event as any).clientY } : null,
            timestamp: Date.now(),
            device: device.name
          });
        };
        
        if (onInteraction) {
          iframeDoc.addEventListener('click', handleInteractionEvent('click'));
          iframeDoc.addEventListener('mouseover', handleInteractionEvent('hover'));
          iframeDoc.addEventListener('scroll', (event) => {
            const { scrollLeft, scrollTop } = event.target as Element;
            setScrollPosition({ x: scrollLeft, y: scrollTop });
            handleInteractionEvent('scroll')(event);
          });
        }
        
        // Apply device-specific styles
        const style = iframeDoc.createElement('style');
        style.textContent = `
          body {
            margin: 0;
            padding: 0;
            width: ${frameWidth}px;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          * {
            box-sizing: border-box;
          }
          
          /* Touch device styles */
          ${device.type === 'mobile' ? `
            * {
              -webkit-tap-highlight-color: transparent;
            }
            
            button, a, [role="button"] {
              min-height: 44px;
              min-width: 44px;
            }
          ` : ''}
          
          /* Tablet optimizations */
          ${device.type === 'tablet' ? `
            body {
              font-size: 16px;
              line-height: 1.5;
            }
          ` : ''}
          
          /* Desktop styles */
          ${device.type === 'desktop' ? `
            body {
              cursor: default;
            }
            
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            
            ::-webkit-scrollbar-track {
              background: #f1f1f1;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          ` : ''}
          
          /* Hide scrollbars if disabled */
          ${!showScrollbars ? `
            body {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            
            body::-webkit-scrollbar {
              display: none;
            }
          ` : ''}
        `;
        iframeDoc.head.appendChild(style);
      }
    }
  }, [device, frameWidth, enableInteraction, onInteraction, showScrollbars]);
  
  // Handle iframe error
  const handleIFrameError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);
  
  // Handle retry
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);
  
  // Update frame position for centering
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      const offsetX = Math.max(0, (containerRect.width - scaledWidth) / 2);
      const offsetY = Math.max(0, (containerRect.height - scaledHeight) / 2);
      
      setFrameOffset({ x: offsetX, y: offsetY });
    }
  }, [scaledWidth, scaledHeight, zoom]);
  
  // Device frame styles
  const deviceFrameStyles = {
    mobile: {
      borderRadius: '36px',
      border: '8px solid #1f2937',
      boxShadow: '0 0 0 2px #374151, 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      background: '#1f2937'
    },
    tablet: {
      borderRadius: '24px',
      border: '12px solid #374151',
      boxShadow: '0 0 0 2px #4b5563, 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      background: '#374151'
    },
    desktop: {
      borderRadius: '8px',
      border: '2px solid #d1d5db',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      background: '#f9fafb'
    }
  };
  
  const frameStyle = deviceFrameStyles[device.type];
  
  // Generate preview HTML for iframe
  const generatePreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=${frameWidth}, initial-scale=1, user-scalable=no">
        <title>Preview - ${previewData.invitation.title}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { 
            width: ${frameWidth}px; 
            margin: 0; 
            padding: 0; 
            overflow-x: hidden;
          }
        </style>
      </head>
      <body>
        <div id="invitation-root">
          <!-- Invitation content will be rendered here -->
          <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div class="container mx-auto px-4 py-8">
              <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="text-center p-8">
                  <h1 class="text-3xl font-bold text-gray-900 mb-4">
                    ${previewData.custom_data.couple_groom_name || 'Novio'} & 
                    ${previewData.custom_data.couple_bride_name || 'Novia'}
                  </h1>
                  <p class="text-lg text-gray-600 mb-6">
                    ${previewData.custom_data.couple_welcome_message || 'Te invitamos a celebrar nuestro día especial'}
                  </p>
                  <div class="text-xl font-semibold text-purple-600">
                    ${previewData.custom_data.event_date ? new Date(previewData.custom_data.event_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Fecha por confirmar'}
                  </div>
                </div>
                
                ${previewData.custom_data.event_venue_name ? `
                  <div class="border-t p-8">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Lugar del Evento</h2>
                    <p class="text-lg text-gray-700">${previewData.custom_data.event_venue_name}</p>
                    ${previewData.custom_data.event_venue_address ? `
                      <p class="text-gray-600 mt-2">${previewData.custom_data.event_venue_address}</p>
                    ` : ''}
                  </div>
                ` : ''}
                
                ${previewData.events && previewData.events.length > 0 ? `
                  <div class="border-t p-8">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Itinerario</h2>
                    <div class="space-y-4">
                      ${previewData.events.map(event => `
                        <div class="flex items-start gap-4">
                          <div class="text-purple-600 font-semibold">
                            ${new Date(event.event_datetime).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div>
                            <h3 class="font-medium text-gray-900">${event.event_name}</h3>
                            ${event.event_description ? `
                              <p class="text-gray-600 text-sm mt-1">${event.event_description}</p>
                            ` : ''}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                <div class="bg-purple-50 p-8 text-center">
                  <p class="text-purple-700 font-medium">
                    ¡Esperamos compartir este momento tan especial contigo!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-auto bg-gray-100 ${className}`}>
      {/* Device Frame */}
      <div
        ref={frameRef}
        className="absolute"
        style={{
          left: frameOffset.x,
          top: frameOffset.y,
          width: scaledWidth,
          height: scaledHeight,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          ...frameStyle
        }}
      >
        {/* Screen Content */}
        <div 
          className="relative w-full h-full overflow-hidden bg-white"
          style={{
            borderRadius: device.type === 'mobile' ? '28px' : device.type === 'tablet' ? '16px' : '6px'
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
                <p className="text-gray-600 mb-4">Unable to load preview</p>
                <Button onClick={handleRetry} size="sm" className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            srcDoc={generatePreviewHTML()}
            className="w-full h-full border-0"
            onLoad={handleIFrameLoad}
            onError={handleIFrameError}
            title={`Preview - ${device.name}`}
            sandbox="allow-same-origin allow-scripts allow-forms"
            style={{
              width: frameWidth,
              height: frameHeight,
              pointerEvents: enableInteraction ? 'auto' : 'none'
            }}
          />
        </div>
        
        {/* Device UI Elements */}
        {device.type === 'mobile' && (
          <>
            {/* Home Indicator (iPhone style) */}
            <div
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white bg-opacity-40 rounded-full"
            />
            
            {/* Status Bar */}
            <div className="absolute top-2 left-4 right-4 flex justify-between items-center text-xs text-white">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white bg-opacity-40 rounded-full"></div>
              </div>
              <div>9:41</div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-3/4 h-full bg-white rounded-sm"></div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {device.type === 'tablet' && (
          <>
            {/* Home Button */}
            <div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-300 rounded-full"
            />
          </>
        )}
        
        {device.type === 'desktop' && (
          <>
            {/* Browser Chrome */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 flex items-center px-3 rounded-t-lg">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1 ml-4 mr-2 bg-white rounded-sm px-2 py-1 text-xs text-gray-600">
                {previewData.preview_url}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Preview Cache */}
      <PreviewCache
        invitationId={previewData.invitation.id}
        previewData={previewData}
      />
    </div>
  );
}