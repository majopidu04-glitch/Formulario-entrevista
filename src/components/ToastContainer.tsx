import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-stone-900 text-white px-4 py-3 shadow-xl border border-stone-700 flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-[#C5A059] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-wide text-white">{toast.title}</p>
            <p className="text-[11px] text-stone-300 font-light truncate mt-0.5">{toast.description}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar notificación"
            className="text-stone-400 hover:text-white transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
