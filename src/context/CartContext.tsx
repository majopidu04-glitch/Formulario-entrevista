import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Shade, OrderReceipt } from '../types';
import { COUPONS, PRODUCTS } from '../data/products';

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'info';
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  appliedCoupon: string | null;
  couponMessage: string | null;
  couponError: string | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  selectedProductForDetail: Product | null;
  toasts: ToastMessage[];
  completedOrder: OrderReceipt | null;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  freeShippingProgress: number;
  addToCart: (product: Product, quantity?: number, shade?: Shade) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setSelectedProductForDetail: (product: Product | null) => void;
  setCompletedOrder: (order: OrderReceipt | null) => void;
  dismissToast: (id: string) => void;
  showToast: (title: string, description: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 50.00;
const STANDARD_SHIPPING_FEE = 4.99;
const CART_STORAGE_KEY = 'glow_beauty_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed: CartItem[] = JSON.parse(saved);
      return parsed.map((item) => {
        const freshProduct = PRODUCTS.find((p) => p.id === item.productId);
        return freshProduct ? { ...item, product: freshProduct } : item;
      });
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderReceipt | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Local storage fallback
    }
  }, [items]);

  const showToast = (title: string, description: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, description, type: 'success' }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1, shade?: Shade) => {
    const selectedShade = shade || (product.shades && product.shades.length > 0 ? product.shades[0] : undefined);
    const cartItemId = `${product.id}-${selectedShade?.id || 'default'}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: cartItemId,
            productId: product.id,
            product,
            quantity,
            selectedShade
          }
        ];
      }
    });

    showToast(
      'Añadido a la bolsa',
      `${quantity}x ${product.name}${selectedShade ? ` (${selectedShade.name})` : ''}`
    );
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponMessage(null);
    setCouponError(null);
  };

  const applyCoupon = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setCouponError('Por favor ingresa un código.');
      return false;
    }
    const coupon = COUPONS[trimmed];
    if (coupon) {
      setAppliedCoupon(trimmed);
      setCouponMessage(`Cupón ${trimmed} aplicado: ${coupon.description}`);
      setCouponError(null);
      showToast('¡Cupón aplicado!', coupon.description);
      return true;
    } else {
      setCouponError('El código no es válido o ha expirado. Prueba con GLOW10');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
    setCouponError(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discount = 0;
  if (appliedCoupon && COUPONS[appliedCoupon]) {
    const c = COUPONS[appliedCoupon];
    if (c.discountPercent) {
      discount = (subtotal * c.discountPercent) / 100;
    } else if (c.discountFixed) {
      discount = Math.min(subtotal, c.discountFixed);
    }
  }

  const shippingCost = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shippingCost,
        total,
        appliedCoupon,
        couponMessage,
        couponError,
        isCartOpen,
        isCheckoutOpen,
        selectedProductForDetail,
        toasts,
        completedOrder,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        remainingForFreeShipping,
        freeShippingProgress,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        setIsCartOpen,
        setIsCheckoutOpen,
        setSelectedProductForDetail,
        setCompletedOrder,
        dismissToast,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
