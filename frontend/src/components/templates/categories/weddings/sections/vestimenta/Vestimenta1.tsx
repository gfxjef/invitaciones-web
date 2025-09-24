/**
 * Vestimenta Section 1 - Dress Code and Color Restrictions
 *
 * WHY: Section that presents wedding dress code information and color restrictions
 *
 * FEATURES:
 * - Elegant black background with golden decorations
 * - Dress code etiquette information
 * - Color restrictions list for guests
 * - Ornamental decorative elements
 * - Responsive design for all devices
 * - Golden particle effects background
 * - Font consistency with wedding theme
 */

'use client';

interface Vestimenta1Props {
  vestimenta_titulo?: string;
  vestimenta_etiqueta?: string;
  vestimenta_no_colores_titulo?: string;
  vestimenta_no_colores_info?: string;
}

export const Vestimenta1: React.FC<Vestimenta1Props> = ({
  vestimenta_titulo = Vestimenta1DefaultProps.vestimenta_titulo,
  vestimenta_etiqueta = Vestimenta1DefaultProps.vestimenta_etiqueta,
  vestimenta_no_colores_titulo = Vestimenta1DefaultProps.vestimenta_no_colores_titulo,
  vestimenta_no_colores_info = Vestimenta1DefaultProps.vestimenta_no_colores_info,
}) => {

  return (
    <section className="relative bg-gray-800 py-16 md:py-20 overflow-hidden">
      {/* SVG Wave Border - Top Transition */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[73px]"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity="0.25"
            className="fill-white"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity="0.5"
            className="fill-white"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-white"
          />
        </svg>
      </div>

      {/* Golden Particles Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-2 h-2 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute top-20 right-16 w-1 h-1 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute top-32 left-1/4 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute top-40 right-1/3 w-1 h-1 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute bottom-32 left-16 w-2 h-2 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute bottom-20 right-12 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute bottom-40 right-1/4 w-1 h-1 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute top-1/2 left-12 w-1 h-1 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
        <div className="absolute top-1/2 right-20 w-2 h-2 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">

        {/* Main Title - Cursive Style */}
        <h1 className="text-5xl md:text-7xl font-great-vibes" style={{ color: '#C9A646' }}>
          {vestimenta_titulo}
        </h1>

        {/* Subtitle - Etiquette */}
        <h2 className="text-white text-xl md:text-2xl font-montserrat font-semibold tracking-wider mb-8">
          {vestimenta_etiqueta}
        </h2>

        {/* Ornamental Divider */}
        <div className="flex items-center justify-center mb-4">
          <svg
            width="200"
            height="40"
            viewBox="0 0 200 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-48 md:w-64"
          >
            {/* Left branch */}
            <path
              d="M20 20 Q40 15 60 18 Q80 21 100 20"
              stroke="#C9A646"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Right branch */}
            <path
              d="M100 20 Q120 19 140 18 Q160 15 180 20"
              stroke="#C9A646"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Leaves left */}
            <path
              d="M30 18 Q35 12 32 16 Q28 14 30 18"
              fill="#C9A646"
            />
            <path
              d="M50 19 Q55 13 52 17 Q48 15 50 19"
              fill="#C9A646"
            />
            <path
              d="M70 21 Q75 15 72 19 Q68 17 70 21"
              fill="#C9A646"
            />
            {/* Leaves right */}
            <path
              d="M130 19 Q135 13 132 17 Q128 15 130 19"
              fill="#C9A646"
            />
            <path
              d="M150 18 Q155 12 152 16 Q148 14 150 18"
              fill="#C9A646"
            />
            <path
              d="M170 20 Q175 14 172 18 Q168 16 170 20"
              fill="#C9A646"
            />
            {/* Center ornament */}
            <circle cx="100" cy="20" r="3" fill="#C9A646" />
          </svg>
        </div>

        {/* Color Restrictions Section */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-white text-lg md:text-xl font-montserrat font-semibold tracking-wider">
            {vestimenta_no_colores_titulo}
          </h3>

          <p className="text-white text-sm md:text-base font-montserrat pb-8">
            {vestimenta_no_colores_info}
          </p>
        </div>

        {/* Bottom decorative elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 opacity-50">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#C9A646' }}></div>
          </div>
        </div>
      </div>

      {/* SVG Wave Border - Bottom Transition */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180 z-10">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[73px]"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity="0.25"
            className="fill-white"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity="0.5"
            className="fill-white"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
};

// Export default props for centralized access
export const Vestimenta1DefaultProps = {
  vestimenta_titulo: 'Vestimenta',
  vestimenta_etiqueta: 'ETIQUETA RIGUROSA',
  vestimenta_no_colores_titulo: 'COLORES NO PERMITIDOS',
  vestimenta_no_colores_info: 'BLANCO, BEIGE, GRIS, ROSA PALO, LILA',
};