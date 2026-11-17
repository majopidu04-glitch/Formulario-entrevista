import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Feather } from 'lucide-react';
import heroGlowImg from '../assets/images/hero_glow_beauty_luxury_1794328755795.jpg';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F5] via-[#FFF9F9] to-[#FAF7F5] border-b border-[#F0E6DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Statement & CTA */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6 text-left">
            
            {/* Quiet 1-line text kicker (NO PILL BADGE) */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-semibold">
              <span>Alta Cosmética Botánica</span>
              <span aria-hidden="true">·</span>
              <span>Edición 2026</span>
            </div>

            {/* Display Headline with balanced wrapping */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-stone-900 leading-[1.1] tracking-tight text-balance">
              El arte de resaltar tu <span className="italic font-normal text-[#C5A059]">luz natural</span>.
            </h1>

            {/* Prose description */}
            <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed max-w-xl">
              Fórmulas sedosas creadas con pigmentos minerales puros, extractos botánicos y 
              envases escultóricos en oro y rosa empolvado. Una experiencia de belleza minimalista, 
              intencional y luminosa.
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-white bg-stone-900 hover:bg-[#C5A059] transition-all duration-300 shadow-md group cursor-pointer"
              >
                <span>Descubrir Catálogo</span>
                <ArrowRight className="w-4 h-4 text-[#F3E7C4] group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#filosofia"
                className="inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-stone-800 hover:text-[#C5A059] border border-stone-300 hover:border-[#C5A059] transition-colors"
              >
                Nuestra Filosofía
              </a>
            </div>

            {/* Quiet trust credentials (Clean unboxed text separators) */}
            <div className="pt-6 border-t border-stone-200/70 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500 font-normal">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                100% Cruelty-Free & Vegano
              </span>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-[#C5A059]" />
                Pigmentos de Seda Mineral
              </span>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                Garantía Glow 30 días
              </span>
            </div>

          </div>

          {/* Right Column: Hero Showcase Imagery */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Subtle gold decorative backdrop frame */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#F5E6DC] via-[#FAF0EA] to-[#F7E7CE] opacity-60 rounded-2xl -rotate-1 transform scale-[0.98]"></div>

              {/* Main Campaign Image */}
              <div className="relative overflow-hidden rounded-xl border border-[#EADBCE] shadow-xl bg-white aspect-[16/10] sm:aspect-[16/11]">
                <img
                  src={heroGlowImg}
                  alt="Colección Glow Beauty en mármol y telas de seda blanca"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />

                {/* Subtle caption watermark banner */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-transparent p-5 text-white flex items-end justify-between">
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase font-light text-[#F3E7C4]">Línea Signature</p>
                    <p className="text-sm font-serif italic text-white/95">Colección Aurora & Velvet Nude</p>
                  </div>
                  <span className="text-[11px] font-mono tracking-wider text-stone-200 uppercase">
                    Envío gratis &gt; $50
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
