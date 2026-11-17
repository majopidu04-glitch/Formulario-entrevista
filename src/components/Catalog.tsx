import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ProductCard } from './ProductCard';

interface CatalogProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenDetail: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onOpenDetail,
  searchQuery,
  setSearchQuery
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.finish.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Colección Exclusiva</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight">
          Nuestras Creaciones
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
          Cada producto Glow Beauty ha sido formulado con ingredientes activos puros y envasado en nuestra emblemática paleta de oro y rosa pálido.
        </p>
      </div>

      {/* Controls Bar: Category tabs + Search + Sort */}
      <div className="space-y-6 mb-10">
        
        {/* Interactive Category Tabs (Functional buttons as per frontend-design constitution) */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white font-medium shadow-sm'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-[#EADBCE] hover:border-[#C5A059]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-stone-200/70">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por labial, iluminador, tono, acabado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#E0D4C7] focus:outline-none focus:border-[#C5A059] text-stone-900 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results count & Sort Select */}
          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
            <span className="text-stone-500 font-light">
              Mostrando <strong className="font-mono text-stone-900">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs bg-white border border-[#E0D4C7] focus:outline-none focus:border-[#C5A059] text-stone-800"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Calificados</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Product Grid (3-column desktop layout adhering to ecommerce reference) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 p-12 text-center space-y-4 max-w-md mx-auto">
          <p className="font-serif text-lg text-stone-800">
            No se encontraron productos para "{searchQuery}"
          </p>
          <p className="text-xs text-stone-500 font-light">
            Prueba buscando con otros términos o selecciona otra categoría.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('todos');
            }}
            className="px-5 py-2 text-xs uppercase tracking-wider font-medium text-stone-900 border border-stone-300 hover:border-stone-900 transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

    </section>
  );
};
