"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, Send, Loader2 } from "lucide-react";

// Dynamic import to avoid SSR issues with Three.js
const CoverflowThree = dynamic(
  () => import("@/components/ui/CoverflowThree"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] flex items-center justify-center bg-[#0a0a10] rounded-2xl">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    ),
  }
);

export default function PlaceStart2Page() {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    // TODO: Integrate with your invitation generation logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a10] via-[#121222] to-[#0a0a10] text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Coverflow 3D - React Three Fiber</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
              Create <Sparkles className="inline-block w-12 h-12 md:w-16 md:h-16 text-cyan-400" /> Magic
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              With Real 3D Technology
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience a true 3D carousel powered by React Three Fiber.
            Watch as invitation cards rotate in stunning cylindrical formation with realistic lighting and shadows.
          </p>
        </div>
      </section>

      {/* 3D Carousel Section */}
      <section className="relative px-6 py-8 max-w-7xl mx-auto">
        <Suspense
          fallback={
            <div className="w-full h-[520px] flex items-center justify-center bg-[#0a0a10] rounded-2xl">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                <p className="text-gray-400">Cargando carrusel 3D...</p>
              </div>
            </div>
          }
        >
          <CoverflowThree />
        </Suspense>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Real 3D Rendering</h3>
            <p className="text-gray-400">
              Powered by Three.js and React Three Fiber for authentic 3D depth and perspective.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Dynamic Lighting</h3>
            <p className="text-gray-400">
              Realistic shadows, ambient lighting, and glowing effects on active cards.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Smooth Interactions</h3>
            <p className="text-gray-400">
              Click any card to rotate, auto-play feature, and keyboard navigation support.
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

      {/* Technical Details */}
      <section className="relative px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Stats */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Built with{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Cutting-Edge Tech
              </span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              This 3D carousel uses WebGL rendering through Three.js, providing hardware-accelerated
              graphics for smooth 60fps animations even on mobile devices.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-cyan-400">60 FPS</div>
                <div className="text-sm text-gray-400">Smooth Animation</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-purple-400">WebGL</div>
                <div className="text-sm text-gray-400">GPU Accelerated</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-amber-400">2048px</div>
                <div className="text-sm text-gray-400">Shadow Quality</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-rose-400">5s</div>
                <div className="text-sm text-gray-400">Auto Rotation</div>
              </div>
            </div>
          </div>

          {/* Right Side - Tech Stack */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6">Tech Stack</h3>
              <div className="space-y-3">
                {[
                  { name: "React Three Fiber", desc: "React renderer for Three.js" },
                  { name: "Three.js", desc: "WebGL 3D graphics library" },
                  { name: "@react-three/drei", desc: "Useful helpers & components" },
                  { name: "Framer Motion", desc: "Smooth spring animations" },
                  { name: "Next.js 14", desc: "React framework with App Router" },
                ].map((tech, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-white">{tech.name}</div>
                      <div className="text-sm text-gray-400">{tech.desc}</div>
                    </div>
                  </div>
                ))}
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
            Join hundreds of users creating stunning digital invitations with cutting-edge 3D technology.
          </p>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold">Artify 3D</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <a href="/placestart" className="hover:text-cyan-400 transition-colors">Version 1 (CSS 3D)</a>
              <a href="/placestart_2" className="hover:text-cyan-400 transition-colors">Version 2 (Three.js)</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Gallery</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Community</a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            © 2024 Artify. Powered by React Three Fiber & Next.js 14.
          </div>
        </div>
      </footer>
    </div>
  );
}
