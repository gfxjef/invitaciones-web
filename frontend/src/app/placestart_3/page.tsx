"use client";

import { useState } from "react";
import FisheyeWall3D from "@/components/ui/FisheyeWall3D";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, Send, Settings } from "lucide-react";

export default function PlaceStart3Page() {
  const [prompt, setPrompt] = useState("");
  const [showControls, setShowControls] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    // TODO: Integrate with your invitation generation logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f17] via-[#0e1524] to-[#0b0f17] text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Fisheye 3D Wall v3.3 - CSS Transforms</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
              Experience the{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Fisheye Effect
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A cylindrical 3D wall with robust click handling. Cards curve naturally with
            perspective transforms and smooth spring animations.
          </p>

          {/* Controls toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            {showControls ? "Ocultar" : "Mostrar"} Controles Avanzados
          </button>
        </div>
      </section>

      {/* 3D Fisheye Wall */}
      <section className="relative px-6 py-8 max-w-7xl mx-auto">
        <FisheyeWall3D showControls={showControls} />
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Robust Click Handling</h3>
            <p className="text-gray-400">
              Busy lock during animations prevents multi-clicks. Hit proxy ensures reliable interaction even with masks.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Cylindrical Layout</h3>
            <p className="text-gray-400">
              Cards arranged in a true cylinder with precise trigonometric positioning. Convex or concave modes available.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Spring Animations</h3>
            <p className="text-gray-400">
              Smooth, natural motion with Framer Motion springs. Stiffness and damping tuned for premium feel.
            </p>
          </div>
        </div>
      </section>

      {/* Prompt Input Section */}
      <section className="relative px-6 py-16 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a prompt to generate your invitation..."
              className="w-full px-6 py-5 pr-32 text-lg bg-[#1a1a2e] border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-500 transition-all"
              aria-label="Ingresa tu idea para crear invitación"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Grabar audio"
              >
                <Mic className="w-5 h-5 text-gray-300" />
              </button>
              <button
                type="submit"
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
                aria-label="Enviar prompt"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Technical Comparison */}
      <section className="relative px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Three Versions,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Three Approaches
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Explore different 3D carousel implementations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Version 1 */}
          <a
            href="/placestart"
            className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                v1
              </div>
              <h3 className="text-xl font-bold">CSS 3D Transform</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Classic coverflow effect using CSS transforms and Framer Motion.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Lightweight
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Spring animations
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                No dependencies
              </div>
            </div>
          </a>

          {/* Version 2 */}
          <a
            href="/placestart_2"
            className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                v2
              </div>
              <h3 className="text-xl font-bold">React Three Fiber</h3>
            </div>
            <p className="text-gray-400 mb-4">
              True 3D rendering with WebGL, lights, and shadows.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                WebGL powered
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Real lighting
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Shadow mapping
              </div>
            </div>
          </a>

          {/* Version 3 */}
          <div className="group bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-400/50 relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-cyan-400 text-[#0b0f17] px-2 py-1 rounded text-xs font-bold">
              ACTUAL
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                v3
              </div>
              <h3 className="text-xl font-bold">Fisheye 3D Wall</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Cylindrical wall with robust click handling and masks.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Robust clicks
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Cylindrical layout
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                Convex/Concave modes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent backdrop-blur-sm rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Your<br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              3D Invitation?
            </span>
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose the carousel style that best fits your vision. All three versions are production-ready.
          </p>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold">Artify 3D</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <a href="/placestart" className="hover:text-cyan-400 transition-colors">v1 - CSS 3D</a>
              <a href="/placestart_2" className="hover:text-cyan-400 transition-colors">v2 - Three.js</a>
              <a href="/placestart_3" className="hover:text-cyan-400 transition-colors">v3 - Fisheye</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Community</a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            © 2024 Artify. Fisheye 3D Wall v3.3 - Powered by Framer Motion.
          </div>
        </div>
      </footer>
    </div>
  );
}
