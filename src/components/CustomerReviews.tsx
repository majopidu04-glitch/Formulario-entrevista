import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Camila Valenzuela',
    role: 'Compradora Verificada',
    city: 'Ciudad de México',
    product: 'Aurora Glow Liquid Illuminator',
    rating: 5,
    title: 'El acabado más elegante que he probado',
    comment:
      'No tiene partículas de purpurina toscas; deja un efecto de piel hidratada y luminosa que dura toda mi jornada laboral. El envase dorado con gotero es simplemente una joya.',
    date: 'Hace 3 días'
  },
  {
    id: 2,
    name: 'Valentina Restrepo',
    role: 'Compradora Verificada',
    city: 'Bogotá',
    product: 'Labial Velvet Matte Royal (Tono Velvet Rose)',
    rating: 5,
    title: 'Cero resequedad en los labios',
    comment:
      'Siempre sufría porque los labiales mate me agrietaban los labios. Esta fórmula de Glow Beauty se siente suave como seda y el color resiste café y comidas sin borrarse.',
    date: 'Hace 1 semana'
  },
  {
    id: 3,
    name: 'Sofía Montalvo',
    role: 'Compradora Verificada',
    city: 'Madrid',
    product: 'Aura Radiance Serum Foundation',
    rating: 5,
    title: 'Parece que no llevara maquillaje',
    comment:
      'Unifica las rojeces al instante y aporta una frescura increíble. El envío express llegó en 48 horas empaquetado en una caja con lazo rosado impecable.',
    date: 'Hace 2 semanas'
  }
];

export const CustomerReviews: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      
      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C5A059] font-medium block">
          Experiencias Reales
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-stone-900">
          Lo que dicen nuestras clientas
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-6 border border-[#EFE5DC] flex flex-col justify-between space-y-4 hover:border-[#C5A059]/50 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-[#D4AF37]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
              </div>

              <h4 className="text-sm font-semibold text-stone-900 font-serif">
                "{rev.title}"
              </h4>

              <p className="text-xs text-stone-600 font-light leading-relaxed">
                {rev.comment}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-stone-900">{rev.name}</p>
                <p className="text-[11px] text-stone-500 font-light">{rev.product}</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-800 text-[10px] uppercase tracking-wider font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verificada</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
