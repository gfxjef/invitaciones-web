"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import Image from "next/image";

// Tipos de props
export interface PlaceStart1Props {
  // Textos principales
  mainTitle?: string;
  highlightedWord?: string;
  subtitle?: string;

  // Configuración del carrusel
  cards?: Array<{
    id: number;
    image: string;
    title: string;
    author: string;
    edition: string;
    gradient: string;
  }>;

  // Input de búsqueda
  placeholder?: string;
  showVoiceInput?: boolean;

  // Sección inferior
  bottomTitle?: string;
  bottomSubtitle?: string;
  bottomImage?: string;

  // Estilos
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;

  // Funcionalidad
  autoRotate?: boolean;
  rotationSpeed?: number; // en ms
}

// Valores por defecto
const DEFAULT_CARDS = [
  {
    id: 1,
    image: "/templates/placestart/card1.png",
    title: "Peace Within the Circuit",
    author: "ArtisticVibe",
    edition: "#16 /1000",
    gradient: "from-purple-500/30 to-indigo-500/30"
  },
  {
    id: 2,
    image: "/templates/placestart/card2.png",
    title: "Dream Architect of Neon Shapes",
    author: "@DesignerArt",
    edition: "#28 /1000",
    gradient: "from-cyan-400/30 to-teal-400/30"
  },
  {
    id: 3,
    image: "/templates/placestart/card3.png",
    title: "Drifting Spirit of Dawn",
    author: "by @arty_lab",
    edition: "#36 /1000",
    gradient: "from-amber-400/30 to-orange-500/30"
  },
  {
    id: 4,
    image: "/templates/placestart/card4.png",
    title: "Spectrum Weaver of Lights",
    author: "@neonphantom",
    edition: "#41 /1000",
    gradient: "from-pink-400/30 to-violet-500/30"
  },
  {
    id: 5,
    image: "/templates/placestart/card5.png",
    title: "Halo of Gentle Power",
    author: "by @gentlepower",
    edition: "#52 /1000",
    gradient: "from-yellow-300/30 to-rose-400/30"
  }
];

export default function PlaceStart1({
  mainTitle = "Create",
  highlightedWord = "Magic",
  subtitle = "Type your idea, pick a style, and watch it transform into stunning digital art.",
  cards = DEFAULT_CARDS,
  placeholder = "Type a prompt...",
  showVoiceInput = true,
  bottomTitle = "Where Art Meets Intelligence",
  bottomSubtitle = "Artify explores the intersection of creativity and machine learning.",
  bottomImage = "/templates/placestart/bottom-art.png",
  backgroundColor = "from-[#0a0a10] to-[#121222]",
  textColor = "text-white",
  accentColor = "text-cyan-400",
  autoRotate = true,
  rotationSpeed = 4000
}: PlaceStart1Props) {
  const [activeIndex, setActiveIndex] = useState(2); // Inicia en el centro
  const [paused, setPaused] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const prefersReduced = useReducedMotion();
  const intervalRef = useRef<number | null>(null);

  // Auto-rotación con pausa en hover/focus
  useEffect(() => {
    if (!autoRotate || prefersReduced || paused) return;

    intervalRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, rotationSpeed);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [autoRotate, paused, prefersReduced, cards.length, rotationSpeed]);

  // Navegación
  const navigate = (direction: -1 | 1) => {
    setActiveIndex((prev) => (prev + direction + cards.length) % cards.length);
  };

  // Manejo de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigate(-1);
      setPaused(true);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      navigate(1);
      setPaused(true);
    }
  };

  // Label de accesibilidad
  const ariaLabel = useMemo(
    () => `Showing card ${activeIndex + 1} of ${cards.length}: ${cards[activeIndex].title}`,
    [activeIndex, cards]
  );

  return (
    <section
      className={`relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b ${backgroundColor} ${textColor} overflow-hidden`}
      aria-label="PlaceStart AI Art Gallery"
    >
      {/* Header con título */}
      <div className="relative z-10 text-center px-6 mb-12 mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold mb-4"
        >
          {mainTitle}{" "}
          <span className="relative inline-block">
            <span className={`relative z-10 ${accentColor}`}>
              {highlightedWord}
            </span>
            <motion.span
              className="absolute -top-2 -right-2"
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </span>
        </motion.h1>
        <h2 className="text-xl md:text-3xl font-normal">
          With Words Turned Into Art
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-base md:text-lg text-gray-400 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Carrusel 3D */}
      <div
        className="relative w-full max-w-[1200px] h-[500px] px-6 mb-16"
        style={{ perspective: "1400px" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-live="polite"
        aria-label={ariaLabel}
      >
        {cards.map((card, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);

          // Transformaciones con límites
          const rotateY = Math.max(-45, Math.min(45, offset * 35));
          const translateX = Math.max(-400, Math.min(400, offset * 220));
          const translateZ = Math.max(-700, Math.min(0, -absOffset * 180));
          const scale = Math.max(0.7, 1 - absOffset * 0.1);
          const opacity = index === activeIndex ? 1 : 0.5;

          return (
            <motion.div
              key={card.id}
              initial={false}
              animate={{ opacity: prefersReduced ? 1 : opacity }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              className="absolute top-0 left-1/2 w-[280px] h-[400px] -translate-x-1/2 cursor-pointer"
              style={{
                transform: prefersReduced
                  ? "none"
                  : `
                    translateZ(${translateZ}px)
                    translateX(${translateX}px)
                    rotateY(${rotateY}deg)
                    scale(${scale})
                  `,
                transformOrigin: "center center",
                zIndex: 100 - absOffset,
                willChange: "transform, opacity",
              }}
              onClick={() => setActiveIndex(index)}
              role="button"
              tabIndex={0}
              aria-current={index === activeIndex ? "true" : "false"}
              aria-label={`Card ${index + 1}: ${card.title}`}
            >
              <div
                className={`
                  relative w-full h-full rounded-3xl overflow-hidden
                  bg-gradient-to-br ${card.gradient}
                  shadow-[0_25px_80px_rgba(0,0,0,0.5)]
                  border border-white/10
                  transform-gpu
                `}
              >
                {/* Imagen de la obra */}
                <div className="relative w-full h-[280px] bg-black/20">
                  {card.image && (
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                      sizes="280px"
                      priority={index === activeIndex}
                    />
                  )}
                </div>

                {/* Info de la tarjeta */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-gray-400 mb-1">{card.author}</p>
                  <h3 className="text-lg font-semibold leading-tight mb-2 line-clamp-2">
                    {card.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{card.edition}</span>
                    {/* QR Code placeholder */}
                    <div className="w-10 h-10 bg-white/10 rounded border border-white/20" />
                  </div>
                </div>

                {/* Glow effect en la activa */}
                {index === activeIndex && !prefersReduced && (
                  <div className="absolute inset-0 bg-white/5 blur-xl pointer-events-none" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input de búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl px-6 mb-20"
      >
        <div className="relative flex items-center bg-[#1a1a2e]/80 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <input
            type="text"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-6 py-4 bg-transparent text-white placeholder:text-gray-500 outline-none"
            aria-label="AI art prompt input"
          />

          {showVoiceInput && (
            <button
              type="button"
              className="p-3 hover:bg-white/5 transition-colors"
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5 text-gray-400" />
            </button>
          )}

          <button
            type="submit"
            className={`p-3 m-2 bg-gradient-to-r ${accentColor === 'text-cyan-400' ? 'from-cyan-500 to-blue-500' : 'from-purple-500 to-pink-500'} rounded-xl hover:opacity-90 transition-opacity`}
            aria-label="Submit prompt"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </motion.div>

      {/* Sección inferior */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="relative z-10 w-full max-w-6xl px-6 py-20"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {bottomTitle}
            </h2>
            <p className="text-lg text-gray-400">
              {bottomSubtitle}
            </p>
          </div>

          {bottomImage && (
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src={bottomImage}
                alt="AI Art Illustration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Efectos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
    </section>
  );
}
