/**
 * GalleryManager Component
 * 
 * WHY: Provides comprehensive gallery management for wedding invitations including
 * hero image selection, photo gallery reordering, bulk operations, and preview
 * functionality. Essential for couples to organize their photos effectively.
 * 
 * WHAT: Advanced gallery interface with drag-and-drop reordering, image preview
 * modal, bulk selection, metadata editing, and layout theme options. Supports
 * hero image management and gallery organization.
 * 
 * HOW: Uses HTML5 drag-and-drop API for reordering, React state for optimistic
 * updates, and integrates with the invitation editor hooks for persistence.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon,
  Star,
  Eye,
  Edit2,
  Trash2,
  Download,
  MoreVertical,
  Grid3X3,
  Grid2X2,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Share2,
  RotateCw,
  Move,
  Check,
  AlertCircle
} from 'lucide-react';
import { useInvitationEditor } from '../../../lib/hooks/useInvitationEditor';
import { InvitationMedia } from '../../../types/invitation';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface GalleryManagerProps {
  /**
   * Invitation ID
   */
  invitationId: number;
  
  /**
   * Current gallery images
   */
  galleryImages: InvitationMedia[];
  
  /**
   * Current hero image
   */
  heroImage?: InvitationMedia;
  
  /**
   * Allow hero image selection from gallery
   */
  allowHeroSelection?: boolean;
  
  /**
   * Gallery layout options
   */
  layoutOptions?: Array<'grid' | 'masonry' | 'carousel' | 'slideshow'>;
  
  /**
   * Default layout
   */
  defaultLayout?: 'grid' | 'masonry' | 'carousel' | 'slideshow';
  
  /**
   * Maximum images in gallery
   */
  maxImages?: number;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Callback when images are reordered
   */
  onImagesReordered?: (newOrder: InvitationMedia[]) => void;
  
  /**
   * Callback when hero image is selected
   */
  onHeroImageSelected?: (image: InvitationMedia) => void;
  
  /**
   * Callback when images are deleted
   */
  onImagesDeleted?: (imageIds: number[]) => void;
  
  /**
   * Callback when image metadata is updated
   */
  onImageUpdated?: (imageId: number, metadata: { title?: string; description?: string }) => void;
}

interface ImageEditModal {
  image: InvitationMedia | null;
  isOpen: boolean;
}

interface BulkSelection {
  selectedIds: Set<number>;
  isActive: boolean;
}

/**
 * Gallery layout view types
 */
type ViewMode = 'grid-large' | 'grid-small' | 'list' | 'hero-focus';

/**
 * Comprehensive gallery management component
 */
export const GalleryManager: React.FC<GalleryManagerProps> = ({
  invitationId,
  galleryImages,
  heroImage,
  allowHeroSelection = true,
  layoutOptions = ['grid', 'masonry', 'carousel'],
  defaultLayout = 'grid',
  maxImages = 20,
  className,
  onImagesReordered,
  onHeroImageSelected,
  onImagesDeleted,
  onImageUpdated
}) => {
  // ================
  // STATE
  // ================
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid-large');
  const [selectedLayout, setSelectedLayout] = useState(defaultLayout);
  const [bulkSelection, setBulkSelection] = useState<BulkSelection>({
    selectedIds: new Set(),
    isActive: false
  });
  const [draggedImage, setDraggedImage] = useState<InvitationMedia | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewModal, setPreviewModal] = useState<{ image: InvitationMedia | null; index: number } | null>(null);
  const [editModal, setEditModal] = useState<ImageEditModal>({ image: null, isOpen: false });
  const [localImages, setLocalImages] = useState<InvitationMedia[]>(galleryImages);
  const [isReordering, setIsReordering] = useState(false);
  
  // ================
  // REFS
  // ================
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  
  // ================
  // HOOKS
  // ================
  
  const { deleteMedia, updateData } = useInvitationEditor(invitationId);
  
  // ================
  // EFFECTS
  // ================
  
  // Update local images when props change
  useEffect(() => {
    setLocalImages(galleryImages);
  }, [galleryImages]);
  
  // ================
  // DRAG AND DROP HANDLERS
  // ================
  
  const handleDragStart = useCallback((e: React.DragEvent, image: InvitationMedia, index: number) => {
    setDraggedImage(image);
    setIsReordering(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);
  
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedImage(null);
    setDragOverIndex(null);
    setIsReordering(false);
    
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(targetIndex);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverIndex(null);
    
    if (!draggedImage) return;
    
    const dragIndex = localImages.findIndex(img => img.id === draggedImage.id);
    if (dragIndex === -1 || dragIndex === dropIndex) return;
    
    // Reorder images
    const newImages = [...localImages];
    const [removedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, removedImage);
    
    // Update display order
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      display_order: index
    }));
    
    setLocalImages(updatedImages);
    
    // Notify parent
    if (onImagesReordered) {
      onImagesReordered(updatedImages);
    }
  }, [draggedImage, localImages, onImagesReordered]);
  
  // ================
  // SELECTION HANDLERS
  // ================
  
  const toggleBulkSelection = useCallback(() => {
    setBulkSelection(prev => ({
      selectedIds: new Set(),
      isActive: !prev.isActive
    }));
  }, []);
  
  const toggleImageSelection = useCallback((imageId: number) => {
    setBulkSelection(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(imageId)) {
        newSelectedIds.delete(imageId);
      } else {
        newSelectedIds.add(imageId);
      }
      return {
        ...prev,
        selectedIds: newSelectedIds
      };
    });
  }, []);
  
  const selectAllImages = useCallback(() => {
    setBulkSelection(prev => ({
      ...prev,
      selectedIds: new Set(localImages.map(img => img.id!).filter(Boolean))
    }));
  }, [localImages]);
  
  const clearSelection = useCallback(() => {
    setBulkSelection(prev => ({
      ...prev,
      selectedIds: new Set()
    }));
  }, []);
  
  // ================
  // ACTION HANDLERS
  // ================
  
  const handleSetHeroImage = useCallback(async (image: InvitationMedia) => {
    try {
      if (onHeroImageSelected) {
        onHeroImageSelected(image);
      }
      
      // Update via editor hook
      updateData({
        gallery_hero_image: image.file_path
      });
      
    } catch (error) {
      console.error('Error setting hero image:', error);
    }
  }, [onHeroImageSelected, updateData]);
  
  const handleDeleteImage = useCallback(async (imageId: number) => {
    try {
      await deleteMedia(imageId);
      setLocalImages(prev => prev.filter(img => img.id !== imageId));
      
      if (onImagesDeleted) {
        onImagesDeleted([imageId]);
      }
      
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }, [deleteMedia, onImagesDeleted]);
  
  const handleBulkDelete = useCallback(async () => {
    try {
      const idsToDelete = Array.from(bulkSelection.selectedIds);
      
      // Delete all selected images
      await Promise.all(idsToDelete.map(id => deleteMedia(id)));
      
      // Update local state
      setLocalImages(prev => prev.filter(img => !bulkSelection.selectedIds.has(img.id!)));
      
      // Clear selection
      clearSelection();
      
      if (onImagesDeleted) {
        onImagesDeleted(idsToDelete);
      }
      
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  }, [bulkSelection.selectedIds, deleteMedia, clearSelection, onImagesDeleted]);
  
  const handleDownloadImage = useCallback((image: InvitationMedia) => {
    // Create download link
    const a = document.createElement('a');
    a.href = image.file_path;
    a.download = `image-${image.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);
  
  const handleBulkDownload = useCallback(() => {
    const selectedImages = localImages.filter(img => bulkSelection.selectedIds.has(img.id!));
    selectedImages.forEach(image => handleDownloadImage(image));
  }, [localImages, bulkSelection.selectedIds, handleDownloadImage]);
  
  // ================
  // PREVIEW HANDLERS
  // ================
  
  const openPreview = useCallback((image: InvitationMedia, index: number) => {
    setPreviewModal({ image, index });
  }, []);
  
  const closePreview = useCallback(() => {
    setPreviewModal(null);
  }, []);
  
  const navigatePreview = useCallback((direction: 'prev' | 'next') => {
    if (!previewModal) return;
    
    const currentIndex = previewModal.index;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : localImages.length - 1;
    } else {
      newIndex = currentIndex < localImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setPreviewModal({
      image: localImages[newIndex],
      index: newIndex
    });
  }, [previewModal, localImages]);
  
  // ================
  // EDIT HANDLERS
  // ================
  
  const openEditModal = useCallback((image: InvitationMedia) => {
    setEditModal({ image, isOpen: true });
  }, []);
  
  const closeEditModal = useCallback(() => {
    setEditModal({ image: null, isOpen: false });
  }, []);
  
  const handleUpdateImage = useCallback(async (metadata: { title?: string; description?: string }) => {
    if (!editModal.image?.id) return;
    
    try {
      if (onImageUpdated) {
        onImageUpdated(editModal.image.id, metadata);
      }
      
      closeEditModal();
    } catch (error) {
      console.error('Error updating image:', error);
    }
  }, [editModal.image, onImageUpdated, closeEditModal]);
  
  // ================
  // RENDER HELPERS
  // ================
  
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
      {/* View controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-lg p-1 bg-white">
          <Button
            variant={viewMode === 'grid-large' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid-large')}
            className="h-8 w-8 p-0"
            title="Vista grid grande"
          >
            <Grid2X2 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid-small' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid-small')}
            className="h-8 w-8 p-0"
            title="Vista grid pequeña"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
            title="Vista lista"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'hero-focus' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('hero-focus')}
            className="h-8 w-8 p-0"
            title="Enfoque hero"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {localImages.length} de {maxImages} imágenes
        </div>
      </div>
      
      {/* Action controls */}
      <div className="flex items-center gap-2">
        {bulkSelection.isActive && (
          <>
            <span className="text-sm text-gray-600">
              {bulkSelection.selectedIds.size} seleccionadas
            </span>
            {bulkSelection.selectedIds.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                  title="Descargar seleccionadas"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Descargar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  title="Eliminar seleccionadas"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllImages}
              disabled={bulkSelection.selectedIds.size === localImages.length}
            >
              Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={bulkSelection.selectedIds.size === 0}
            >
              Ninguna
            </Button>
          </>
        )}
        
        <Button
          variant={bulkSelection.isActive ? 'default' : 'outline'}
          size="sm"
          onClick={toggleBulkSelection}
        >
          {bulkSelection.isActive ? 'Cancelar' : 'Seleccionar'}
        </Button>
      </div>
    </div>
  );
  
  const renderImageCard = (image: InvitationMedia, index: number) => {
    const isSelected = bulkSelection.selectedIds.has(image.id!);
    const isHero = heroImage?.id === image.id;
    const isDraggedOver = dragOverIndex === index && draggedImage?.id !== image.id;
    
    const cardClass = cn(
      "relative group cursor-pointer transition-all duration-200 bg-white rounded-lg overflow-hidden border-2",
      isSelected && "ring-2 ring-primary border-primary",
      isDraggedOver && "ring-2 ring-blue-400 border-blue-400 scale-105",
      isHero && "ring-2 ring-yellow-400 border-yellow-400",
      viewMode === 'grid-large' && "aspect-square",
      viewMode === 'grid-small' && "aspect-square",
      viewMode === 'list' && "aspect-video"
    );
    
    return (
      <div
        key={image.id}
        className={cardClass}
        draggable
        onDragStart={(e) => handleDragStart(e, image, index)}
        onDragEnd={handleDragEnd}
        onDragEnter={(e) => handleDragEnter(e, index)}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        onClick={(e) => {
          if (bulkSelection.isActive) {
            e.preventDefault();
            toggleImageSelection(image.id!);
          } else {
            openPreview(image, index);
          }
        }}
      >
        {/* Image */}
        <img
          src={image.file_path}
          alt={`Gallery image ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
          {/* Selection checkbox */}
          {bulkSelection.isActive && (
            <div className="absolute top-2 left-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                isSelected ? "bg-primary text-white" : "bg-white/80 text-gray-600"
              )}>
                {isSelected && <Check className="w-4 h-4" />}
              </div>
            </div>
          )}
          
          {/* Hero badge */}
          {isHero && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Hero
            </div>
          )}
          
          {/* Drag handle */}
          {isReordering && draggedImage?.id === image.id && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 text-white p-2 rounded-full">
                <Move className="w-6 h-6" />
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          {!bulkSelection.isActive && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(image, index);
                  }}
                  className="bg-white/90 text-gray-700 hover:bg-white"
                  title="Ver imagen"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                {allowHeroSelection && !isHero && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetHeroImage(image);
                    }}
                    className="bg-white/90 text-gray-700 hover:bg-white"
                    title="Establecer como hero"
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(image);
                  }}
                  className="bg-white/90 text-gray-700 hover:bg-white"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (image.id && confirm('¿Estás seguro de eliminar esta imagen?')) {
                      handleDeleteImage(image.id);
                    }
                  }}
                  className="bg-red-500/90 hover:bg-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* File info */}
        {viewMode === 'list' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
            <div className="text-sm font-medium truncate">
              {image.file_path.split('/').pop()}
            </div>
            {image.file_size && (
              <div className="text-xs opacity-80">
                {(image.file_size / 1024 / 1024).toFixed(1)} MB
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderGalleryGrid = () => {
    if (localImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <ImageIcon className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium mb-2">No hay imágenes en la galería</p>
          <p className="text-sm">Sube imágenes para comenzar a crear tu galería</p>
        </div>
      );
    }
    
    const gridClass = cn(
      "grid gap-4 p-4",
      viewMode === 'grid-large' && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      viewMode === 'grid-small' && "grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
      viewMode === 'list' && "grid-cols-1 md:grid-cols-2",
      viewMode === 'hero-focus' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    );
    
    return (
      <div className={gridClass}>
        {localImages.map((image, index) => renderImageCard(image, index))}
      </div>
    );
  };
  
  const renderPreviewModal = () => {
    if (!previewModal) return null;
    
    const { image, index } = previewModal;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={closePreview}
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
        
        {/* Navigation */}
        {localImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigatePreview('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigatePreview('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </>
        )}
        
        {/* Image */}
        <div className="max-w-4xl max-h-[80vh] mx-4">
          <img
            src={image.file_path}
            alt={`Gallery image ${index + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        {/* Info bar */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                {image.file_path.split('/').pop()}
              </div>
              <div className="text-sm opacity-80">
                {index + 1} de {localImages.length}
                {image.file_size && ` • ${(image.file_size / 1024 / 1024).toFixed(1)} MB`}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {allowHeroSelection && heroImage?.id !== image.id && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSetHeroImage(image)}
                  className="bg-white/90 text-gray-700 hover:bg-white"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Hero
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadImage(image)}
                className="bg-white/90 text-gray-700 hover:bg-white"
              >
                <Download className="w-4 h-4 mr-1" />
                Descargar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // ================
  // RENDER
  // ================
  
  return (
    <div className={cn("bg-white rounded-lg border shadow-sm", className)}>
      {/* Toolbar */}
      {renderToolbar()}
      
      {/* Gallery grid */}
      <div ref={galleryRef} className="min-h-[400px]">
        {renderGalleryGrid()}
      </div>
      
      {/* Preview modal */}
      {renderPreviewModal()}
    </div>
  );
};

export default GalleryManager;