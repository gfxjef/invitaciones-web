/**
 * Gallery Setup Step Component
 * 
 * WHY: Fourth step that enables users to upload and manage photos for
 * their invitation. The gallery is crucial for personalizing the
 * invitation and creating emotional connection with guests.
 * 
 * WHAT: Photo upload and management interface with drag-and-drop,
 * hero image selection, gallery organization, and image optimization.
 * Supports multiple formats and provides image cropping capabilities.
 * 
 * HOW: Uses the file upload system from editor hooks, implements
 * drag-and-drop with visual feedback, and provides image preview
 * and organization tools.
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Star, 
  Trash2, 
  Eye,
  Move,
  Camera,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardStep, StepSection, StepField } from '../WizardStep';
import { WizardStepProps } from '../InvitationWizard';
import { useFileUpload } from '@/lib/hooks/useFileUpload';

interface GalleryImage {
  id: string;
  file: File | null;
  url: string;
  name: string;
  size: number;
  isHero: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
}

export const GallerySetupStep: React.FC<WizardStepProps> = ({
  data,
  errors,
  onUpdate,
  onNext,
  onBack,
  isValid,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState<GalleryImage | null>(null);

  const { uploadFile } = useFileUpload();

  const handleFileSelect = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    const newImages: GalleryImage[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      isHero: images.length === 0 && !data.gallery_hero_image, // First image becomes hero if none exists
      isUploading: false,
      uploadProgress: 0
    }));

    setImages(prev => [...prev, ...newImages]);

    // Set hero image if this is the first image
    if (newImages.length > 0 && !data.gallery_hero_image) {
      onUpdate('gallery', 'gallery_hero_image', newImages[0].url);
    }
  }, [images.length, data.gallery_hero_image, onUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelect(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleSetHero = useCallback((imageId: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isHero: img.id === imageId
    })));
    
    const heroImage = images.find(img => img.id === imageId);
    if (heroImage) {
      onUpdate('gallery', 'gallery_hero_image', heroImage.url);
    }
  }, [images, onUpdate]);

  const handleRemoveImage = useCallback((imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove?.isHero && images.length > 1) {
      // If removing hero image, set the first remaining image as hero
      const remainingImages = images.filter(img => img.id !== imageId);
      if (remainingImages.length > 0) {
        handleSetHero(remainingImages[0].id);
      } else {
        onUpdate('gallery', 'gallery_hero_image', '');
      }
    }
    
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    // Clean up object URL
    if (imageToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
  }, [images, handleSetHero, onUpdate]);

  const handleReorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return newImages;
    });
  }, []);

  const handleContinue = () => {
    if (images.length > 0 && images.some(img => img.isHero)) {
      onNext();
    }
  };

  const hasHeroImage = images.some(img => img.isHero);
  const canContinue = images.length > 0 && hasHeroImage;

  return (
    <WizardStep isLoading={isLoading}>
      <div className="space-y-8">
        {/* Upload Area */}
        <StepSection 
          title="Sube tus Fotos"
          description="Agrega las fotos que aparecerán en tu invitación. La primera será tu imagen principal."
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDragOver ? 'bg-purple-600' : 'bg-gray-400'
                } text-white`}>
                  <Upload className="w-8 h-8" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragOver ? 'Suelta las imágenes aquí' : 'Arrastra y suelta tus fotos'}
                </h3>
                <p className="text-gray-600 mb-4">
                  o haz clic para seleccionar archivos
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mx-auto"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Seleccionar Fotos
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Formatos: JPG, PNG, WEBP • Máximo 10MB por imagen</p>
                <p>Recomendado: Mínimo 1200x800px para mejor calidad</p>
              </div>
            </div>
          </div>
        </StepSection>

        {/* Gallery Management */}
        {images.length > 0 && (
          <StepSection 
            title="Tu Galería"
            description="Organiza tus fotos y selecciona la imagen principal"
          >
            {/* Hero Image Selection */}
            {!hasHeroImage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      Selecciona una imagen principal
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Haz clic en la estrella de una imagen para establecerla como imagen principal.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onSetHero={() => handleSetHero(image.id)}
                  onRemove={() => handleRemoveImage(image.id)}
                  onPreview={() => setShowPreview(image)}
                  onReorder={handleReorderImages}
                />
              ))}
              
              {/* Add More Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Agregar más</span>
              </div>
            </div>

            {/* Gallery Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>{images.length} imagen{images.length !== 1 ? 'es' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{hasHeroImage ? 'Imagen principal seleccionada' : 'Sin imagen principal'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${canContinue ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={canContinue ? 'text-green-600' : ''}>
                  {canContinue ? 'Listo para continuar' : 'Se requiere al menos una imagen'}
                </span>
              </div>
            </div>
          </StepSection>
        )}

        {/* Preview */}
        {hasHeroImage && (
          <StepSection 
            title="Vista Previa"
            description="Así se verá tu imagen principal en la invitación"
          >
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="max-w-md mx-auto">
                {images.filter(img => img.isHero).map(heroImage => (
                  <div key={heroImage.id} className="relative">
                    <img
                      src={heroImage.url}
                      alt="Imagen principal"
                      className="w-full aspect-[4/3] object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-600 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Principal
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </StepSection>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Detalles del evento
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`px-8 py-2 rounded-lg font-medium transition-colors ${
              canContinue
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continuar →
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && (
        <ImagePreviewModal
          image={showPreview}
          onClose={() => setShowPreview(null)}
        />
      )}
    </WizardStep>
  );
};

// Image Card Component
interface ImageCardProps {
  image: GalleryImage;
  index: number;
  onSetHero: () => void;
  onRemove: () => void;
  onPreview: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  onSetHero,
  onRemove,
  onPreview
}) => {
  return (
    <div className={`relative group aspect-square rounded-lg overflow-hidden ${
      image.isHero ? 'ring-2 ring-purple-600 ring-offset-2' : ''
    }`}>
      {/* Image */}
      <img
        src={image.url}
        alt={image.name}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      
      {/* Loading Overlay */}
      {image.isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-sm">{image.uploadProgress}%</span>
          </div>
        </div>
      )}
      
      {/* Hero Badge */}
      {image.isHero && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-purple-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            Principal
          </Badge>
        </div>
      )}
      
      {/* Actions Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onSetHero}
            className={`p-1 rounded transition-colors ${
              image.isHero 
                ? 'bg-purple-600 text-white' 
                : 'bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100'
            }`}
            title={image.isHero ? 'Imagen principal' : 'Establecer como principal'}
          >
            <Star className="w-4 h-4" />
          </button>
          
          <button
            onClick={onPreview}
            className="p-1 bg-white bg-opacity-80 text-gray-700 rounded hover:bg-opacity-100 transition-colors"
            title="Vista previa"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRemove}
            className="p-1 bg-red-600 bg-opacity-80 text-white rounded hover:bg-opacity-100 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* File Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="truncate">{image.name}</div>
        <div>{(image.size / 1024 / 1024).toFixed(1)} MB</div>
      </div>
    </div>
  );
};

// Image Preview Modal Component
interface ImagePreviewModalProps {
  image: GalleryImage;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        <img
          src={image.url}
          alt={image.name}
          className="max-w-full max-h-full object-contain"
        />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
        >
          <span className="text-2xl">×</span>
        </button>
        
        <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 rounded-lg p-3">
          <div className="font-medium">{image.name}</div>
          <div className="text-sm opacity-75">
            {(image.size / 1024 / 1024).toFixed(1)} MB
            {image.isHero && ' • Imagen Principal'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySetupStep;