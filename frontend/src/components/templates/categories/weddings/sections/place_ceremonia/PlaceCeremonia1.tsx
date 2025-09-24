/**
 * PlaceCeremonia Section 1 - Post-Ceremony Reception Location Details
 *
 * WHY: Section that presents post-ceremony reception location with date, time, and address details
 *
 * FEATURES:
 * - Date with day of week formatting using dateFormatter utility
 * - Specific time display for ceremony reception
 * - Reception location venue and address details
 * - Elegant bordered card design with celebration theme
 * - Interactive map button
 * - Responsive design for all devices
 * - Font consistency with wedding theme
 */

'use client';

import { LiaGlassCheersSolid } from 'react-icons/lia';

interface PlaceCeremonia1Props {
  place_ceremonia_titulo?: string;
  place_ceremonia_hora?: string;
  place_ceremonia_lugar?: string;
  place_ceremonia_direccion?: string;
  place_ceremonia_mapa_url?: string;
}

export const PlaceCeremonia1: React.FC<PlaceCeremonia1Props> = ({
  place_ceremonia_titulo = PlaceCeremonia1DefaultProps.place_ceremonia_titulo,
  place_ceremonia_hora = PlaceCeremonia1DefaultProps.place_ceremonia_hora,
  place_ceremonia_lugar = PlaceCeremonia1DefaultProps.place_ceremonia_lugar,
  place_ceremonia_direccion = PlaceCeremonia1DefaultProps.place_ceremonia_direccion,
  place_ceremonia_mapa_url = PlaceCeremonia1DefaultProps.place_ceremonia_mapa_url,
}) => {

  return (
    <section className="bg-white py-8 md:py-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* Title */}
        <h2 className="text-center text-gray-700 font-montserrat text-sm md:text-base">
          {place_ceremonia_titulo}
        </h2>

        {/* Location Card */}
        <div className="bg-white rounded-lg pt-4 max-w-2xl mx-auto">


          {/* Champagne Glasses Icon Divider */}
          <div className="flex items-center justify-center mb-6">
            <LiaGlassCheersSolid className="text-3xl md:text-4xl" style={{ color: '#C9A646' }} />
          </div>

          {/* Location Details */}
          <div className="text-center space-y-3">
            <h3 className="text-xl md:text-2xl font-montserrat font-semibold text-gray-800">
              {place_ceremonia_lugar}
            </h3>

            <p className="text-gray-700 font-montserrat text-sm md:text-base">
              {place_ceremonia_direccion}
            </p>
          </div>

          {/* Map Button */}
          {place_ceremonia_mapa_url && (
            <div className="text-center">
              <p className="text-base md:text-lg font-montserrat text-gray-700 mb-4">
                {place_ceremonia_hora}
              </p>
              <a
                href={place_ceremonia_mapa_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 text-white font-montserrat font-medium rounded-full transition-colors duration-200"
                style={{ backgroundColor: '#C9A646' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B8942F'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C9A646'}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                </svg>
                ¿CÓMO LLEGAR?
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Export default props for centralized access
export const PlaceCeremonia1DefaultProps = {
  place_ceremonia_titulo: 'DESPUÉS DE LA CEREMONIA RELIGIOSA AGRADECEMOS SU PRESENCIA EN',
  place_ceremonia_hora: '15:30',
  place_ceremonia_lugar: 'La Hacienda del Mago',
  place_ceremonia_direccion: 'Tambo Nuevo F 33, Cieneguilla 15593',
  place_ceremonia_mapa_url: 'https://maps.app.goo.gl/KQ9adVdsraeftEph7',
};