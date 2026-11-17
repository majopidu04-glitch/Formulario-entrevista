import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Footer: React.FC = () => {
  const { showToast } = useCart();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      showToast('¡Bienvenida al Glow Club!', 'Te hemos enviado tu código de 15% OFF a tu correo.');
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#1C1917] text-stone-300 border-t border-stone-800 pt-16 pb-12 text-xs font-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Newsletter & Brand Mission Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-stone-800/80 items-center">
          <div className="lg:col-span-6 space-y-2">
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.25em] font-medium block">
              El Círculo Glow
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-white">
              Recibe 15% de descuento en tu primer pedido
            </h3>
            <p className="text-stone-400 text-xs font-light max-w-md leading-relaxed">
              Sé la primera en conocer lanzamientos exclusivos, tutoriales de belleza minimalista y eventos privados.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md ml-auto">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Tu correo electrónico..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-3 text-xs bg-stone-900 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 text-xs uppercase tracking-widest font-medium bg-[#C5A059] text-white hover:bg-[#D4AF37] transition-colors shrink-0"
              >
                {subscribed ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Suscrita
                  </span>
                ) : (
                  'Suscribirme'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <span className="text-lg font-serif tracking-[0.2em] text-white uppercase block">
              GLOW <span className="text-[#C5A059]">BEAUTY</span>
            </span>
            <p className="text-stone-400 text-xs leading-relaxed">
              Cosmética de alta gama inspirada en la luz natural. Fórmulas botánicas, texturas aterciopeladas y diseño sobrio en tonos rosado, dorado y blanco.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-white font-medium block">
              Colecciones
            </span>
            <ul className="space-y-1.5 text-stone-400">
              <li><a href="#catalogo" className="hover:text-white transition-colors">Labiales Velvet</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Iluminadores Aurora</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Bases Aura Serum</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Paletas Celestial</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Tratamientos Faciales</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-white font-medium block">
              Atención al Cliente
            </span>
            <ul className="space-y-1.5 text-stone-400">
              <li>Envío Express & Rastreo</li>
              <li>Política de Devolución 30 días</li>
              <li>Guía de Tonos y Aplicación</li>
              <li>Preguntas Frecuentes (FAQ)</li>
              <li>Contacto: atencion@glowbeauty.com</li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-white font-medium block">
              Seguridad y Garantía
            </span>
            <div className="space-y-2 text-stone-400 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span>Pasarela de Pago Segura SSL 256 bits</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C5A059]" />
                <span>Envíos asegurados y rastreo en vivo</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#C5A059]" />
                <span>Garantía de satisfacción o reembolso</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment icons */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} Glow Beauty Store Inc. Todos los derechos reservados.
          </div>
          
          {/* Payment Method Badges */}
          <div className="flex items-center gap-3 text-stone-400">
            <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 border border-stone-800 rounded">VISA</span>
            <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 border border-stone-800 rounded">MASTERCARD</span>
            <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 border border-stone-800 rounded">AMEX</span>
            <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 border border-stone-800 rounded">APPLE PAY</span>
            <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 border border-stone-800 rounded">PAYPAL</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
