/**
 * Welcome Section 2 - Minimalist Typography Focus
 *
 * WHY: Elegant minimalist welcome section that focuses entirely on the
 * description message with sophisticated typography and clean layout.
 *
 * FEATURES:
 * - Minimalist design focusing only on description text
 * - Large, bold typography for maximum impact
 * - Responsive text sizing for all devices
 * - Clean centered layout with breathing space
 * - Compatible interface with Welcome1 for seamless switching
 */

'use client';

interface Welcome2Props {
  bannerImageUrl?: string;
  couplePhotoUrl?: string;
  welcomeText?: string;
  title?: string;
  description?: string;
}

export const Welcome2: React.FC<Welcome2Props> = ({

  description = "TU SIEMPRE SERAS MI REFERENTE DEL AMOR EN PAREJA, PORQUE SIEMPRE QUISE ESTO Y TU ME LO HAS REGALADO"
}) => {
  return (
    <section className="bg-white py-16 md:py-20" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Minimalist Content Container */}
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center">
          {/* Main Description Text - Same Typography as Welcome1 */}
          <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed font-montserrat">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

// Export default props - same as Welcome1 for compatibility
export const Welcome2DefaultProps = {

  description: "TU SIEMPRE SERAS MI REFERENTE DEL AMOR EN PAREJA, PORQUE SIEMPRE QUISE ESTO Y TU ME LO HAS REGALADO"
};