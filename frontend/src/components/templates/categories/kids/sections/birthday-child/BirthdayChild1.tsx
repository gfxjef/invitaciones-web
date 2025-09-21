/**
 * Birthday Child Section 1
 *
 * WHY: Section showcasing the birthday child with fun facts,
 * photos, and playful information about their favorite things.
 */

'use client';

import React from 'react';

export interface BirthdayChild1Props {
  // Child details
  childName?: string;
  childNickname?: string;
  age?: number;
  birthdayMessage?: string;

  // Child info
  favoriteColor?: string;
  favoriteToy?: string;
  favoriteFood?: string;
  hobbyOrInterest?: string;

  // Visual elements
  childPhotoUrl?: string;
  backgroundColor?: string;
  accentColor?: string;

  // Configuration
  isPreview?: boolean;
  className?: string;
}

export const BirthdayChild1DefaultProps: BirthdayChild1Props = {
  childName: 'Sofia Isabella',
  childNickname: 'Sofi',
  age: 5,
  birthdayMessage: '¡Nuestra princesa está creciendo! Un año más de alegría, risas y aventuras.',
  favoriteColor: 'Rosa',
  favoriteToy: 'Muñecas Princesas',
  favoriteFood: 'Helado de Chocolate',
  hobbyOrInterest: 'Bailar y Dibujar',
  childPhotoUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
  backgroundColor: '#FFF0F5',
  accentColor: '#FF69B4',
};

export const BirthdayChild1: React.FC<BirthdayChild1Props> = ({
  childName = BirthdayChild1DefaultProps.childName,
  childNickname = BirthdayChild1DefaultProps.childNickname,
  age = BirthdayChild1DefaultProps.age,
  birthdayMessage = BirthdayChild1DefaultProps.birthdayMessage,
  favoriteColor = BirthdayChild1DefaultProps.favoriteColor,
  favoriteToy = BirthdayChild1DefaultProps.favoriteToy,
  favoriteFood = BirthdayChild1DefaultProps.favoriteFood,
  hobbyOrInterest = BirthdayChild1DefaultProps.hobbyOrInterest,
  childPhotoUrl = BirthdayChild1DefaultProps.childPhotoUrl,
  backgroundColor = BirthdayChild1DefaultProps.backgroundColor,
  accentColor = BirthdayChild1DefaultProps.accentColor,
  isPreview = false,
  className = '',
}) => {
  return (
    <section
      className={`py-16 px-6 ${className}`}
      style={{ backgroundColor }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: accentColor }}>
            Conoce a nuestra estrella ⭐
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: accentColor }} />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Child Photo */}
          <div className="relative">
            <div className="relative mx-auto w-80 h-80 rounded-full overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={childPhotoUrl}
                alt={`${childName} - ${age} años`}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 text-6xl animate-bounce">🎈</div>
            <div className="absolute -bottom-4 -left-4 text-6xl animate-pulse">🎂</div>
          </div>

          {/* Child Information */}
          <div className="space-y-8">
            {/* Name and Age */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {childName}
              </h3>
              <p className="text-xl text-gray-600 mb-4">
                También conocida como "{childNickname}"
              </p>
              <div
                className="inline-block px-6 py-3 rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {age} años de pura diversión
              </div>
            </div>

            {/* Birthday Message */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4" style={{ borderColor: accentColor }}>
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {birthdayMessage}
              </p>
            </div>

            {/* Fun Facts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-sm font-semibold text-gray-600">Color Favorito</p>
                <p className="text-lg font-bold" style={{ color: accentColor }}>{favoriteColor}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="text-2xl mb-2">🧸</div>
                <p className="text-sm font-semibold text-gray-600">Juguete Favorito</p>
                <p className="text-lg font-bold" style={{ color: accentColor }}>{favoriteToy}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="text-2xl mb-2">🍦</div>
                <p className="text-sm font-semibold text-gray-600">Comida Favorita</p>
                <p className="text-lg font-bold" style={{ color: accentColor }}>{favoriteFood}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="text-2xl mb-2">⭐</div>
                <p className="text-sm font-semibold text-gray-600">Le Gusta</p>
                <p className="text-lg font-bold" style={{ color: accentColor }}>{hobbyOrInterest}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};