"use client";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

// Sanitize strings if they come from user input (basic XSS prevention)
const safeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

type Card = { id: number; title: string; gradient: string; img?: string; author?: string };

const DEFAULT_CARDS: Card[] = [
  { id: 1, title: "Peace Within the Circuit", gradient: "from-purple-500 to-indigo-500", author: "@artByAI" },
  { id: 2, title: "Dream Architect of Neon Shapes", gradient: "from-cyan-400 to-teal-400", author: "@creator" },
  { id: 3, title: "Drifting Spirit of Dawn", gradient: "from-amber-400 to-orange-500", author: "@skyArt" },
  { id: 4, title: "Spectrum Weaver of Lights", gradient: "from-pink-400 to-violet-500", author: "@neonDreams" },
  { id: 5, title: "Halo of Gentle Power", gradient: "from-yellow-300 to-rose-400", author: "@divineArt" },
];

interface Carousel3DProps {
  cards?: Card[];
  autoRotate?: boolean;
  rotationInterval?: number;
}

export default function Carousel3D({
  cards = DEFAULT_CARDS,
  autoRotate = true,
  rotationInterval = 5000
}: Carousel3DProps) {
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  const intervalRef = useRef<number | null>(null);

  // Auto-rotation with pause on hover/focus
  useEffect(() => {
    if (prefersReduced || !autoRotate) return;
    if (paused) return;
    intervalRef.current = window.setInterval(() => {
      setActive((p) => (p + 1) % cards.length);
    }, rotationInterval);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, prefersReduced, autoRotate, rotationInterval, cards.length]);

  // Accessibility: announce current slide
  const ariaLabel = useMemo(
    () => `Mostrando tarjeta ${active + 1} de ${cards.length}: ${cards[active].title}`,
    [active, cards]
  );

  const go = (dir: -1 | 1) =>
    setActive((p) => (p + dir + cards.length) % cards.length);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); setPaused(true); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); setPaused(true); }
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); setPaused((x) => !x); }
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-b from-[#0a0a10] to-[#121222] text-white select-none overflow-hidden"
      aria-roledescription="Carrusel 3D"
      aria-label="Galería de artes destacados"
    >
      <h2 className="sr-only">Carrusel 3D de tarjetas</h2>

      {/* Background blur effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-purple-500/10 to-transparent blur-3xl"></div>
      </div>

      {/* 3D Carousel Container */}
      <div
        className="relative w-full max-w-[1200px] h-[500px] px-6 outline-none flex items-center justify-center"
        style={{ perspective: '2000px' }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-live="polite"
        aria-atomic="true"
        aria-label={ariaLabel}
      >
        {cards.map((card, i) => {
          const offset = i - active;
          const abs = Math.abs(offset);

          // Enhanced coverflow calculations
          const rotateY = offset * -50; // More pronounced rotation
          const translateX = offset * 280; // Horizontal spacing
          const translateZ = -abs * 200; // Depth - cards go back
          const scale = offset === 0 ? 1.15 : Math.max(0.7, 1 - abs * 0.12);
          const opacity = offset === 0 ? 1 : Math.max(0.4, 1 - abs * 0.25);

          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => setActive(i)}
              initial={false}
              animate={{
                x: prefersReduced ? offset * 260 : translateX,
                z: prefersReduced ? 0 : translateZ,
                rotateY: prefersReduced ? 0 : rotateY,
                scale: prefersReduced ? (offset === 0 ? 1.1 : 0.9) : scale,
                opacity: prefersReduced ? 1 : opacity,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                mass: 1.2
              }}
              className="absolute w-[280px] h-[380px] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#121222] rounded-3xl"
              style={{
                transformOrigin: "center center",
                zIndex: offset === 0 ? 50 : 50 - abs,
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
              aria-current={i === active ? "true" : "false"}
              aria-label={`Tarjeta ${i + 1}: ${card.title}${i === active ? " (actual)" : ""}`}
            >
              <div
                className={`w-full h-full rounded-3xl bg-gradient-to-br ${card.gradient} shadow-2xl transform-gpu relative overflow-hidden border-2 border-white/10`}
                style={{
                  boxShadow: offset === 0
                    ? '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.3)'
                    : '0 20px 60px rgba(0,0,0,0.45)',
                }}
              >
                {/* Glow effect on active card */}
                {i === active && !prefersReduced && (
                  <>
                    <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/10 blur-2xl opacity-50" />
                    <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/5 to-white/10" />
                  </>
                )}

                {/* Card number badge */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-sm font-bold text-white/90">#{card.id}</span>
                </div>

                {/* QR code placeholder */}
                <div className="absolute bottom-4 right-4 w-16 h-16 bg-white rounded-lg p-1 shadow-lg">
                  <div className="w-full h-full bg-black/80 rounded flex items-center justify-center text-[8px] text-white/50">
                    QR
                  </div>
                </div>

                <div className="absolute inset-0 p-6 flex items-end">
                  <div className="text-left w-full">
                    {card.author && (
                      <p className="text-sm text-white/70 mb-2">by {safeText(card.author)}</p>
                    )}
                    <h3 className="font-bold text-xl leading-tight drop-shadow-lg mb-2">
                      {safeText(card.title)}
                    </h3>
                    {i === active && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mt-3"
                      >
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/40" />
                          ))}
                        </div>
                        <span className="text-xs text-white/60">1000</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => go(-1)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 focus:bg-white/20 focus:ring-2 focus:ring-cyan-400 transition outline-none"
          aria-label="Anterior"
        >
          ◀
        </button>
        <button
          onClick={() => go(1)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 focus:bg-white/20 focus:ring-2 focus:ring-cyan-400 transition outline-none"
          aria-label="Siguiente"
        >
          ▶
        </button>
        {autoRotate && (
          <button
            onClick={() => setPaused((p) => !p)}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-cyan-400 transition outline-none"
            aria-pressed={paused}
            aria-label={paused ? "Reanudar auto-rotación" : "Pausar auto-rotación"}
          >
            {paused ? "▶ Reanudar" : "⏸ Pausar"}
          </button>
        )}
      </div>

      {/* Indicator Dots */}
      <div className="mt-4 flex items-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2 h-2 rounded-full transition-all outline-none focus:ring-2 focus:ring-cyan-400 ${
              i === active ? "bg-cyan-400 w-8" : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Ir a tarjeta ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
