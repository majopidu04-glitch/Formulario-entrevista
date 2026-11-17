export interface Shade {
  id: string;
  name: string;
  hex: string;
  previewColor?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'labios' | 'rostro' | 'iluminadores' | 'ojos' | 'cuidado';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  finish: string;
  skinType: string;
  volume: string;
  benefits: string[];
  shades?: Shade[];
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedShade?: Shade;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  deliveryNotes?: string;
  shippingMethod: 'standard' | 'express';
}

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export type PaymentMethodType = 'card' | 'paypal' | 'apple_pay' | 'transfer';

export interface OrderReceipt {
  orderNumber: string;
  date: string;
  items: CartItem[];
  shippingDetails: ShippingDetails;
  paymentMethod: PaymentMethodType;
  cardLast4?: string;
  subtotal: number;
  discount: number;
  couponApplied?: string;
  shippingCost: number;
  total: number;
}
