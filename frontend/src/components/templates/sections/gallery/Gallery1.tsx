/**
 * Gallery Section 1 - Filterable Grid with Lightbox
 *
 * WHY: Displays wedding photos with category filtering and lightbox viewing
 * for an immersive photo gallery experience.
 */

'use client';

import { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';

interface GalleryImage {
  id: number;
  src?: string;
  url?: string;  // API uses 'url' instead of 'src'
  alt: string;
  category: string;
}

interface Gallery1Props {
  sectionSubtitle?: string;
  sectionTitle?: string;
  galleryImages?: GalleryImage[];
}

const ImageWithOverlay = ({ image, onClick }: {
  image: GalleryImage;
  onClick: () => void;
}) => (
  <div className="relative group cursor-pointer overflow-hidden w-full h-full" onClick={onClick}>
    <img
      src={image.src || image.url}
      alt={image.alt}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
      <ZoomIn className="text-white w-8 h-8" />
    </div>
  </div>
);

export const Gallery1: React.FC<Gallery1Props> = ({
  sectionSubtitle = 'Memorias',
  sectionTitle = 'Geleria de Novios',
  galleryImages = [
    { id: 1, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3-1.jpg', alt: 'Romantic couple moment', category: 'ceremony' },
    { id: 2, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3.jpg', alt: 'Beautiful wedding ceremony', category: 'ceremony' },
    { id: 3, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4-2.jpg', alt: 'Celebration moments', category: 'party' },
    { id: 4, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/5.jpg', alt: 'Wedding rings', category: 'ceremony' },
    { id: 5, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3-2.jpg', alt: 'Happy celebration', category: 'party' },
    { id: 6, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1-1.jpg', alt: 'Wedding decoration', category: 'ceremony' },
    { id: 7, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/3-1.jpg', alt: 'Party atmosphere', category: 'party' },
    { id: 8, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/2.jpg', alt: 'Beautiful wedding moment', category: 'ceremony' }
  ]
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  const openLightbox = (image: GalleryImage) => setLightboxImage(image);
  const closeLightbox = () => setLightboxImage(null);

  return (
    <>
      <section id="gallery" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold font-montserrat">
              {sectionSubtitle}
            </p>
            <h3 className="text-5xl md:text-6xl text-gray-800 mt-2 mb-8 font-great-vibes">
              {sectionTitle}
            </h3>
            <div className="flex justify-center space-x-2 md:space-x-4">
              {[
                { key: 'all', label: 'All' },
                { key: 'ceremony', label: 'Ceremony' },
                { key: 'party', label: 'Party' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedCategory(filter.key)}
                  className={`px-4 py-2 text-sm font-medium tracking-wider uppercase transition-colors duration-300 ${
                    selectedCategory === filter.key
                      ? 'text-amber-700 border-b-2 border-amber-700'
                      : 'text-gray-500 hover:text-amber-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Galería con diseño masonry ordenado */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]">
            {filteredImages.map((image, index) => {
              // Patrón: cada 5 imágenes, la segunda (índice 1, 6, 11...) es alta
              const isLargeImage = (index % 5) === 1;

              return (
                <div
                  key={image.id}
                  className={`relative overflow-hidden ${
                    isLargeImage ? 'md:row-span-2' : ''
                  }`}
                >
                  <ImageWithOverlay
                    image={image}
                    onClick={() => openLightbox(image)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.src || lightboxImage.url}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={closeLightbox}
              aria-label="Close lightbox"
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const Gallery1DefaultProps = {
  sectionSubtitle: 'Memorias',
  sectionTitle: 'Geleria de Novios',
  galleryImages: [
    { id: 1, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3-1.jpg', alt: 'Romantic couple moment', category: 'ceremony' },
    { id: 2, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3.jpg', alt: 'Beautiful wedding ceremony', category: 'ceremony' },
    { id: 3, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4-2.jpg', alt: 'Celebration moments', category: 'party' },
    { id: 4, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/5.jpg', alt: 'Wedding rings', category: 'ceremony' },
    { id: 5, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3-2.jpg', alt: 'Happy celebration', category: 'party' },
    { id: 6, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1-1.jpg', alt: 'Wedding decoration', category: 'ceremony' },
    { id: 7, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/3-1.jpg', alt: 'Party atmosphere', category: 'party' },
    { id: 8, src: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/2.jpg', alt: 'Beautiful wedding moment', category: 'ceremony' }
  ]
};