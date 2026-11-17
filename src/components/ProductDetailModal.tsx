import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
import { Product, Shade } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedShade(product.shades && product.shades.length > 0 ? product.shades[0] : undefined);
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedShade);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedShade);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white shadow-2xl border border-[#EADBCE] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 z-10 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors border border-stone-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto md:overflow-hidden">
          
          {/* Left Column: Product Image */}
          <div className="md:col-span-6 bg-[#FAF7F5] relative p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#EFE5DC]">
            <div className="relative w-full aspect-[4/3] md:aspect-square overflow-hidden shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-white/95 text-stone-900 text-[10px] uppercase tracking-widest px-2.5 py-1 border border-stone-200">
                {product.volume}
              </div>
            </div>
          </div>

          {/* Right Column: Product Purchase Module */}
          <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="uppercase tracking-[0.2em] font-medium text-[#C5A059]">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-mono text-stone-700 font-medium">({product.reviewsCount} reseñas)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 leading-tight">
                  {product.name}
                </h2>
                <p className="text-xs text-stone-500 font-light mt-1">
                  {product.subtitle}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1 border-b border-stone-100 pb-3">
                <span className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
                  ${product.price.toFixed(2)} USD
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-mono text-stone-400 line-through tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 ml-auto font-medium">
                  En Stock · Listo para envío
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 font-light leading-relaxed">
                {product.description}
              </p>

              {/* Shade Selector (if applicable) */}
              {product.shades && product.shades.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700 uppercase tracking-wider">Tono seleccionado:</span>
                    <span className="text-stone-900 font-semibold">{selectedShade?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.shades.map((shade) => {
                      const isSelected = selectedShade?.id === shade.id;
                      return (
                        <button
                          key={shade.id}
                          onClick={() => setSelectedShade(shade)}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-all border ${
                            isSelected
                              ? 'border-stone-900 bg-stone-50 shadow-sm'
                              : 'border-stone-200 hover:border-stone-400 bg-white'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: shade.hex }}
                          />
                          <span className="truncate max-w-[120px]">{shade.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Finish & Skin Type */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-[#FAF7F5] p-3 border border-[#F0E6DE]">
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Acabado</span>
                  <span className="text-stone-800 font-medium">{product.finish}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">Tipo de piel</span>
                  <span className="text-stone-800 font-medium">{product.skinType}</span>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs uppercase tracking-wider font-medium text-stone-700 block">
                  Beneficios Clave:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-600">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action Bar */}
            <div className="space-y-3 pt-6 border-t border-stone-100 mt-4">
              <div className="flex items-center gap-3">
                {/* Quantity stepper */}
                <div className="flex items-center border border-stone-300 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Disminuir cantidad"
                    className="px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-mono font-semibold text-stone-900 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumentar cantidad"
                    className="px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 text-xs uppercase tracking-[0.16em] font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    addedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-900 hover:bg-[#C5A059] text-white shadow-sm'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Añadido a tu bolsa!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#F3E7C4]" />
                      <span>Añadir a mi Bolsa · ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Checkout Button */}
              <button
                onClick={handleBuyNow}
                className="w-full py-2.5 text-xs uppercase tracking-[0.18em] font-medium text-stone-900 bg-[#F5E6DC] hover:bg-[#ECD9CC] transition-colors text-center border border-[#E0D0C2]"
              >
                Comprar Ahora con 1 Clic
              </button>

              {/* Trust Badges */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                  Envío gratis &gt; $50
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  Pago Seguro SSL
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
                  Garantía 30 días
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
