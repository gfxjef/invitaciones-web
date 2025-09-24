/**
 * Familiares Section 1 - Family Blessing and Godparents
 *
 * WHY: Elegant section that presents the families of both bride and groom,
 * along with their godparents, showing respect and honor to family tradition.
 *
 * FEATURES:
 * - Grid layout for parents (2x2)
 * - Separate section for godparents (1x2)
 * - Script fonts for romantic titles
 * - Clean bordered cards with orange accents
 * - Responsive design for all devices
 * - Font consistency with wedding theme
 */

'use client';

interface Familiares1Props {
  familiares_titulo_padres?: string;
  familiares_titulo_padrinos?: string;
  familiares_padre_novio?: string;
  familiares_madre_novio?: string;
  familiares_padre_novia?: string;
  familiares_madre_novia?: string;
  familiares_padrino?: string;
  familiares_madrina?: string;
}

export const Familiares1: React.FC<Familiares1Props> = ({
  familiares_titulo_padres = Familiares1DefaultProps.familiares_titulo_padres,
  familiares_titulo_padrinos = Familiares1DefaultProps.familiares_titulo_padrinos,
  familiares_padre_novio = Familiares1DefaultProps.familiares_padre_novio,
  familiares_madre_novio = Familiares1DefaultProps.familiares_madre_novio,
  familiares_padre_novia = Familiares1DefaultProps.familiares_padre_novia,
  familiares_madre_novia = Familiares1DefaultProps.familiares_madre_novia,
  familiares_padrino = Familiares1DefaultProps.familiares_padrino,
  familiares_madrina = Familiares1DefaultProps.familiares_madrina,
}) => {
  return (
    <section className="bg-white py-16 md:py-20" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="max-w-6xl mx-auto px-4">

        {/* Parents Section */}
        <div className="mb-8">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl text-center font-great-vibes text-gray-800 mb-8">
            {familiares_titulo_padres}
          </h2>

          {/* Parents Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto">
            {/* Left Column - Groom's Parents */}
            <div className="space-y-2">
              <div className="rounded-lg  bg-white ">
                <p className="text-center text-gray-700 font-montserrat text-sm md:text-base">
                  {familiares_padre_novio}
                </p>
              </div>
              <div className="rounded-lg  bg-white ">
                <p className="text-center text-gray-700 font-montserrat text-sm md:text-base">
                  {familiares_madre_novio}
                </p>
              </div>
            </div>

            {/* Right Column - Bride's Parents */}
            <div className="space-y-2">
              <div className="rounded-lg  bg-white ">
                <p className="text-center text-gray-700 font-montserrat text-sm md:text-base">
                  {familiares_padre_novia}
                </p>
              </div>
              <div className="rounded-lg  bg-white ">
                <p className="text-center text-gray-700 font-montserrat text-sm md:text-base">
                  {familiares_madre_novia}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Godparents Section */}
        <div>
          {/* Title */}
          <h3 className="text-3xl md:text-4xl text-center font-great-vibes text-gray-800 mb-10" style={{ marginBottom: '0.5rem' }}>
            {familiares_titulo_padrinos}
          </h3>

          {/* Godparents - Simple text in one line */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-gray-700 font-montserrat text-sm md:text-base">
              {familiares_padrino} <span className="text-gray-600 font-great-vibes mx-2">&</span> {familiares_madrina}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Export default props for centralized access
export const Familiares1DefaultProps = {
  familiares_titulo_padres: 'Con la Bendición de Nuestros Padres',
  familiares_titulo_padrinos: 'y nuestros Padrinos',
  familiares_padre_novio: 'EFRAIN ALBITER HERNÁNDEZ',
  familiares_madre_novio: 'ROCÍO ESQUIVEL GARCÍA',
  familiares_padre_novia: 'LÁZARO MENESES RAMÍREZ',
  familiares_madre_novia: 'ANA MARÍA VÁZQUEZ NIEVES',
  familiares_padrino: 'JORGE ALBITER HERNÁNDEZ',
  familiares_madrina: 'JANETH BENÍTEZ REBOLLAR',
};