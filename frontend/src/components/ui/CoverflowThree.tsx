"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

type CardData = {
  id: number;
  title: string;
  color: string;
  author?: string;
};

const CARDS: CardData[] = [
  { id: 1, title: "Peace Within\nthe Circuit", color: "#8b5cf6", author: "@artByAI" },
  { id: 2, title: "Dream Architect\nof Neon Shapes", color: "#22d3ee", author: "@creator" },
  { id: 3, title: "Drifting Spirit\nof Dawn", color: "#f59e0b", author: "@skyArt" },
  { id: 4, title: "Spectrum Weaver\nof Lights", color: "#a855f7", author: "@neonDreams" },
  { id: 5, title: "Halo of\nGentle Power", color: "#34d399", author: "@divineArt" },
];

type Props = {
  radius?: number;
  stepDeg?: number;
  autoplayMs?: number;
  height?: number;
};

export default function CoverflowThree({
  radius = 6,
  stepDeg = 18,
  autoplayMs = 5000,
  height = 520,
}: Props) {
  const [index, setIndex] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);

  // autoplay
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setIndex((p) => (p + 1) % CARDS.length);
    }, autoplayMs);
    return () => clearInterval(t);
  }, [isPlaying, autoplayMs]);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const positions = useMemo(() => {
    return CARDS.map((_, i) => {
      const offset = i - index;
      const angle = offset * stepDeg;
      const θ = toRad(angle);

      const x = Math.sin(θ) * radius;
      const z = radius - Math.cos(θ) * radius;
      const rotY = -θ;
      const scale = i === index ? 1.15 : 1.0;
      const opacity = i === index ? 1 : Math.max(0.4, 1 - Math.abs(offset) * 0.15);

      return { x, z, rotY, scale, opacity };
    });
  }, [index, radius, stepDeg]);

  return (
    <div className="w-full" style={{ height }}>
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 9], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a10' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[4, 8, 5]}
          intensity={1.2}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-6, 3, 6]} intensity={0.5} />
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#06b6d4" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0b1220" roughness={0.9} metalness={0.1} />
        </mesh>

        <Environment preset="night" />

        <group position={[0, 0, 0]}>
          {CARDS.map((c, i) => {
            const { x, z, rotY, scale, opacity } = positions[i];

            return (
              <group
                key={c.id}
                position={[x, 0, -z]}
                rotation={[0, rotY, 0]}
                scale={scale}
                onClick={() => setIndex(i)}
              >
                <Card3D
                  title={c.title}
                  author={c.author}
                  color={c.color}
                  isActive={i === index}
                  opacity={opacity}
                />
              </group>
            );
          })}
        </group>
      </Canvas>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => setIndex((p) => (p - 1 + CARDS.length) % CARDS.length)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label="Anterior"
        >
          ◀
        </button>
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label={isPlaying ? "Pausar" : "Reanudar"}
        >
          {isPlaying ? "⏸ Pausar" : "▶ Reanudar"}
        </button>
        <button
          onClick={() => setIndex((p) => (p + 1) % CARDS.length)}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label="Siguiente"
        >
          ▶
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all outline-none focus:ring-2 focus:ring-cyan-400 ${
              i === index ? "bg-cyan-400 w-8" : "bg-white/30 w-2 hover:bg-white/50"
            }`}
            aria-label={`Ir a tarjeta ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Card3D({
  title,
  author,
  color,
  isActive,
  opacity,
}: {
  title: string;
  author?: string;
  color: string;
  isActive: boolean;
  opacity: number;
}) {
  const W = 2.6;
  const H = 3.8;
  const DEPTH = 0.08;

  return (
    <group position={[0, 0.3, 0]}>
      <RoundedBox
        args={[W, H, DEPTH]}
        radius={0.15}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* Glass overlay */}
      <mesh position={[0, 0, DEPTH / 2 + 0.002]}>
        <planeGeometry args={[W * 0.96, H * 0.96]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={isActive ? 0.08 : 0.04}
          metalness={0.4}
          roughness={0}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Card number badge */}
      <mesh position={[W * 0.35, H * 0.38, DEPTH / 2 + 0.003]}>
        <circleGeometry args={[0.18, 32]} />
        <meshStandardMaterial color="#000000" opacity={0.6} transparent />
      </mesh>

      {/* Title area - visual placeholder */}
      {isActive && (
        <group position={[0, -H * 0.28, DEPTH / 2 + 0.004]}>
          <mesh>
            <planeGeometry args={[W * 0.75, 0.5]} />
            <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
          </mesh>
          {/* Subtitle lines */}
          <mesh position={[0, -0.15, 0.001]}>
            <planeGeometry args={[W * 0.6, 0.08]} />
            <meshStandardMaterial color="#ffffff" opacity={0.15} transparent />
          </mesh>
        </group>
      )}

      {/* Author area */}
      {isActive && author && (
        <mesh position={[0, -H * 0.38, DEPTH / 2 + 0.004]}>
          <planeGeometry args={[W * 0.5, 0.12]} />
          <meshStandardMaterial color="#ffffff" opacity={0.1} transparent />
        </mesh>
      )}

      {/* QR placeholder */}
      <mesh position={[W * 0.32, -H * 0.35, DEPTH / 2 + 0.003]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[W * 0.32, -H * 0.35, DEPTH / 2 + 0.004]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshStandardMaterial color="#000000" opacity={0.8} transparent />
      </mesh>

      {/* Glow effect on active */}
      {isActive && (
        <pointLight position={[0, 0, 1]} intensity={0.6} color={color} distance={3} />
      )}
    </group>
  );
}
