import React from 'react';
import { Sparkles, Droplets, HeartHandshake, ShieldCheck } from 'lucide-react';

export const BrandPhilosophy: React.FC = () => {
  return (
    <section id="filosofia" className="bg-[#FAF7F5] border-y border-[#EADBCE] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuestra Razón de Ser</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight">
            La Filosofía Glow Beauty
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            Creemos que el maquillaje no debe enmascarar tu belleza, sino ser una extensión 
            armoniosa de tu propia piel. Diseñado con una estética sobria y minimalista.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Pillar 1 */}
          <div className="bg-white p-8 border border-[#EFE5DC] space-y-4 hover:border-[#C5A059]/60 transition-colors shadow-xs">
            <div className="text-xs font-serif font-light text-[#C5A059] tracking-widest uppercase">
              01. Pureza Botánica
            </div>
            <h3 className="text-xl font-serif text-stone-900">
              Cuidado y Maquillaje en Simbiosis
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              Cada fórmula está enriquecida con activos dermatológicos: escualano vegetal, ácido hialurónico 
              y extractos de flores silvestres que nutren tu barrera cutánea a lo largo del día.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 border border-[#EFE5DC] space-y-4 hover:border-[#C5A059]/60 transition-colors shadow-xs">
            <div className="text-xs font-serif font-light text-[#C5A059] tracking-widest uppercase">
              02. Estética Sobria
            </div>
            <h3 className="text-xl font-serif text-stone-900">
              Lujo en Oro, Rosa y Blanco
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              Nuestros envases de vidrio satinado y cierres magnéticos dorados han sido concebidos 
              como objetos de arte para tu tocador. Un diseño libre de artificios innecesarios.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-8 border border-[#EFE5DC] space-y-4 hover:border-[#C5A059]/60 transition-colors shadow-xs">
            <div className="text-xs font-serif font-light text-[#C5A059] tracking-widest uppercase">
              03. Compromiso Ético
            </div>
            <h3 className="text-xl font-serif text-stone-900">
              100% Vegano & Cruelty-Free
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              Certificados internacionalmente libres de testeo animal. Fabricamos en pequeños lotes 
              para garantizar la frescura de los ingredientes botánicos y el mínimo impacto ambiental.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
