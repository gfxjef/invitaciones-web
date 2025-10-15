"use client";
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Fisheye 3D Wall v3.3 — robust click handling
 *
 * Fixes:
 *  - Busy lock during slide + release on onAnimationComplete
 *  - Decorative layers use pointer-events:none (no captura del mouse)
 *  - Hit proxy (invisible) para asegurar el click aunque la máscara recorte la tarjeta
 *  - Botones deshabilitados mientras anima
 *  - Simetría real con sin() y zIndex relativo al seleccionado
 */

type Panel = {
  id: number;
  title: string;
  gradient?: string;
  author?: string;
};

const DEFAULT_PANELS: Panel[] = [
  { id: 0, title: "Peace Within the Circuit", gradient: "from-purple-500 to-indigo-500", author: "@artByAI" },
  { id: 1, title: "Dream Architect", gradient: "from-cyan-400 to-teal-400", author: "@creator" },
  { id: 2, title: "Drifting Spirit", gradient: "from-amber-400 to-orange-500", author: "@skyArt" },
  { id: 3, title: "Spectrum Weaver", gradient: "from-pink-400 to-violet-500", author: "@neonDreams" },
  { id: 4, title: "Halo of Gentle Power", gradient: "from-yellow-300 to-rose-400", author: "@divineArt" },
  { id: 5, title: "Neon Forest Dreams", gradient: "from-green-400 to-emerald-500", author: "@natureTech" },
  { id: 6, title: "Cosmic Harmony", gradient: "from-blue-400 to-purple-600", author: "@spaceArt" },
  { id: 7, title: "Digital Sunset", gradient: "from-orange-400 to-red-500", author: "@pixelMaster" },
  { id: 8, title: "Crystal Vision", gradient: "from-indigo-400 to-pink-500", author: "@futureVibe" },
  { id: 9, title: "Aurora Borealis", gradient: "from-teal-300 to-blue-500", author: "@northernAI" },
];

interface FisheyeWall3DProps {
  panels?: Panel[];
  initialSelected?: number;
  showControls?: boolean;
}

export default function FisheyeWall3D({
  panels: customPanels,
  initialSelected = 2,
  showControls = false
}: FisheyeWall3DProps) {
  const panels = customPanels || DEFAULT_PANELS;

  // Defaults per user's latest preset
  const [radius, setRadius] = useState(747);
  const [stepDeg, setStepDeg] = useState(28);
  const [gap, setGap] = useState(4);
  const [pitch, setPitch] = useState(0);
  const [panelW, setPanelW] = useState(24);
  const [maskOn, setMaskOn] = useState(true);
  const [mode, setMode] = useState<'convex' | 'concave'>('concave');
  const [busy, setBusy] = useState(false);

  const [selected, setSelected] = useState(initialSelected);
  const [railAngle, setRailAngle] = useState(initialSelected * stepDeg); // concave => +

  useEffect(() => {
    const angle = mode === 'convex' ? -selected * stepDeg : selected * stepDeg;
    setRailAngle(angle);
  }, [stepDeg, selected, mode]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const goTo = (i: number) => {
    if (busy) return; // evita multi-click en animación
    const next = clamp(i, 0, panels.length - 1);
    if (next === selected) return;
    setBusy(true);
    setSelected(next);
    const angle = mode === 'convex' ? -next * stepDeg : next * stepDeg;
    setRailAngle(angle);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center select-none">
      {/* Controles opcionales */}
      {showControls && (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <Label>Radius: {radius}px</Label>
          <input type="range" min={350} max={1200} value={radius} onChange={(e)=>setRadius(Number(e.target.value))} className="md:col-span-5 w-full"/>

          <Label>Step: {stepDeg}°</Label>
          <input type="range" min={8} max={36} value={stepDeg} onChange={(e)=>setStepDeg(Number(e.target.value))} className="md:col-span-5 w-full"/>

          <Label>Gap: {gap}px</Label>
          <input type="range" min={0} max={24} value={gap} onChange={(e)=>setGap(Number(e.target.value))} className="md:col-span-5 w-full"/>

          <Label>Pitch: {pitch}°</Label>
          <input type="range" min={-20} max={20} value={pitch} onChange={(e)=>setPitch(Number(e.target.value))} className="md:col-span-5 w-full"/>

          <Label>Panel W: {panelW}vw</Label>
          <input type="range" min={12} max={28} value={panelW} onChange={(e)=>setPanelW(Number(e.target.value))} className="md:col-span-5 w-full"/>

          <div className="flex items-center gap-3">
            <input id="mask" type="checkbox" checked={maskOn} onChange={()=>setMaskOn(!maskOn)} />
            <Label>Concave mask</Label>
          </div>
          <div className="md:col-span-5 flex gap-2 text-xs">
            <button onClick={()=>{ if(busy) return; setMode('convex'); setRailAngle(-selected * stepDeg); }} className={`px-3 py-1 rounded ${mode==='convex'?'bg-white/20':'bg-white/5'}`}>Fisheye normal (convexo)</button>
            <button onClick={()=>{ if(busy) return; setMode('concave'); setRailAngle(selected * stepDeg); }} className={`px-3 py-1 rounded ${mode==='concave'?'bg-white/20':'bg-white/5'}`}>Invertido (cóncavo)</button>
          </div>
        </div>
      )}

      {/* Escena */}
      <div className="relative w-full max-w-6xl h-[58vh] md:h-[62vh]" style={{ perspective: '1600px' }}>
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-transparent via-white/5 to-white/10 blur-3xl pointer-events-none" />

        {/* Rail animado */}
        <motion.div
          className="relative w-full h-full mx-auto"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateX: pitch, rotateY: railAngle }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          onAnimationComplete={() => setBusy(false)}
        >
          {panels.map((p, i) => {
            const rel = i - selected; // desplazamiento relativo
            const theta = i * stepDeg; // ángulo fijo por índice
            const xTight = gap * Math.sin((rel * stepDeg) * (Math.PI/180)); // simetría real
            const zIndex = 100 - Math.abs(rel);

            return (
              <motion.button
                key={p.id}
                onClick={() => goTo(i)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0b0f17] rounded-[22px]"
                style={{
                  width: `${panelW}vw`,
                  minWidth: 220,
                  maxWidth: 360,
                  height: '85%',
                  transformStyle: 'preserve-3d',
                  zIndex,
                  cursor: busy ? 'default' : 'pointer',
                }}
                disabled={busy}
                aria-label={`Panel ${i + 1}: ${p.title}`}
                aria-current={i === selected ? 'true' : 'false'}
              >
                <motion.div
                  className="w-full h-full shadow-2xl rounded-[22px] overflow-hidden"
                  style={{
                    transform:
                      mode === 'convex'
                        ? `translateX(${xTight}px) rotateY(${theta}deg) translateZ(${radius}px)`
                        : `translateX(${xTight}px) rotateY(${-theta}deg) translateZ(${-radius}px)`,
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    willChange: 'transform',
                    ...(maskOn
                      ? {
                          WebkitMaskImage:
                            'radial-gradient(120% 60% at 50% -10%, transparent 0 36%, #000 38%),' +
                            'radial-gradient(120% 60% at 50% 110%, transparent 0 36%, #000 38%)',
                          WebkitMaskComposite: 'source-over',
                          maskImage:
                            'radial-gradient(120% 60% at 50% -10%, transparent 0 36%, #000 38%),' +
                            'radial-gradient(120% 60% at 50% 110%, transparent 0 36%, #000 38%)',
                        }
                      : {}),
                  }}
                  transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                >
                  {/* Hit proxy para clicks confiables */}
                  <div className="absolute inset-0 pointer-events-auto" onClick={() => goTo(i)} />

                  <div
                    className={`relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-br ${p.gradient || 'from-gray-700 to-gray-900'}`}
                    style={{
                      border: i === selected ? '2px solid rgba(120,180,255,0.8)' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Card number badge */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                      <span className="text-sm font-bold text-white/90">#{i + 1}</span>
                    </div>

                    {/* Center content area */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"></div>
                    </div>

                    {/* Bottom info */}
                    <div className="text-left w-full">
                      {p.author && (
                        <div className="text-xs opacity-70 mb-1">by {p.author}</div>
                      )}
                      <div className="font-semibold tracking-wide text-lg">{p.title}</div>
                      {i === selected && (
                        <div className="text-xs opacity-60 mt-2">Click otra para navegar</div>
                      )}
                    </div>
                  </div>

                  {/* Decor glow sin capturar puntero */}
                  <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-60"
                       style={{
                         background:
                           i === selected
                             ? 'radial-gradient(110% 80% at 50% 10%, rgba(120,200,255,0.25), transparent 55%), linear-gradient(90deg, rgba(90,150,255,0.2), transparent 35%, transparent 65%, rgba(90,150,255,0.2))'
                             : 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent 30%, transparent 70%, rgba(255,255,255,0.06))',
                       }}
                  />
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex gap-3 items-center">
        <button
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={()=>goTo(selected - 1)}
          disabled={busy || selected === 0}
          aria-label="Anterior"
        >
          ◀ Anterior
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={()=>goTo(selected + 1)}
          disabled={busy || selected === panels.length - 1}
          aria-label="Siguiente"
        >
          Siguiente ▶
        </button>
      </div>

      {/* Indicator dots */}
      <div className="mt-4 flex items-center gap-2">
        {panels.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            disabled={busy}
            className={`h-2 rounded-full transition-all outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 ${
              i === selected ? "bg-cyan-400 w-8" : "bg-white/30 w-2 hover:bg-white/50"
            }`}
            aria-label={`Ir a panel ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-wide opacity-70">{children}</div>;
}
