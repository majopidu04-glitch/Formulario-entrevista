import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onSelectCategory?: (category: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectCategory, onOpenSearch }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (catId?: string, anchor?: string) => {
    if (catId && onSelectCategory) {
      onSelectCategory(catId);
    }
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0E6DE] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark (Single text element in luxury display font) */}
          <a
            href="#"
            className="flex items-center gap-2 text-2xl sm:text-3xl font-serif tracking-[0.2em] uppercase text-stone-900 whitespace-nowrap shrink-0 transition-opacity hover:opacity-85"
          >
            <span className="font-light">GLOW</span>
            <span className="font-semibold text-[#C5A059]">BEAUTY</span>
          </a>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.18em] font-medium text-stone-600">
            <button
              onClick={() => handleNavClick('todos', 'catalogo')}
              className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
            >
              Colección
            </button>
            <button
              onClick={() => handleNavClick('rostro', 'catalogo')}
              className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
            >
              Rostro
            </button>
            <button
              onClick={() => handleNavClick('labios', 'catalogo')}
              className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
            >
              Labios
            </button>
            <button
              onClick={() => handleNavClick('iluminadores', 'catalogo')}
              className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
            >
              Iluminadores
            </button>
            <button
              onClick={() => handleNavClick(undefined, 'filosofia')}
              className="hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C5A059]"
            >
              Filosofía
            </button>
          </nav>

          {/* Zone 3: Primary Action (Interactive Bag Trigger & Search) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                aria-label="Buscar productos"
                className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Bolsa de compras con ${itemCount} artículos`}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-white bg-stone-900 hover:bg-[#C5A059] rounded-none transition-all duration-300 shadow-sm whitespace-nowrap shrink-0 group"
            >
              <ShoppingBag className="w-4 h-4 text-[#F3E7C4] group-hover:text-white transition-colors" />
              <span className="hidden sm:inline">Bolsa</span>
              <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-[#C5A059] text-white group-hover:bg-stone-900 rounded-full transition-colors">
                {itemCount}
              </span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-900"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FAF7F5] px-6 py-5 space-y-4 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium tracking-wider uppercase text-stone-700">
            <button
              onClick={() => handleNavClick('todos', 'catalogo')}
              className="text-left py-2 hover:text-[#C5A059] transition-colors border-b border-stone-200/50"
            >
              Colección Completa
            </button>
            <button
              onClick={() => handleNavClick('rostro', 'catalogo')}
              className="text-left py-2 hover:text-[#C5A059] transition-colors border-b border-stone-200/50"
            >
              Rostro & Base
            </button>
            <button
              onClick={() => handleNavClick('labios', 'catalogo')}
              className="text-left py-2 hover:text-[#C5A059] transition-colors border-b border-stone-200/50"
            >
              Labiales & Tintas
            </button>
            <button
              onClick={() => handleNavClick('iluminadores', 'catalogo')}
              className="text-left py-2 hover:text-[#C5A059] transition-colors border-b border-stone-200/50"
            >
              Iluminadores
            </button>
            <button
              onClick={() => handleNavClick('ojos', 'catalogo')}
              className="text-left py-2 hover:text-[#C5A059] transition-colors border-b border-stone-200/50"
            >
              Paletas de Ojos
            </button>
            <button
              onClick={() => handleNavClick(undefined, 'filosofia')}
              className="text-left py-2 hover:text-[#C5A059] transition-colors"
            >
              Filosofía & Compromiso
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
