/**
 * Video Story Section 1 - Lightbox Modal
 *
 * WHY: Allows couples to share their love story through video with an elegant
 * modal lightbox interface that doesn't disrupt the page flow.
 */

'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface Video1Props {
  backgroundImageUrl?: string;
  videoEmbedUrl?: string;
  preTitle?: string;
  title?: string;
}

export const Video1: React.FC<Video1Props> = ({
  backgroundImageUrl = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/3-1.jpg',
  videoEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  preTitle = 'INCIO NUESTRA HISTORIA',
  title = 'Mira nuestra Historia de Amor'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <section
        className="relative h-[60vh] min-h-[400px] flex flex-col items-center justify-center text-white text-center px-6"
        style={{
          backgroundImage: `url('${backgroundImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center">
          <p className="tracking-[0.3em] text-sm font-light uppercase font-montserrat">
            {preTitle}
          </p>
          <h2 className="text-5xl md:text-6xl my-4 font-great-vibes">
            {title}
          </h2>
          <button
            onClick={openModal}
            aria-label="Play video"
            className="relative flex items-center justify-center w-24 h-24 mt-6 mx-auto group"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/40 transition-transform duration-300 group-hover:scale-110"></div>
            <div className="absolute inset-2 rounded-full bg-white/90 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"></div>
            <Play
              className="relative z-10 text-amber-800 transition-transform duration-300 group-hover:scale-110"
              size={32}
              fill="currentColor"
            />
          </button>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close video player"
              className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <iframe
              src={videoEmbedUrl + '?autoplay=1'}
              title="Our Love Story Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export const Video1DefaultProps = {
  backgroundImageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/3-1.jpg',
  videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  preTitle: 'INCIO NUESTRA HISTORIA',
  title: 'Mira nuestra Historia de Amor'
};