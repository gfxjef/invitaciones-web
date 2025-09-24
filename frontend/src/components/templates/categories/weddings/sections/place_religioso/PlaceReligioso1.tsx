/**
 * PlaceReligioso Section 1 - Religious Wedding Location Details
 *
 * WHY: Section that presents religious wedding location with date, time, and address details
 *
 * FEATURES:
 * - Date with day of week formatting using dateFormatter utility
 * - Time display extracted from weddingDate
 * - Religious location venue and address details
 * - Elegant bordered card design with religious theme
 * - Interactive map button
 * - Responsive design for all devices
 * - Font consistency with wedding theme
 */

'use client';

import { formatDateWithDay, formatTimeFromDate, formatDateParts } from '@/lib/utils/dateFormatter';
import { PiChurchDuotone } from 'react-icons/pi';

interface PlaceReligioso1Props {
  place_religioso_titulo?: string;
  weddingDate?: string;
  place_religioso_lugar?: string;
  place_religioso_direccion?: string;
  place_religioso_mapa_url?: string;
}

export const PlaceReligioso1: React.FC<PlaceReligioso1Props> = ({
  place_religioso_titulo = PlaceReligioso1DefaultProps.place_religioso_titulo,
  weddingDate = PlaceReligioso1DefaultProps.weddingDate,
  place_religioso_lugar = PlaceReligioso1DefaultProps.place_religioso_lugar,
  place_religioso_direccion = PlaceReligioso1DefaultProps.place_religioso_direccion,
  place_religioso_mapa_url = PlaceReligioso1DefaultProps.place_religioso_mapa_url,
}) => {
  const formattedDate = formatDateWithDay(weddingDate);
  const formattedTime = formatTimeFromDate(weddingDate);
  const dateParts = formatDateParts(weddingDate);

  return (
    <section className="bg-white py-8 md:py-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* Title */}
        <h2 className="text-4xl md:text-5xl text-center font-great-vibes text-gray-800">
          {place_religioso_titulo}
        </h2>

        {/* Location Card */}
        <div className="bg-white rounded-lg pt-4 max-w-2xl mx-auto">

          {/* Date with Visual Layout */}
          <div className="text-center mb-6">
            {/* Primera fila: DÍA + NÚMERO + MES */}
            <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
              <span className="text-lg md:text-xl font-montserrat text-gray-700 border-t border-b border-gray-400 py-2">
                {dateParts.dayName}
              </span>
              <span className="text-4xl md:text-5xl font-montserrat font-bold text-gray-800 px-2">
                {dateParts.day}
              </span>
              <span className="text-lg md:text-xl font-montserrat text-gray-700 border-t border-b border-gray-400 py-2">
                {dateParts.monthName}
              </span>
            </div>

            {/* Segunda fila: AÑO */}
            <div className="text-center mb-3">
              <span className="text-2xl md:text-3xl font-montserrat font-semibold text-gray-800">
                {dateParts.year}
              </span>
            </div>

          </div>

          {/* Church Icon Divider */}
          <div className="flex items-center justify-center mb-6">
            <PiChurchDuotone className="text-3xl md:text-4xl" style={{ color: '#C9A646' }} />
          </div>

          {/* Location Details */}
          <div className="text-center space-y-3">
            <h3 className="text-xl md:text-2xl font-montserrat font-semibold text-gray-800">
              {place_religioso_lugar}
            </h3>

            <p className="text-gray-700 font-montserrat text-sm md:text-base">
              {place_religioso_direccion}
            </p>
          </div>

          {/* Map Button */}
          {place_religioso_mapa_url && (
            <div className="text-center">
              <p className="text-base md:text-lg font-montserrat text-gray-700 mb-4">
                {formattedTime}
              </p>
              <a
                href={place_religioso_mapa_url}
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
export const PlaceReligioso1DefaultProps = {
  place_religioso_titulo: 'Los esperamos en nuestra ceremonia',
  weddingDate: '2024-11-16T17:00:00',
  place_religioso_lugar: 'Parroquia Inmaculado Corazón',
  place_religioso_direccion: 'Alameda de la Paz S/N Urb, La Molina 15024',
  place_religioso_mapa_url: 'https://maps.app.goo.gl/EE2DGucWKaVDStG28',
};