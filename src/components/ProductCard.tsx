import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product, Shade } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart } = useCart();
  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    product.shades && product.shades.length > 0 ? product.shades[0] : undefined
  );
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedShade);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col bg-white border border-[#EFE5DC] hover:border-[#C5A059]/60 transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] bg-[#F7F3EF] overflow-hidden">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50/50 p-6 text-center">
            <span className="font-serif text-lg text-stone-700 italic">{product.name}</span>
            <span className="text-xs text-[#C5A059] mt-1">Glow Beauty</span>
          </div>
        )}

        {/* Subtle top indicator if featured or on discount */}
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-[#1C1917]/90 text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
            Edición Especial
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="flex-1 py-2 px-3 text-xs uppercase tracking-wider font-medium text-stone-900 bg-white hover:bg-stone-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Detalle</span>
          </button>
          
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className={`flex-1 py-2 px-3 text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-900 hover:bg-[#C5A059] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Añadido</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#F3E7C4]" />
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
        <div>
          {/* Unboxed clean metadata (Zero-pill discipline) */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#A67C38]">
              {product.categoryLabel}
            </span>
            <div className="flex items-center gap-1 text-stone-600">
              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="font-mono text-xs">{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-stone-900 font-sans tracking-tight group-hover:text-[#C5A059] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Brief descriptive subtitle */}
          <p className="text-xs text-stone-500 font-light mt-1 line-clamp-1">
            {product.subtitle}
          </p>
        </div>

        {/* Shades Palette Swatches (if available) */}
        {product.shades && product.shades.length > 1 && (
          <div className="pt-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 mr-1">Tonos:</span>
            <div className="flex items-center gap-1.5">
              {product.shades.map((shade) => {
                const isSelected = selectedShade?.id === shade.id;
                return (
                  <button
                    key={shade.id}
                    title={shade.name}
                    onClick={() => setSelectedShade(shade)}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#C5A059] ring-offset-1 scale-110 border-stone-400'
                        : 'border-stone-300 opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: shade.hex }}
                    aria-label={`Seleccionar tono ${shade.name}`}
                  />
                );
              })}
            </div>
            {selectedShade && (
              <span className="text-[11px] text-stone-500 font-light ml-auto truncate max-w-[100px]">
                {selectedShade.name}
              </span>
            )}
          </div>
        )}

        {/* Price and Add button footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold font-mono tabular-nums text-stone-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs font-mono tabular-nums text-stone-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <span className="text-xs tracking-wider uppercase text-stone-500 group-hover:text-stone-900 transition-colors">
            Ver detalles &rarr;
          </span>
        </div>

      </div>
    </article>
  );
};
