/**
 * Happy Couple Section 1 - Profile Cards with Social Links
 *
 * WHY: Elegant couple presentation using ProfileCard components that showcase
 * both bride and groom with their photos, descriptions, and social media links.
 *
 * FEATURES:
 * - Reusable ProfileCard component
 * - Social media integration (Facebook, Twitter, Instagram)
 * - Great Vibes font for romantic titles
 * - Responsive grid layout
 * - Hover effects on social icons
 * - Consistent amber-700 color scheme
 */

'use client';

import { Facebook, Twitter, Instagram } from 'lucide-react';

interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
}

interface PersonData {
  imageUrl: string;
  name: string;
  role: string;
  description: string;
  socialLinks: SocialLinks;
}

interface Couple1Props {
  sectionTitle?: string;
  sectionSubtitle?: string;
  brideData?: PersonData;
  groomData?: PersonData;
}

// --- Componente de la Tarjeta de Perfil Reutilizable ---
const ProfileCard = ({ imageUrl, name, role, description, socialLinks }: PersonData) => (
  <div className="text-center flex flex-col items-center">
    {/* Imagen de Perfil */}
    <img
      src={imageUrl}
      alt={name}
      className="w-40 h-40 rounded-full object-cover mb-6 shadow-md"
    />

    {/* Nombre */}
    <h4 className="text-lg font-semibold tracking-wider text-gray-700 uppercase font-montserrat">{name}</h4>

    {/* Rol (The Bride/The Groom) */}
    <p className="text-amber-700 text-2xl mt-1 mb-4 font-great-vibes">
      {role}
    </p>

    {/* Descripción */}
    <p className="text-gray-500 text-sm leading-relaxed max-w-xs px-2 font-montserrat">
      {description}
    </p>

    {/* Iconos de Redes Sociales */}
    <div className="flex space-x-3 mt-6">
      <a
        href={socialLinks.facebook}
        aria-label="Facebook profile"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-amber-700 transition-colors duration-300"
      >
        <Facebook size={16} />
      </a>
      <a
        href={socialLinks.twitter}
        aria-label="Twitter profile"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-amber-700 transition-colors duration-300"
      >
        <Twitter size={16} />
      </a>
      <a
        href={socialLinks.instagram}
        aria-label="Instagram profile"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-amber-700 transition-colors duration-300"
      >
        <Instagram size={16} />
      </a>
    </div>
  </div>
);

export const Couple1: React.FC<Couple1Props> = ({
  sectionTitle = 'Futuros Felices Esposos',
  sectionSubtitle = 'MARIDO & MUJER',
  brideData = {
    imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/bride.png',
    name: 'Rosmery Guiterrez',
    role: 'La Novia',
    description: 'Rosmery, eres mi amor eterno, mi compañera de vida y el sueño que quiero vivir cada día a tu lado.',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#'
    }
  },
  groomData = {
    imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/groom.png',
    name: 'Jefferson Camacho',
    role: 'El Novio',
    description: 'Jefferson, eres mi fuerza, mi refugio y mi amor infinito, con quien deseo caminar siempre de la mano en esta vida.',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#'
    }
  }
}) => {
  return (
    <section id="story" className="bg-[#fdfaf6] py-24 px-6">
      <div className="container mx-auto">
        {/* Encabezado de la sección */}
        <div className="text-center mb-16">
          <p className="text-sm text-amber-700 tracking-[0.2em] font-semibold font-montserrat">
            {sectionSubtitle}
          </p>
          <h3 className="text-5xl md:text-6xl text-gray-800 mt-2 font-great-vibes">
            {sectionTitle}
          </h3>
        </div>

        {/* Contenedor de la pareja (Grid) */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-y-16 gap-x-8">
          <ProfileCard {...brideData} />
          <ProfileCard {...groomData} />
        </div>
      </div>
    </section>
  );
};

// Export default props for centralized access
export const Couple1DefaultProps = {
  sectionTitle: 'Futuros Felices Esposos',
  sectionSubtitle: 'MARIDO & MUJER',
  brideData: {
    imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/bride.png',
    name: 'Rosmery Guiterrez',
    role: 'La Novia',
    description: 'Rosmery, eres mi amor eterno, mi compañera de vida y el sueño que quiero vivir cada día a tu lado.',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#'
    }
  },
  groomData: {
    imageUrl: 'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/groom.png',
    name: 'Jefferson Camacho',
    role: 'El Novio',
    description: 'Jefferson, eres mi fuerza, mi refugio y mi amor infinito, con quien deseo caminar siempre de la mano en esta vida.',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#'
    }
  }
};