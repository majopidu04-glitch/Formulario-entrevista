import React, { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertCircle,
  Smartphone,
  Sparkles,
  Building2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ShippingDetails, CardDetails, PaymentMethodType, OrderReceipt } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    items,
    subtotal,
    discount,
    shippingCost,
    total,
    appliedCoupon,
    clearCart,
    setCompletedOrder
  } = useCart();

  // Multi-step flow: 'shipping' -> 'payment' -> 'processing' -> 'success'
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');

  // Form State: Shipping
  const [shippingData, setShippingData] = useState<ShippingDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    deliveryNotes: '',
    shippingMethod: 'standard'
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Form State: Card Details
  const [cardData, setCardData] = useState<CardDetails>({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Generated receipt
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  if (!isCheckoutOpen) return null;

  // Validation: Shipping
  const validateShipping = (): boolean => {
    const errors: Record<string, string> = {};
    if (!shippingData.fullName.trim()) errors.fullName = 'Ingresa tu nombre completo';
    if (!shippingData.email.trim() || !shippingData.email.includes('@')) {
      errors.email = 'Ingresa un correo electrónico válido';
    }
    if (!shippingData.phone.trim()) errors.phone = 'Ingresa un número telefónico de contacto';
    if (!shippingData.address.trim()) errors.address = 'Ingresa tu dirección de entrega';
    if (!shippingData.city.trim()) errors.city = 'Ingresa tu ciudad';
    if (!shippingData.zipCode.trim()) errors.zipCode = 'Ingresa tu código postal';

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation: Card
  const validateCard = (): boolean => {
    if (paymentMethod !== 'card') return true;
    const errors: Record<string, string> = {};
    const rawNumber = cardData.cardNumber.replace(/\s+/g, '');
    if (!rawNumber || rawNumber.length < 15) {
      errors.cardNumber = 'Ingresa los 16 dígitos de la tarjeta';
    }
    if (!cardData.cardHolder.trim()) {
      errors.cardHolder = 'Ingresa el nombre como figura en el plástico';
    }
    if (!cardData.expiry.trim() || !cardData.expiry.includes('/')) {
      errors.expiry = 'Formato MM/AA';
    }
    if (!cardData.cvv.trim() || cardData.cvv.length < 3) {
      errors.cvv = '3 o 4 dígitos';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardData({ ...cardData, cardNumber: val });
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardData({ ...cardData, expiry: val });
  };

  // Format CVV (Max 4 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardData({ ...cardData, cvv: val });
  };

  // Transition to Payment
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  // Submit and simulate real banking authorization
  const handleProcessTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;

    setStep('processing');

    // Simulate real banking gateway authorization latency
    setTimeout(() => {
      const generatedOrderNum = `GB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderReceipt: OrderReceipt = {
        orderNumber: generatedOrderNum,
        date: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        items: [...items],
        shippingDetails: { ...shippingData },
        paymentMethod,
        cardLast4: paymentMethod === 'card' ? cardData.cardNumber.replace(/\s/g, '').slice(-4) || '8842' : undefined,
        subtotal,
        discount,
        couponApplied: appliedCoupon || undefined,
        shippingCost,
        total
      };

      setReceipt(orderReceipt);
      setCompletedOrder(orderReceipt);
      clearCart();
      setStep('success');
    }, 2400);
  };

  // Download printable / plain-text order receipt
  const handleDownloadReceipt = () => {
    if (!receipt) return;
    const content = `
=====================================================
            GLOW BEAUTY - RECIBO DE COMPRA
         Alta Cosmética Botánica & Lujo Silencioso
=====================================================

NÚMERO DE ORDEN: ${receipt.orderNumber}
FECHA: ${receipt.date}
ESTADO: Pago Confirmado y Autorizado
MÉTODO DE PAGO: ${receipt.paymentMethod.toUpperCase()} ${receipt.cardLast4 ? `(Terminación ${receipt.cardLast4})` : ''}

-----------------------------------------------------
DETALLES DEL CLIENTE Y ENVÍO:
-----------------------------------------------------
Nombre: ${receipt.shippingDetails.fullName}
Email: ${receipt.shippingDetails.email}
Teléfono: ${receipt.shippingDetails.phone}
Dirección: ${receipt.shippingDetails.address} ${receipt.shippingDetails.apartment || ''}
Ciudad/CP: ${receipt.shippingDetails.city}, ${receipt.shippingDetails.zipCode}
País: ${receipt.shippingDetails.country}

-----------------------------------------------------
PRODUCTOS ADQUIRIDOS:
-----------------------------------------------------
${receipt.items
  .map(
    (item, i) =>
      `${i + 1}. ${item.product.name} ${item.selectedShade ? `[Tono: ${item.selectedShade.name}]` : ''}
   Cantidad: ${item.quantity} x $${item.product.price.toFixed(2)} = $${(item.quantity * item.product.price).toFixed(2)} USD`
  )
  .join('\n\n')}

-----------------------------------------------------
DESGLOSE FINANCIERO:
-----------------------------------------------------
Subtotal: $${receipt.subtotal.toFixed(2)} USD
${receipt.discount > 0 ? `Descuento (${receipt.couponApplied || 'Cupón'}): -$${receipt.discount.toFixed(2)} USD\n` : ''}Envío Express: ${receipt.shippingCost === 0 ? 'GRATIS' : `$${receipt.shippingCost.toFixed(2)} USD`}
TOTAL PAGADO: $${receipt.total.toFixed(2)} USD

-----------------------------------------------------
¡Gracias por confiar en Glow Beauty!
Tu pedido está siendo empaquetado cuidadosamente con
nuestros estándares de lujo sustentable.
Soporte: atencion@glowbeauty.com
=====================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recibo_GlowBeauty_${receipt.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('shipping');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white shadow-2xl border border-[#EADBCE] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Brand & Security Banner */}
        <div className="bg-[#FAF7F5] border-b border-[#EFE5DC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C1917] flex items-center justify-center text-[#D4AF37]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif tracking-[0.2em] uppercase font-semibold text-stone-900">
                Glow Beauty · Pasarela Segura
              </h2>
              <p className="text-[11px] text-stone-500 font-light flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                Cifrado SSL de 256 bits · Certificado PCI-DSS
              </p>
            </div>
          </div>

          {step !== 'processing' && (
            <button
              onClick={handleClose}
              aria-label="Cerrar pasarela"
              className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Tracker (except when on success) */}
        {step !== 'success' && step !== 'processing' && (
          <div className="bg-white border-b border-stone-100 px-6 py-3 flex items-center justify-center gap-6 text-xs font-medium uppercase tracking-wider">
            <span
              className={`flex items-center gap-2 pb-1 ${
                step === 'shipping'
                  ? 'text-[#C5A059] border-b-2 border-[#C5A059]'
                  : 'text-stone-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Envío</span>
            </span>
            <span className="text-stone-300">/</span>
            <span
              className={`flex items-center gap-2 pb-1 ${
                step === 'payment'
                  ? 'text-[#C5A059] border-b-2 border-[#C5A059]'
                  : 'text-stone-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Pago Seguro</span>
            </span>
          </div>
        )}

        {/* STEP 1: Shipping Details */}
        {step === 'shipping' && (
          <form onSubmit={handleContinueToPayment} className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-lg font-serif text-stone-900">Información de Envío</h3>
              <p className="text-xs text-stone-500">¿A dónde enviamos tus piezas de Glow Beauty?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  placeholder="Ej: María José Rodríguez"
                  value={shippingData.fullName}
                  onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                  className={`w-full px-3 py-2.5 border bg-white focus:outline-none focus:border-[#C5A059] ${
                    shippingErrors.fullName ? 'border-rose-400' : 'border-stone-300'
                  }`}
                />
                {shippingErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{shippingErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  placeholder="ejemplo@glow.com"
                  value={shippingData.email}
                  onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                  className={`w-full px-3 py-2.5 border bg-white focus:outline-none focus:border-[#C5A059] ${
                    shippingErrors.email ? 'border-rose-400' : 'border-stone-300'
                  }`}
                />
                {shippingErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{shippingErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Teléfono Móvil *</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  className={`w-full px-3 py-2.5 border bg-white focus:outline-none focus:border-[#C5A059] ${
                    shippingErrors.phone ? 'border-rose-400' : 'border-stone-300'
                  }`}
                />
                {shippingErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{shippingErrors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Dirección Completa *</label>
                <input
                  type="text"
                  placeholder="Calle, número exterior e interior"
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                  className={`w-full px-3 py-2.5 border bg-white focus:outline-none focus:border-[#C5A059] ${
                    shippingErrors.address ? 'border-rose-400' : 'border-stone-300'
                  }`}
                />
                {shippingErrors.address && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{shippingErrors.address}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Ciudad *</label>
                <input
                  type="text"
                  placeholder="Ciudad o Municipio"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  className={`w-full px-3 py-2.5 border bg-white focus:outline-none focus:border-[#C5A059] ${
                    shippingErrors.city ? 'border-rose-400' : 'border-stone-300'
                  }`}
                />
                {shippingErrors.city && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{shippingErrors.city}</p>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Código Postal *</label>
                <input
                  type="text"
                  placeholder="Ej: 11000"
                  value={shippingData.zipCode}
                  onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                  className={`w-full px-3 py-2.5 border bg-white focus:outline-none focus:border-[#C5A059] ${
                    shippingErrors.zipCode ? 'border-rose-400' : 'border-stone-300'
                  }`}
                />
                {shippingErrors.zipCode && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{shippingErrors.zipCode}</p>
                )}
              </div>

              {/* Country & Notes */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">País</label>
                <select
                  value={shippingData.country}
                  onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-300 bg-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="México">México</option>
                  <option value="Estados Unidos">Estados Unidos (USA)</option>
                  <option value="Colombia">Colombia</option>
                  <option value="España">España</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Instrucciones de entrega</label>
                <input
                  type="text"
                  placeholder="Dejar en recepción / timbre 4B"
                  value={shippingData.deliveryNotes}
                  onChange={(e) => setShippingData({ ...shippingData, deliveryNotes: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-300 bg-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

            </div>

            {/* Order Mini Breakdown */}
            <div className="bg-[#FAF7F5] p-4 border border-[#F0E6DE] flex items-center justify-between text-xs">
              <span className="text-stone-600">Total a Pagar ({items.length} artículos):</span>
              <span className="text-base font-semibold font-mono text-stone-900">${total.toFixed(2)} USD</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-stone-600 hover:text-stone-900"
              >
                Volver
              </button>
              <button
                type="submit"
                className="px-8 py-3 text-xs uppercase tracking-[0.18em] font-medium text-white bg-stone-900 hover:bg-[#C5A059] transition-all duration-300 shadow-md flex items-center gap-2"
              >
                <span>Continuar al Pago</span>
                <ArrowRight className="w-4 h-4 text-[#F3E7C4]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Payment Gateway */}
        {step === 'payment' && (
          <form onSubmit={handleProcessTransaction} className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-lg font-serif text-stone-900">Método de Pago Seguro</h3>
                <p className="text-xs text-stone-500">Selecciona tu método preferido y finaliza la orden</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Editar envío
              </button>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 text-center border transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#C5A059] bg-[#FAF7F5] text-stone-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#C5A059]" />
                Tarjeta
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 text-center border transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'border-[#C5A059] bg-[#FAF7F5] text-stone-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-stone-900" />
                Apple / Google Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 text-center border transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-[#C5A059] bg-[#FAF7F5] text-stone-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="block text-xs font-bold text-[#003087] mb-1">PayPal</span>
                Express
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 text-center border transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-[#C5A059] bg-[#FAF7F5] text-stone-900 font-semibold shadow-xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-stone-700" />
                Transferencia
              </button>
            </div>

            {/* CARD PAYMENT FORM */}
            {paymentMethod === 'card' && (
              <div className="space-y-6">
                
                {/* Interactive Luxury Card Preview (Rose & Champagne Gold Design) */}
                <div className="relative mx-auto w-full max-w-sm h-48 rounded-xl p-5 shadow-xl text-stone-900 overflow-hidden bg-gradient-to-tr from-[#FDF2F4] via-[#FDE8E9] to-[#F5E6CC] border border-[#E8D1B5] transition-all duration-300">
                  {/* Subtle metallic sheen ornament */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#E5C378]/30 to-rose-200/40 blur-xl pointer-events-none" />

                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-serif font-light tracking-[0.2em] uppercase">Glow</span>
                        <span className="text-xs font-serif font-bold text-[#C5A059]">Beauty</span>
                      </div>
                      <span className="text-[10px] tracking-widest uppercase font-mono text-stone-600">
                        {cardData.cardNumber.startsWith('4')
                          ? 'VISA'
                          : cardData.cardNumber.startsWith('5')
                          ? 'MASTERCARD'
                          : 'PREMIUM CARD'}
                      </span>
                    </div>

                    {/* Chip Graphic */}
                    <div className="w-9 h-7 rounded bg-gradient-to-r from-[#D4AF37] to-[#F3E7C4] border border-[#C5A059] opacity-90 shadow-inner flex items-center justify-center">
                      <div className="w-full h-0.5 bg-[#AA822A]/40" />
                    </div>

                    {/* Card Number */}
                    <div className="font-mono text-sm sm:text-base tracking-[0.2em] font-medium text-stone-800">
                      {cardData.cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    {/* Card Footer: Holder & Expiry */}
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                      <div>
                        <span className="block text-[8px] text-stone-400">Titular</span>
                        <span className="font-medium text-stone-800 truncate max-w-[170px] inline-block">
                          {cardData.cardHolder || 'NOMBRE DEL CLIENTE'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] text-stone-400">Expira</span>
                        <span className="font-medium text-stone-800">
                          {cardData.expiry || 'MM/AA'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">Número de Tarjeta *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4532 8901 2345 6789"
                        value={cardData.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className={`w-full pl-3 pr-10 py-2.5 border bg-white font-mono tracking-wider focus:outline-none focus:border-[#C5A059] ${
                          cardErrors.cardNumber ? 'border-rose-400' : 'border-stone-300'
                        }`}
                      />
                      <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {cardErrors.cardNumber && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">Nombre en la Tarjeta *</label>
                    <input
                      type="text"
                      placeholder="Tal como figura en el plástico"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2.5 border bg-white uppercase focus:outline-none focus:border-[#C5A059] ${
                        cardErrors.cardHolder ? 'border-rose-400' : 'border-stone-300'
                      }`}
                    />
                    {cardErrors.cardHolder && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{cardErrors.cardHolder}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Fecha de Expiración (MM/AA) *</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className={`w-full px-3 py-2.5 border bg-white font-mono text-center focus:outline-none focus:border-[#C5A059] ${
                        cardErrors.expiry ? 'border-rose-400' : 'border-stone-300'
                      }`}
                    />
                    {cardErrors.expiry && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{cardErrors.expiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Código de Seguridad (CVV) *</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cardData.cvv}
                      onChange={handleCvvChange}
                      maxLength={4}
                      className={`w-full px-3 py-2.5 border bg-white font-mono text-center focus:outline-none focus:border-[#C5A059] ${
                        cardErrors.cvv ? 'border-rose-400' : 'border-stone-300'
                      }`}
                    />
                    {cardErrors.cvv && (
                      <p className="text-[11px] text-rose-600 mt-0.5">{cardErrors.cvv}</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ALTERNATIVE: Apple / Google Pay */}
            {paymentMethod === 'apple_pay' && (
              <div className="p-6 bg-[#FAF7F5] border border-stone-200 text-center space-y-3">
                <Smartphone className="w-10 h-10 text-stone-900 mx-auto" />
                <h4 className="font-semibold text-stone-900 text-sm">Pago Rápido con 1 Toque</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto font-light">
                  Se utilizará la tarjeta predeterminada en tu Wallet con confirmación biométrica (Face ID / Huella).
                </p>
                <div className="text-xs text-stone-500 pt-2">
                  Total a autorizar: <strong className="font-mono text-stone-900 text-sm">${total.toFixed(2)} USD</strong>
                </div>
              </div>
            )}

            {/* ALTERNATIVE: PayPal */}
            {paymentMethod === 'paypal' && (
              <div className="p-6 bg-[#F2F7FA] border border-blue-200 text-center space-y-3">
                <span className="text-2xl font-bold italic text-[#003087]">PayPal</span>
                <p className="text-xs text-stone-600 max-w-sm mx-auto font-light">
                  Serás redirigido a la pasarela segura de PayPal para autorizar los <strong>${total.toFixed(2)} USD</strong> sin compartir tus datos financieros.
                </p>
              </div>
            )}

            {/* ALTERNATIVE: Transferencia Bancaria */}
            {paymentMethod === 'transfer' && (
              <div className="p-5 bg-[#FAF7F5] border border-stone-200 space-y-3 text-xs">
                <h4 className="font-semibold text-stone-900">Datos para Transferencia Inmediata / SPEI:</h4>
                <div className="bg-white p-3 border border-stone-200 space-y-1 font-mono text-[11px]">
                  <div>Banco: <strong>Glow Bank Internacional</strong></div>
                  <div>CLABE / IBAN: <strong>012 180 00123456789 0</strong></div>
                  <div>Titular: <strong>Glow Beauty S.A. de C.V.</strong></div>
                  <div>Referencia: <strong>ORD-{Math.floor(1000 + Math.random() * 9000)}</strong></div>
                </div>
                <p className="text-[11px] text-stone-500 font-light">
                  Al pulsar "Confirmar Pedido", tu orden se apartará durante 24 horas a la espera del comprobante.
                </p>
              </div>
            )}

            {/* Summary strip */}
            <div className="bg-stone-50 p-4 border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block">Total a debitar:</span>
                <span className="font-serif text-lg font-bold text-stone-900">${total.toFixed(2)} USD</span>
              </div>
              <div className="text-right text-[11px] text-stone-500">
                <span>Destino: {shippingData.city}, {shippingData.country}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium text-stone-600 hover:text-stone-900"
              >
                &larr; Volver a Envío
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-white bg-stone-900 hover:bg-[#C5A059] transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#F3E7C4]" />
                <span>Pagar Ahora · ${total.toFixed(2)} USD</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Bank Processing Animation */}
        {step === 'processing' && (
          <div className="p-12 sm:p-16 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              {/* Rotating glowing ring */}
              <div className="w-20 h-20 rounded-full border-2 border-stone-200 border-t-[#C5A059] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-7 h-7 text-[#C5A059]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-stone-900">Procesando Transacción Segura...</h3>
              <p className="text-xs text-stone-500 font-light max-w-sm mx-auto">
                Conectando con la red bancaria y verificando protocolos de seguridad PCI-DSS. Por favor no cierres esta ventana.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] text-[#A67C38] bg-[#FAF7F5] px-3 py-1.5 border border-[#F0E6DE]">
              <Sparkles className="w-3 h-3 text-[#C5A059]" />
              <span>Cifrado bancario en tiempo real</span>
            </div>
          </div>
        )}

        {/* STEP 4: Success & Official Digital Receipt */}
        {step === 'success' && receipt && (
          <div className="p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-300">
            {/* Header Badge */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif text-stone-900">
                ¡Gracias por tu compra, {receipt.shippingDetails.fullName.split(' ')[0]}!
              </h3>
              <p className="text-xs text-stone-600 font-light max-w-md mx-auto">
                Tu pago ha sido autorizado exitosamente. Hemos enviado la confirmación y detalles de seguimiento a <strong>{receipt.shippingDetails.email}</strong>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#FAF7F5] border border-[#EADBCE] p-5 text-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-3 gap-2">
                <div>
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] block">Número de Pedido</span>
                  <span className="font-mono font-bold text-sm text-stone-900">{receipt.orderNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px] block">Fecha y Hora</span>
                  <span className="text-stone-700 font-mono text-[11px]">{receipt.date}</span>
                </div>
              </div>

              {/* Items Purchased List */}
              <div className="space-y-2">
                <span className="text-stone-500 uppercase tracking-wider text-[10px] block font-semibold">
                  Artículos de la Orden ({receipt.items.length}):
                </span>
                <div className="divide-y divide-stone-200/60 max-h-40 overflow-y-auto pr-1">
                  {receipt.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-9 h-9 object-cover border border-stone-200"
                        />
                        <div>
                          <p className="font-medium text-stone-900">{item.product.name}</p>
                          {item.selectedShade && (
                            <p className="text-[11px] text-stone-500">Tono: {item.selectedShade.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-stone-500 text-[11px]">{item.quantity}x </span>
                        <span className="font-semibold text-stone-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="border-t border-stone-200 pt-3 space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-900">${receipt.subtotal.toFixed(2)} USD</span>
                </div>
                {receipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Descuento aplicado ({receipt.couponApplied})</span>
                    <span className="font-mono">-${receipt.discount.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío Express</span>
                  <span className="font-mono text-stone-900">
                    {receipt.shippingCost === 0 ? 'GRATIS' : `$${receipt.shippingCost.toFixed(2)} USD`}
                  </span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                  <span className="font-serif">Total Pagado</span>
                  <span className="font-mono text-base">${receipt.total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Shipping Address confirmation */}
              <div className="border-t border-stone-200 pt-3 flex items-start gap-2 text-stone-600">
                <Truck className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Dirección de Entrega:</strong> {receipt.shippingDetails.address},{' '}
                  {receipt.shippingDetails.city}, CP {receipt.shippingDetails.zipCode},{' '}
                  {receipt.shippingDetails.country}. Entrega estimada en 2 a 4 días hábiles.
                </div>
              </div>
            </div>

            {/* Actions: Download Receipt & Continue */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-stone-800 bg-white border border-stone-300 hover:border-[#C5A059] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Descargar Factura / Recibo (.txt)</span>
              </button>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.2em] font-medium text-white bg-stone-900 hover:bg-[#C5A059] transition-all duration-300 shadow-md"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
