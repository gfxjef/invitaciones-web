"use client";

import { useState } from "react";
import Carousel3D from "@/components/ui/Carousel3D";
import { Button } from "@/components/ui/button";
import { Sparkles, Mic, Send } from "lucide-react";

export default function PlaceStartPage() {
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
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
              Create <Sparkles className="inline-block w-12 h-12 md:w-16 md:h-16 text-cyan-400" /> Magic
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              With Words Turned Into Art
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Type your idea, pick a style, and watch it transform into stunning digital art.
          </p>
        </div>
      </section>

      {/* 3D Carousel Section */}
      <Carousel3D />

      {/* Prompt Input Section */}
      <section className="relative px-6 py-16 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a prompt..."
              className="w-full px-6 py-5 pr-32 text-lg bg-[#1a1a2e] border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-500 transition-all"
              aria-label="Ingresa tu idea para crear arte"
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

      {/* Where Art Meets Intelligence Section */}
      <section className="relative px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image/Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700">
              <div className="aspect-square bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full opacity-90 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Where Art{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Meets Intelligence
              </span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Artify explores the intersection of creativity and machine learning,
              bringing together artists, developers, and AI enthusiasts to push the
              boundaries of what's possible in digital art generation.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-cyan-400">10K+</div>
                <div className="text-sm text-gray-400">Artworks Created</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-purple-400">500+</div>
                <div className="text-sm text-gray-400">Active Artists</div>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Join the Community
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold">Artify</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-cyan-400 transition-colors">Discover</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Gallery</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Formats</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Community</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            © 2024 Artify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
