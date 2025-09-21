/**
 * Welcome Banner Section 1 - Garden Background with Circular Couple Photo
 *
 * WHY: Elegant welcome section that creates a transition from hero to content
 * with a garden background and overlapping circular couple photo.
 *
 * FEATURES:
 * - Garden background banner
 * - Circular couple photo with shadow and border
 * - Great Vibes font for romantic title
 * - Responsive design with proper spacing
 * - Overlapping photo effect with negative margin
 */

'use client';

interface Welcome1Props {
  bannerImageUrl?: string;
  couplePhotoUrl?: string;
  welcomeText?: string;
  title?: string;
  description?: string;
}

export const Welcome1: React.FC<Welcome1Props> = ({
  bannerImageUrl = 'https://i.imgur.com/svWa52m.png',
  couplePhotoUrl = 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/couple.png',
  welcomeText = 'Hola & Bienvenidos',
  title = "Nos Vamos a Casar!!!!",
  description = "Hoy y siempre, más allá del mañana, necesito que estés a mi lado como mi mejor amigo, amante y alma gemela; te prometo ternura, compañía y apoyo incondicional para construir juntos un hogar de confianza y cariño, celebrar el amor que nos une y cuidarnos mutuamente toda la vida."
}) => {
  return (
    <section className="bg-white py-16">
      {/* Contenedor Principal de Contenido */}
      <main className="bg-white w-full flex justify-center">
        <div className="w-full max-w-4xl px-4">

          {/* Contenedor de la Imagen de Perfil */}
          <div className="relative z-10 flex justify-center mb-8">
            {/* Imagen de la pareja con borde y sombra */}
            <img
              className="w-48 h-48 rounded-full object-cover border-8 border-white shadow-lg"
              src={couplePhotoUrl}
              alt="A beautiful couple kissing on their wedding day"
            />
          </div>

          {/* Contenido de Texto */}
          <div className="text-center mt-8 pb-16">
            <p className="text-sm text-amber-700 tracking-widest font-semibold font-montserrat uppercase">
              {welcomeText}
            </p>
            <h1
              className="text-6xl text-gray-800 my-4 font-great-vibes"
            >
              {title}
            </h1>
            <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed font-montserrat">
              {description}
            </p>
          </div>
        </div>
      </main>
    </section>
  );
};

// Export default props for centralized access
export const Welcome1DefaultProps = {
  bannerImageUrl: 'https://i.imgur.com/svWa52m.png',
  couplePhotoUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/couple.png',
  welcomeText: 'Hola & Bienvenidos',
  title: "Nos Vamos a Casarrrrrr!!!!",
  description: "Hoy y siempre, más allá del mañana, necesito que estés a mi lado como mi mejor amigo, amante y alma gemela; te prometo ternura, compañía y apoyo incondicional para construir juntos un hogar de confianza y cariño, celebrar el amor que nos une y cuidarnos mutuamente toda la vida."
};