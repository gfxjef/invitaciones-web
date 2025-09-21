/**
 * Love Story Section 1 - Interactive Carousel
 *
 * WHY: Tells the couple's love story through an engaging carousel interface
 * that allows users to navigate through different moments in their relationship.
 *
 * FEATURES:
 * - Interactive carousel with story moments
 * - Overlapping design with shadow effects
 * - Dot navigation for story selection
 * - Great Vibes font for romantic titles
 * - Responsive design with transform effects
 * - Customizable story moments data
 */

'use client';

import { useState } from 'react';

interface StoryMoment {
  date: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface Story1Props {
  sectionSubtitle?: string;
  sectionTitle?: string;
  storyMoments?: StoryMoment[];
}

export const Story1: React.FC<Story1Props> = ({
  sectionSubtitle = 'JEFFERSON & ROSMERY',
  sectionTitle = 'Nuestra Historia ♥',
  storyMoments = [
    {
      date: '20 DE JULIO, 2010',
      title: 'Asi Nos Conocimos',
      description: 'La primera vez que nos vimos, un instante que marcó el inicio de nuestra historia. Un encuentro lleno de emoción y destino, donde sin saberlo comenzaba el amor que cambiaría nuestras vidas.',
      imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4.jpg',
    },
    {
      date: '1 DE AGOSTO, 2016',
      title: 'Nuestra Primera Cita',
      description: 'Una noche maravillosa bajo las estrellas que marcó el inicio de nuestro camino juntos. La conversación fluyó tan fácil como el vino, y ambos supimos que aquello era algo especial y único.',
      imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/2.jpg',
    },
    {
      date: '25 DE JUNIO, 2022',
      title: 'La Propuesta',
      description: 'En un hermoso día, rodeados de naturaleza, llegó la pregunta que cambiaría nuestras vidas para siempre. Fue un momento de alegría pura, sorpresa y amor inmenso que atesoraremos por siempre.',
      imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1.jpg',
    },
  ]
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Safety check: ensure we have story moments and valid index
  const validStoryMoments = storyMoments && storyMoments.length > 0 ? storyMoments : [];
  const safeActiveIndex = validStoryMoments.length > 0 ? Math.min(activeIndex, validStoryMoments.length - 1) : 0;
  const activeMoment = validStoryMoments[safeActiveIndex];

  // If no story moments, show placeholder
  if (!activeMoment) {
    return (
      <section id="our-story" className="bg-white py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold">
              {sectionSubtitle}
            </p>
            <h3
              className="text-5xl md:text-6xl text-gray-800 mt-2"
              style={{ fontFamily: '"Great Vibes", cursive' }}
            >
              {sectionTitle}
            </h3>
            <p className="text-gray-500 mt-8">No story moments available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="our-story" className="bg-white py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Encabezado de la sección */}
        <div className="text-center mb-16">
          <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold font-montserrat">
            {sectionSubtitle}
          </p>
          <h3 className="text-5xl md:text-6xl text-gray-800 mt-2 font-great-vibes">
            {sectionTitle}
          </h3>
        </div>

        {/* Contenedor del Slider */}
        <div className="flex flex-col md:flex-row items-center justify-center min-h-[400px]">
          {/* Columna de la Imagen */}
          <div className="w-full md:w-3/5 h-[450px] overflow-hidden">
            <img
              src={activeMoment.imageUrl}
              alt={activeMoment.title}
              className="w-full h-full object-cover shadow-xl transition-opacity duration-500 ease-in-out"
            />
          </div>

          {/* Columna del Texto */}
          <div className="w-full md:w-3/5 bg-[#fdfaf6] p-8 md:p-12 shadow-xl relative z-10
                       transform md:-translate-x-16 -translate-y-10 md:translate-y-0">
            <p className="text-xs text-amber-700 tracking-[0.2em] font-semibold uppercase font-montserrat">
              {activeMoment.date}
            </p>
            <h4 className="text-4xl text-gray-700 my-3 font-great-vibes">
              {activeMoment.title}
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed font-montserrat">
              {activeMoment.description}
            </p>
          </div>
        </div>

        {/* Paginación / Navegación de Puntos */}
        <div className="flex justify-center space-x-3 mt-12">
          {validStoryMoments.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to story moment ${index + 1}`}
              className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out ${
                safeActiveIndex === index ? 'bg-amber-700 scale-110' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Story1DefaultProps = {
  sectionSubtitle: 'JEFFERSON & ROSMERY',
  sectionTitle: 'Nuestra Historia ♥',
  storyMoments: [
    {
      date: '20 DE JULIO, 2010',
      title: 'Asi Nos Conocimos',
      description: 'La primera vez que nos vimos, un instante que marcó el inicio de nuestra historia. Un encuentro lleno de emoción y destino, donde sin saberlo comenzaba el amor que cambiaría nuestras vidas.',
      imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/4.jpg',
    },
    {
      date: '1 DE AGOSTO, 2016',
      title: 'Nuestra Primera Cita',
      description: 'Una noche maravillosa bajo las estrellas que marcó el inicio de nuestro camino juntos. La conversación fluyó tan fácil como el vino, y ambos supimos que aquello era algo especial y único.',
      imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/2.jpg',
    },
    {
      date: '25 DE JUNIO, 2022',
      title: 'La Propuesta',
      description: 'En un hermoso día, rodeados de naturaleza, llegó la pregunta que cambiaría nuestras vidas para siempre. Fue un momento de alegría pura, sorpresa y amor inmenso que atesoraremos por siempre.',
      imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/1.jpg',
    },
  ]
};