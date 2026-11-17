import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-[#1C1917] text-white text-xs py-2 px-4 border-b border-stone-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center gap-2">
        <span className="flex items-center gap-1.5 text-stone-200 font-light tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] inline-block shrink-0" />
          <span>Envío express gratuito en pedidos superiores a $50 USD</span>
          <span className="hidden sm:inline text-stone-500">|</span>
          <span className="hidden sm:inline text-[#D4AF37] font-medium">Usa el código GLOW10 para 10% OFF</span>
        </span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        aria-label="Cerrar anuncio"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
