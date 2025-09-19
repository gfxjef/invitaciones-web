/**
 * ImagePreviewModal Component
 * 
 * WHY: Provides a full-screen image viewer with navigation, zoom, rotation,
 * and metadata editing capabilities. Essential for reviewing and editing
 * gallery images with enhanced user experience.
 * 
 * WHAT: Modal component with image zoom/pan, keyboard navigation, image
 * rotation, metadata display/editing, and social sharing options.
 * Supports touch gestures for mobile devices.
 * 
 * HOW: Uses CSS transforms for zoom/pan, keyboard event listeners for
 * navigation, and integrates with the gallery management system for
 * seamless image operations.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Star,
  Edit2,
  Trash2,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { InvitationMedia } from '../../../types/invitation';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface ImagePreviewModalProps {
  /**
   * Current image being viewed
   */
  image: InvitationMedia | null;
  
  /**
   * Current image index in the gallery
   */
  currentIndex: number;
  
  /**
   * All images in the gallery
   */
  images: InvitationMedia[];
  
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Current hero image
   */
  heroImage?: InvitationMedia;
  
  /**
   * Allow hero image selection
   */
  allowHeroSelection?: boolean;
  
  /**
   * Allow image editing
   */
  allowEdit?: boolean;
  
  /**
   * Allow image deletion
   */
  allowDelete?: boolean;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Callback to close the modal
   */
  onClose: () => void;
  
  /**
   * Callback when navigating to different image
   */
  onNavigate: (direction: 'prev' | 'next') => void;
  
  /**
   * Callback when image is set as hero
   */
  onSetHero?: (image: InvitationMedia) => void;
  
  /**
   * Callback when image is deleted
   */
  onDelete?: (imageId: number) => void;
  
  /**
   * Callback when image is downloaded
   */
  onDownload?: (image: InvitationMedia) => void;
  
  /**
   * Callback when image metadata is edited
   */
  onEdit?: (image: InvitationMedia) => void;
  
  /**
   * Callback when image is shared
   */
  onShare?: (image: InvitationMedia) => void;
}

interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

interface TouchState {
  initialDistance: number;
  initialScale: number;
  lastTap: number;
}

/**
 * Full-featured image preview modal with zoom and navigation
 */
export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  currentIndex,
  images,
  isOpen,
  heroImage,
  allowHeroSelection = true,
  allowEdit = true,
  allowDelete = true,
  className,
  onClose,
  onNavigate,
  onSetHero,
  onDelete,
  onDownload,
  onEdit,
  onShare
}) => {
  // ================
  // STATE
  // ================
  
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchState, setTouchState] = useState<TouchState>({
    initialDistance: 0,
    initialScale: 1,
    lastTap: 0
  });
  
  // ================
  // REFS
  // ================
  
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ================
  // COMPUTED VALUES
  // ================
  
  const isHero = heroImage?.id === image?.id;
  const canNavigate = images.length > 1;
  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;
  
  // ================
  // ZOOM CONTROLS
  // ================
  
  const resetZoom = useCallback(() => {
    setZoom({ scale: 1, x: 0, y: 0 });
    setRotation(0);
  }, []);
  
  const zoomIn = useCallback(() => {
    setZoom(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.5, 5)
    }));
  }, []);
  
  const zoomOut = useCallback(() => {
    setZoom(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.5, 0.5)
    }));
  }, []);
  
  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);
  
  // ================
  // MOUSE HANDLERS
  // ================
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom.scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - zoom.x, y: e.clientY - zoom.y });
    }
  }, [zoom]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom.scale > 1) {
      setZoom(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  }, [isDragging, dragStart, zoom.scale]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, [zoomIn, zoomOut]);
  
  const handleDoubleClick = useCallback(() => {
    if (zoom.scale === 1) {
      setZoom({ scale: 2, x: 0, y: 0 });
    } else {
      resetZoom();
    }
  }, [zoom.scale, resetZoom]);
  
  // ================
  // TOUCH HANDLERS
  // ================
  
  const getTouchDistance = (touches: React.TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = getTouchDistance(e.touches);
      setTouchState(prev => ({
        ...prev,
        initialDistance: distance,
        initialScale: zoom.scale
      }));
    } else if (e.touches.length === 1) {
      // Single touch - check for double tap
      const currentTime = Date.now();
      const tapLength = currentTime - touchState.lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        // Double tap
        handleDoubleClick();
      }
      
      setTouchState(prev => ({
        ...prev,
        lastTap: currentTime
      }));
      
      // Start drag if zoomed
      if (zoom.scale > 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - zoom.x, y: touch.clientY - zoom.y });
      }
    }
  }, [zoom, touchState.lastTap, handleDoubleClick]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = getTouchDistance(e.touches);
      const scale = (distance / touchState.initialDistance) * touchState.initialScale;
      
      setZoom(prev => ({
        ...prev,
        scale: Math.max(0.5, Math.min(5, scale))
      }));
    } else if (e.touches.length === 1 && isDragging && zoom.scale > 1) {
      // Drag if zoomed
      const touch = e.touches[0];
      setZoom(prev => ({
        ...prev,
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      }));
    }
  }, [isDragging, dragStart, zoom.scale, touchState]);
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // ================
  // KEYBOARD HANDLERS
  // ================
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (canNavigate && hasPrev) {
          onNavigate('prev');
        }
        break;
      case 'ArrowRight':
        if (canNavigate && hasNext) {
          onNavigate('next');
        }
        break;
      case '+':
      case '=':
        zoomIn();
        break;
      case '-':
        zoomOut();
        break;
      case '0':
        resetZoom();
        break;
      case 'r':
      case 'R':
        rotate();
        break;
      case 'i':
      case 'I':
        setShowInfo(!showInfo);
        break;
      case 'f':
      case 'F':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          modalRef.current?.requestFullscreen();
        }
        break;
    }
  }, [isOpen, canNavigate, hasPrev, hasNext, showInfo, onClose, onNavigate, zoomIn, zoomOut, resetZoom, rotate]);
  
  // ================
  // ACTION HANDLERS
  // ================
  
  const handleDownload = useCallback(() => {
    if (!image) return;
    
    if (onDownload) {
      onDownload(image);
    } else {
      // Default download behavior
      const a = document.createElement('a');
      a.href = image.file_path;
      a.download = `image-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [image, onDownload]);
  
  const handleShare = useCallback(async () => {
    if (!image) return;
    
    if (onShare) {
      onShare(image);
    } else if (navigator.share) {
      // Use native share API if available
      try {
        await navigator.share({
          title: 'Imagen de galería',
          text: 'Mira esta imagen de nuestra galería',
          url: image.file_path
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(image.file_path);
        // Could show a toast notification here
        console.log('Image URL copied to clipboard');
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  }, [image, onShare]);
  
  const handleSetHero = useCallback(() => {
    if (image && onSetHero) {
      onSetHero(image);
    }
  }, [image, onSetHero]);
  
  const handleDelete = useCallback(() => {
    if (image?.id && onDelete && confirm('¿Estás seguro de eliminar esta imagen?')) {
      onDelete(image.id);
      onClose();
    }
  }, [image, onDelete, onClose]);
  
  const handleEdit = useCallback(() => {
    if (image && onEdit) {
      onEdit(image);
    }
  }, [image, onEdit]);
  
  // ================
  // EFFECTS
  // ================
  
  // Reset zoom when image changes
  useEffect(() => {
    resetZoom();
  }, [image?.id, resetZoom]);
  
  // Keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);
  
  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);
  
  // ================
  // RENDER
  // ================
  
  if (!isOpen || !image) {
    return null;
  }
  
  return (
    <div
      ref={modalRef}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/95",
        "transition-opacity duration-300",
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        {/* Left controls */}
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm font-medium">
            {currentIndex + 1} de {images.length}
          </span>
          {image.file_size && (
            <span className="text-xs opacity-80">
              {(image.file_size / 1024 / 1024).toFixed(1)} MB
            </span>
          )}
          {isHero && (
            <div className="bg-yellow-500 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Hero
            </div>
          )}
        </div>
        
        {/* Right controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="text-white hover:bg-white/20"
            title="Información (I)"
          >
            <Info className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                modalRef.current?.requestFullscreen();
              }
            }}
            className="text-white hover:bg-white/20"
            title="Pantalla completa (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Navigation arrows */}
      {canNavigate && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('prev')}
            disabled={!hasPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 disabled:opacity-30"
            title="Anterior (←)"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('next')}
            disabled={!hasNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 disabled:opacity-30"
            title="Siguiente (→)"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}
      
      {/* Image container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={image.file_path}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
          style={{
            transform: `
              translate(${zoom.x}px, ${zoom.y}px) 
              scale(${zoom.scale}) 
              rotate(${rotation}deg)
            `
          }}
          draggable={false}
        />
      </div>
      
      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={zoom.scale <= 0.5}
              className="text-white hover:bg-white/20 disabled:opacity-30"
              title="Alejar (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-white text-sm min-w-[50px] text-center">
              {Math.round(zoom.scale * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={zoom.scale >= 5}
              className="text-white hover:bg-white/20 disabled:opacity-30"
              title="Acercar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={rotate}
              className="text-white hover:bg-white/20"
              title="Rotar (R)"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              disabled={zoom.scale === 1 && rotation === 0}
              className="text-white hover:bg-white/20 disabled:opacity-30 text-xs"
              title="Restablecer (0)"
            >
              Restablecer
            </Button>
          </div>
          
          {/* Action controls */}
          <div className="flex items-center gap-2">
            {allowHeroSelection && !isHero && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSetHero}
                className="bg-white/90 text-gray-700 hover:bg-white"
                title="Establecer como hero"
              >
                <Star className="w-4 h-4 mr-1" />
                Hero
              </Button>
            )}
            
            {allowEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEdit}
                className="bg-white/90 text-gray-700 hover:bg-white"
                title="Editar imagen"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="bg-white/90 text-gray-700 hover:bg-white"
              title="Descargar"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="bg-white/90 text-gray-700 hover:bg-white"
              title="Compartir"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Compartir
            </Button>
            
            {allowDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="bg-red-500/90 hover:bg-red-600"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-16 right-4 bg-black/80 text-white p-4 rounded-lg max-w-sm">
          <h3 className="font-medium mb-2">Información de la imagen</h3>
          <div className="text-sm space-y-1">
            <div><strong>Archivo:</strong> {image.file_path.split('/').pop()}</div>
            {image.file_size && (
              <div><strong>Tamaño:</strong> {(image.file_size / 1024 / 1024).toFixed(1)} MB</div>
            )}
            {image.mime_type && (
              <div><strong>Tipo:</strong> {image.mime_type}</div>
            )}
            {image.created_at && (
              <div><strong>Subida:</strong> {new Date(image.created_at).toLocaleDateString()}</div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/20">
            <h4 className="font-medium mb-1">Controles:</h4>
            <div className="text-xs space-y-1 opacity-80">
              <div>← → : Navegar</div>
              <div>+ - : Zoom</div>
              <div>R : Rotar</div>
              <div>F : Pantalla completa</div>
              <div>Esc : Cerrar</div>
              <div>Doble clic : Zoom</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreviewModal;