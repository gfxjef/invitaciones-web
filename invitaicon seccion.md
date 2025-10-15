import React, { useEffect, useRef, useState } from "react";

export default function ShareInviteModalPro() {
  const [slug, setSlug] = useState("RaulyDalia");
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState("idle");
  const debounceRef = useRef(null);

  const basicUrl = "http://localhost:3000/invitacion/229cef98";
  const premiumBaseUrl = "invitaciones.com/vo/";
  const price = 19;
  const originalPrice = 29;

  // Palabras reservadas
  const reserved = new Set(["admin", "api", "login", "boda", "invitacion"]);

  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const checkAvailability = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const clean = normalize(value);
    setSlug(clean);
    setChecking(true);
    setStatus("idle");

    debounceRef.current = setTimeout(() => {
      if (!clean || clean.length < 3) {
        setStatus("invalid");
        setChecking(false);
        return;
      }
      if (reserved.has(clean)) {
        setStatus("taken");
        setChecking(false);
        return;
      }
      if (clean.includes("2024")) {
        setStatus("taken");
      } else {
        setStatus("ok");
      }
      setChecking(false);
    }, 400);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const exampleSlugs = ["RaulyDalia", "BodaRaulDalia2025", "RyD2025"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Comparte tu invitación
          </h2>
          <p className="text-gray-600">
            Mejor visibilidad con URL personalizada
          </p>
        </div>

        {/* Comparativa de planes */}
        <div className="grid md:grid-cols-2 gap-6 relative">
          {/* PLAN BÁSICO - Neutro y discreto */}
          <div className="relative rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-gray-300">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Opción Básica
              </h3>
              <p className="text-sm text-gray-500">
                URL aleatoria • Menos recordable
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={basicUrl}
                  className="flex-1 px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono"
                />
                <button
                  onClick={() => copyToClipboard(basicUrl)}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Copiar
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Funciona, pero es difícil de recordar y compartir
              </p>

              {/* Lista de contras */}
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>Difícil de recordar para tus invitados</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>Se ve poco profesional en impresiones</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>Menos clics en WhatsApp e Instagram</span>
                </li>
              </ul>
            </div>

            <button className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors underline">
              Seguir con URL básica
            </button>
          </div>

          {/* PLAN PREMIUM - Oscuro y dramático como las referencias */}
          <div className="relative rounded-2xl overflow-hidden transform md:scale-105 transition-transform hover:scale-110">
            {/* Gradiente OSCURO profundo (como imagen 2 y 4) */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-800"></div>
            
            {/* Capa de brillo magenta */}
            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-600/40 via-purple-600/20 to-transparent"></div>
            
            {/* Glow effect - sombra neón */}
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-2xl blur-2xl opacity-60 animate-pulse"></div>

            {/* Contenido con glassmorphism sutil */}
            <div className="relative backdrop-blur-sm bg-black/20 p-6 border border-white/10 rounded-2xl">
              {/* Badge animado */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Opción Premium
                  <span className="text-2xl animate-pulse">✨</span>
                </h3>
                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg animate-bounce">
                  Más elegido
                </span>
              </div>

              <p className="text-sm text-white/90 mb-4 leading-relaxed">
                URL con sus nombres • Se ve profesional y es fácil de compartir
              </p>

              {/* Input personalizado con mejor contraste */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-white/90 mb-2">
                  Personaliza tu URL
                </label>
                <div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl overflow-hidden border border-purple-500/30 shadow-lg shadow-purple-500/20">
                  <span className="px-3 py-3 text-xs text-purple-300 font-mono bg-black/30">
                    {premiumBaseUrl}
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => checkAvailability(e.target.value)}
                    placeholder="RaulyDalia"
                    className="flex-1 px-3 py-3 bg-transparent text-white placeholder-purple-300/50 text-sm font-medium focus:outline-none"
                  />
                </div>

                {/* Estados de validación */}
                <div className="mt-2 min-h-[20px]">
                  {checking && (
                    <p className="text-xs text-white/70">Verificando...</p>
                  )}
                  {status === "ok" && (
                    <p className="text-xs text-emerald-300 font-medium">
                      ✅ Perfecto, está libre
                    </p>
                  )}
                  {status === "taken" && (
                    <p className="text-xs text-rose-300 font-medium">
                      ❌ Ya está tomado. Prueba RaulyDalia2025
                    </p>
                  )}
                  {status === "invalid" && (
                    <p className="text-xs text-amber-300 font-medium">
                      ⚠️ Usa solo letras, números y guiones
                    </p>
                  )}
                </div>

                {/* Pills de ejemplo con mejor contraste */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {exampleSlugs.map((example) => (
                    <button
                      key={example}
                      onClick={() => checkAvailability(example)}
                      className="px-2 py-1 bg-purple-500/30 hover:bg-purple-500/50 backdrop-blur-md text-white text-xs rounded-md transition-all border border-purple-400/30 hover:border-purple-400/60"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beneficios */}
              <ul className="space-y-2 my-5">
                <li className="flex items-start gap-2 text-sm text-white">
                  <span className="text-emerald-300 font-bold mt-0.5">✓</span>
                  <span className="font-medium">3x más clics en WhatsApp</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-white">
                  <span className="text-emerald-300 font-bold mt-0.5">✓</span>
                  <span className="font-medium">Se ve profesional en tarjetas impresas</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-white">
                  <span className="text-emerald-300 font-bold mt-0.5">✓</span>
                  <span className="font-medium">Incluye código QR personalizado</span>
                </li>
              </ul>

              {/* Pricing con mejor contraste */}
              <div className="flex items-end justify-between mb-4 pb-4 border-b border-purple-500/20">
                <div>
                  <div className="text-xs text-purple-300/70 line-through">
                    S/ {originalPrice}
                  </div>
                  <div className="text-3xl font-black text-white flex items-baseline gap-1">
                    <span className="text-yellow-300">S/</span>
                    {price}
                    <span className="text-sm font-normal text-purple-200">único</span>
                  </div>
                  <div className="text-xs text-emerald-300 font-medium mt-1">
                    💰 Ahorra S/ {originalPrice - price} hoy
                  </div>
                </div>
              </div>

              {/* CTA Principal - Amarillo brillante como las referencias */}
              <button className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 hover:from-yellow-300 hover:to-yellow-400 text-purple-950 font-bold text-base rounded-xl shadow-2xl shadow-yellow-500/50 transition-all transform hover:scale-105 hover:shadow-yellow-400/60">
                🔓 Desbloquear URL personalizada
              </button>

              {/* Trust signals con mejor legibilidad */}
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-purple-200/70 text-center">
                  ✓ Garantía 7 días • 1 cambio de nombre incluido
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className="text-[10px] text-purple-200/60">Pago seguro:</span>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-purple-500/30 backdrop-blur-sm rounded text-[9px] text-white font-medium border border-purple-400/30">
                      Izipay
                    </div>
                    <div className="px-2 py-1 bg-purple-500/30 backdrop-blur-sm rounded text-[9px] text-white font-medium border border-purple-400/30">
                      Yape
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prueba social */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            💜 <span className="font-semibold">9 de cada 10 parejas</span> eligen URL personalizada
          </p>
        </div>
      </div>
    </div>
  );
}