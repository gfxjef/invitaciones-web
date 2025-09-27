/**
 * Gallery Section 2 - Simple Responsive Grid
 *
 * WHY: Simple gallery without category filters, optimized for mobile viewing
 * with 2-column mobile layout and 3-column desktop with navigation.
 */

'use client';

import { useState } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  id: number;
  src?: string;
  url?: string;  // API uses 'url' instead of 'src'
  alt: string;
  category: string; // Mantener para compatibilidad pero no usar para filtrado
}

interface Gallery2Props {
  sectionSubtitle?: string;
  sectionTitle?: string;
  galleryImages?: GalleryImage[];
}

const ImageWithOverlay = ({ image, onClick }: {
  image: GalleryImage;
  onClick: () => void;
}) => (
  <div className="relative group cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300" onClick={onClick}>
    <img
      src={image.src || image.url}
      alt={image.alt}
      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
      <ZoomIn className="text-white w-6 h-6" />
    </div>
  </div>
);

export const Gallery2: React.FC<Gallery2Props> = ({
  sectionSubtitle = Gallery2DefaultProps.sectionSubtitle,
  sectionTitle = Gallery2DefaultProps.sectionTitle,
  galleryImages = Gallery2DefaultProps.galleryImages
}) => {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentMobilePage, setCurrentMobilePage] = useState(0);

  // Para desktop: mostrar 6 imágenes por página (2 filas x 3 columnas)
  const imagesPerPage = 6;
  const totalPages = Math.ceil(galleryImages.length / imagesPerPage);

  // Para móvil: mostrar 4 imágenes por página (2 filas x 2 columnas)
  const mobileImagesPerPage = 4;
  const totalMobilePages = Math.ceil(galleryImages.length / mobileImagesPerPage);

  const getCurrentPageImages = () => {
    const startIndex = currentPage * imagesPerPage;
    return galleryImages.slice(startIndex, startIndex + imagesPerPage);
  };

  const getCurrentMobilePageImages = () => {
    const startIndex = currentMobilePage * mobileImagesPerPage;
    return galleryImages.slice(startIndex, startIndex + mobileImagesPerPage);
  };

  const openLightbox = (image: GalleryImage) => setLightboxImage(image);
  const closeLightbox = () => setLightboxImage(null);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const nextMobilePage = () => {
    setCurrentMobilePage((prev) => (prev + 1) % totalMobilePages);
  };

  const prevMobilePage = () => {
    setCurrentMobilePage((prev) => (prev - 1 + totalMobilePages) % totalMobilePages);
  };

  return (
    <>
      <section id="gallery" className="pt-12 pb-16 md:pt-12 md:pb-24 px-2 bg-white" data-gallery="gallery2">
        <div className="container mx-auto max-w-7xl px-2">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold font-montserrat">
              {sectionSubtitle}
            </p>
            <h3 className="text-4xl md:text-5xl lg:text-6xl text-gray-800 mt-2 mb-8 font-great-vibes">
              {sectionTitle}
            </h3>
          </div>

          {/* Mobile Layout - 2 columnas, máximo 4 imágenes (2 filas) */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-1 auto-rows-[280px]">
              {getCurrentMobilePageImages().map((image) => (
                <ImageWithOverlay
                  key={image.id}
                  image={image}
                  onClick={() => openLightbox(image)}
                />
              ))}
            </div>

            {/* Mobile Navigation */}
            {totalMobilePages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                  onClick={prevMobilePage}
                  className="w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-amber-700 transition-all duration-300"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: totalMobilePages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMobilePage(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentMobilePage
                          ? 'bg-amber-700'
                          : 'bg-gray-300 hover:bg-amber-400'
                      }`}
                      aria-label={`Página ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextMobilePage}
                  className="w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-amber-700 transition-all duration-300"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Layout - 3 columnas con navegación */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Navigation Buttons */}
              {totalPages > 1 && (
                <>
                  <button
                    onClick={prevPage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-gray-600 hover:text-amber-700 transition-all duration-300"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-gray-600 hover:text-amber-700 transition-all duration-300"
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Images Grid */}
              <div className="grid grid-cols-3 gap-2 auto-rows-[280px]">
                {getCurrentPageImages().map((image) => (
                  <ImageWithOverlay
                    key={image.id}
                    image={image}
                    onClick={() => openLightbox(image)}
                  />
                ))}
              </div>

              {/* Page Indicators */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentPage
                          ? 'bg-amber-700'
                          : 'bg-gray-300 hover:bg-amber-400'
                      }`}
                      aria-label={`Página ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
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
              aria-label="Cerrar lightbox"
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const Gallery2DefaultProps = {
  sectionSubtitle: 'Memorias',
  sectionTitle: 'Geleria de Novios',
  galleryImages: [
    { id: 1, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3-1.jpg', alt: 'Romantic couple moment', category: 'ceremony' },
    { id: 2, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3.jpg', alt: 'Beautiful wedding ceremony', category: 'ceremony' },
    { id: 3, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4-2.jpg', alt: 'Celebration moments', category: 'party' },
    { id: 4, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/5.jpg', alt: 'Wedding rings', category: 'ceremony' },
    { id: 5, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/3-2.jpg', alt: 'Happy celebration', category: 'party' },
    { id: 6, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1-1.jpg', alt: 'Wedding decoration', category: 'ceremony' },
    { id: 7, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/3-1.jpg', alt: 'Party atmosphere', category: 'party' },
    { id: 8, url: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/2.jpg', alt: 'Beautiful wedding moment', category: 'ceremony' }
  ]
};