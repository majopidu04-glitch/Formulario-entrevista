import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    shippingCost,
    total,
    appliedCoupon,
    couponMessage,
    couponError,
    applyCoupon,
    removeCoupon,
    remainingForFreeShipping,
    freeShippingProgress,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyCoupon(couponInput)) {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EFE5DC] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-base font-serif uppercase tracking-[0.2em] font-medium text-stone-900">
                Tu Bolsa de Compras
              </h2>
              <span className="text-xs font-mono text-stone-500">
                ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Cerrar bolsa"
              className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3.5 bg-[#FFF9F9] border-b border-[#F7EBEB] text-xs">
            <div className="flex items-center justify-between mb-1.5">
              {remainingForFreeShipping > 0 ? (
                <span className="text-stone-600 font-light">
                  Te faltan <strong className="font-semibold text-stone-900 font-mono">${remainingForFreeShipping.toFixed(2)}</strong> para envío gratis
                </span>
              ) : (
                <span className="text-emerald-800 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  ¡Felicidades! Tienes Envío Express Gratuito
                </span>
              )}
              <span className="font-mono text-stone-500">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E5C378] to-[#C5A059] transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F5] flex items-center justify-center border border-[#F0E6DE]">
                  <ShoppingBag className="w-8 h-8 text-stone-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-stone-800">Tu bolsa está vacía</h3>
                  <p className="text-xs text-stone-500 font-light mt-1 max-w-xs">
                    Explora nuestras creaciones exclusivas de maquillaje y resalta tu luz natural.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 text-xs uppercase tracking-wider font-medium text-stone-900 border border-stone-300 hover:border-[#C5A059] transition-colors"
                >
                  Continuar explorando
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <div className="w-18 h-18 bg-[#FAF7F5] border border-stone-200 overflow-hidden shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 truncate">
                      {item.product.name}
                    </h4>

                    {item.selectedShade && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block"
                          style={{ backgroundColor: item.selectedShade.hex }}
                        />
                        <span className="truncate">{item.selectedShade.name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-stone-200 bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-500 hover:text-stone-900 transition-colors text-xs"
                          aria-label="Disminuir"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-medium text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-500 hover:text-stone-900 transition-colors text-xs"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-semibold font-mono text-stone-900 tabular-nums">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Eliminar ${item.product.name}`}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 bg-[#FAF7F5] px-6 py-5 space-y-4">
              
              {/* Coupon input */}
              <div className="space-y-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{couponMessage}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold ml-2 underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón (ej: GLOW10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-stone-300 focus:outline-none focus:border-[#C5A059] bg-white uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-stone-800 bg-stone-200 hover:bg-stone-300 transition-colors shrink-0"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-light">{couponError}</p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-stone-900">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Descuento aplicado</span>
                    <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Envío Express</span>
                  <span className="font-mono tabular-nums text-stone-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-medium">GRATIS</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
                  <span className="font-serif text-base">Total a Pagar</span>
                  <span className="font-mono tabular-nums text-base">${total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 text-xs uppercase tracking-[0.2em] font-medium text-white bg-stone-900 hover:bg-[#C5A059] transition-all duration-300 shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Finalizar Compra Segura</span>
                <ArrowRight className="w-4 h-4 text-[#F3E7C4] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Security reassure */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Transacciones cifradas con seguridad bancaria SSL 256 bits</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
