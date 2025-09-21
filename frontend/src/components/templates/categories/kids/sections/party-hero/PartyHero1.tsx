/**
 * Kids Party Hero Section 1
 *
 * WHY: Hero section specifically designed for kids birthday parties
 * with playful colors, fun typography, and child-friendly imagery.
 */

'use client';

import React from 'react';

export interface PartyHero1Props {
  // Child information
  childName?: string;
  age?: number;
  birthdayDate?: string;

  // Party details
  partyLocation?: string;
  partyTheme?: string;

  // Visual elements
  heroImageUrl?: string;
  backgroundColor?: string;
  accentColor?: string;

  // Configuration
  isPreview?: boolean;
  className?: string;
}

export const PartyHero1DefaultProps: PartyHero1Props = {
  childName: 'Sofia',
  age: 5,
  birthdayDate: '15 de Diciembre, 2024',
  partyLocation: 'Casa de Sofia',
  partyTheme: 'Princesas',
  heroImageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
  backgroundColor: '#FFB6C1',
  accentColor: '#FF69B4',
};

export const PartyHero1: React.FC<PartyHero1Props> = ({
  childName = PartyHero1DefaultProps.childName,
  age = PartyHero1DefaultProps.age,
  birthdayDate = PartyHero1DefaultProps.birthdayDate,
  partyLocation = PartyHero1DefaultProps.partyLocation,
  partyTheme = PartyHero1DefaultProps.partyTheme,
  heroImageUrl = PartyHero1DefaultProps.heroImageUrl,
  backgroundColor = PartyHero1DefaultProps.backgroundColor,
  accentColor = PartyHero1DefaultProps.accentColor,
  isPreview = false,
  className = '',
}) => {
  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Age Badge */}
        <div
          className="inline-block px-8 py-4 rounded-full text-3xl font-bold text-white mb-6 shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          ¡{age} Años!
        </div>

        {/* Child Name */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
          {childName}
        </h1>

        {/* Party Theme */}
        <p className="text-2xl md:text-3xl text-white mb-6 drop-shadow-md">
          Fiesta de {partyTheme}
        </p>

        {/* Date and Location */}
        <div className="bg-white bg-opacity-90 rounded-2xl p-6 mx-auto max-w-2xl">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
            📅 {birthdayDate}
          </p>
          <p className="text-lg md:text-xl text-gray-700">
            📍 {partyLocation}
          </p>
        </div>

        {/* Fun Decorative Elements */}
        <div className="mt-8 text-4xl">
          🎈 🎂 🎉 🎁 🎈
        </div>
      </div>
    </section>
  );
};