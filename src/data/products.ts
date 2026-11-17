import { Product } from '../types';
import lipstickVelvetImg from '../assets/images/product_velvet_lipstick_gold_1794328756962.jpg';
import liquidHighlighterImg from '../assets/images/product_glow_liquid_highlighter_1794328756961.jpg';
import radianceFoundationImg from '../assets/images/product_radiance_foundation_1794328757531.jpg';
import eyeshadowPaletteImg from '../assets/images/product_eyeshadow_palette_nude_1794328758164.jpg';
import heroLuxuryImg from '../assets/images/hero_glow_beauty_luxury_1794328755795.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'lipstick-velvet-rose',
    name: 'Labial Velvet Matte Royal',
    subtitle: 'Acabado aterciopelado en estuche de oro pulido',
    category: 'labios',
    categoryLabel: 'Labios',
    price: 28.00,
    originalPrice: 34.00,
    rating: 4.9,
    reviewsCount: 142,
    image: lipstickVelvetImg,
    description: 'Fórmula cremosa infundida con ácido hialurónico y manteca de karité que envuelve los labios en un color mate intenso sin resecar. Su elegante estuche estriado en oro y rosa suave ofrece cierre magnético de precisión.',
    finish: 'Mate aterciopelado',
    skinType: 'Todo tipo de labios',
    volume: '3.8 g / 0.13 oz',
    benefits: [
      'Pigmentación pura de una sola pasada',
      'Hidratación continua durante 12 horas',
      'Fórmula no transferible y ligera',
      'Vegano y libre de crueldad animal'
    ],
    shades: [
      { id: 'rose-velvet', name: 'Velvet Rose', hex: '#A85A65' },
      { id: 'nude-dahlia', name: 'Nude Dahlia', hex: '#C08076' },
      { id: 'golden-terracotta', name: 'Golden Terracotta', hex: '#9E5B4B' },
      { id: 'french-burgundy', name: 'French Burgundy', hex: '#6D2B35' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'aurora-liquid-illuminator',
    name: 'Aurora Glow Liquid Illuminator',
    subtitle: 'Elixir concentrado de luz champagne dorada',
    category: 'iluminadores',
    categoryLabel: 'Iluminadores',
    price: 36.00,
    rating: 5.0,
    reviewsCount: 198,
    image: liquidHighlighterImg,
    description: 'Iluminador líquido bifásico con microperlas ultrafinas suspendidas en aceites botánicos ligeros. Aporta un efecto mojado y un resplandor etéreo que captura la luz solar con naturalidad.',
    finish: 'Luminosidad nacarada radiante',
    skinType: 'Seca, mixta, normal y madura',
    volume: '30 ml / 1.0 fl oz',
    benefits: [
      'Microesferas de perla mineral natural',
      'Se mezcla a la perfección con bases y cremas',
      'Acabado no graso y de rápida absorción',
      'Enriquecido con Vitamina E y escualano'
    ],
    shades: [
      { id: 'champagne-gold', name: 'Champagne Gold', hex: '#E5C378' },
      { id: 'rose-starlight', name: 'Rose Starlight', hex: '#EBB4BC' },
      { id: 'sunlit-bronze', name: 'Sunlit Bronze', hex: '#C28952' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'aura-serum-foundation',
    name: 'Aura Radiance Serum Foundation',
    subtitle: 'Base fluida perfeccionadora con acabado segunda piel',
    category: 'rostro',
    categoryLabel: 'Rostro & Base',
    price: 44.00,
    originalPrice: 50.00,
    rating: 4.8,
    reviewsCount: 220,
    image: radianceFoundationImg,
    description: 'La fusión perfecta entre cuidado de la piel de lujo y maquillaje. Esta base de cobertura media modulable unifica el tono, disimula imperfecciones y deja un halo luminoso y fresco que dura todo el día.',
    finish: 'Segunda piel satinada',
    skinType: 'Todo tipo de piel, no comedogénica',
    volume: '30 ml / 1.0 fl oz',
    benefits: [
      'Cobertura media con textura ultraligera',
      'Protección antioxidante con extracto de té blanco',
      'Resistente al sudor y a la humedad',
      'Frasco de cristal reciclable con dosificador oro rosa'
    ],
    shades: [
      { id: 'porcelain-10', name: '10N Porcelain Pure', hex: '#FBE8DA' },
      { id: 'vanilla-20', name: '20W Warm Vanilla', hex: '#EED1B9' },
      { id: 'honey-30', name: '30N Honey Dew', hex: '#DFBA99' },
      { id: 'caramel-40', name: '40W Golden Amber', hex: '#C6976F' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'celestial-nude-palette',
    name: 'Paleta Celestial Nude & Rose Gold',
    subtitle: '9 sombras exclusivas en tonos neutros y destellos oro rosa',
    category: 'ojos',
    categoryLabel: 'Ojos & Cejas',
    price: 48.00,
    rating: 4.9,
    reviewsCount: 165,
    image: eyeshadowPaletteImg,
    description: 'Una cuidada armonía de 5 mates aterciopelados y 4 brillos metálicos prensados con perlas multicromáticas. Pigmentos de grado farmacéutico formulados para difuminarse sin esfuerzo y sin desprendimiento.',
    finish: 'Mate sedoso y destello multicromático',
    skinType: 'Ojos sensibles y usuarias de lentes de contacto',
    volume: '14.5 g / 0.51 oz',
    benefits: [
      'Pigmentación ultra saturada sin caída de polvo',
      'Duración intacta hasta por 16 horas',
      'Incluye espejo panorámico HD en marco oro rosa',
      'Fórmula hipoalergénica probada oftalmológicamente'
    ],
    shades: [
      { id: 'palette-collection', name: 'Celestial Edition (9 sombras)', hex: '#D4AF37' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'lumina-radiance-elixir',
    name: 'Lumina Elixir Facial Preparador',
    subtitle: 'Primer iluminador con niacinamida y agua de rosas',
    category: 'cuidado',
    categoryLabel: 'Cuidado Facial',
    price: 32.00,
    originalPrice: 38.00,
    rating: 4.9,
    reviewsCount: 88,
    image: heroLuxuryImg,
    description: 'Preparador de cutis botánico que alisa los poros al instante, fija el maquillaje y entrega una dosis intensiva de hidratación gracias a su infusión de agua de rosas búlgaras y ácido hialurónico.',
    finish: 'Glow saludable sin brillos oleosos',
    skinType: 'Todo tipo de piel',
    volume: '50 ml / 1.7 fl oz',
    benefits: [
      'Alisa la textura de la piel para una aplicación impecable',
      'Prolonga la duración de la base hasta 14 horas',
      'Control suave de la grasa en zona T',
      'Aroma sutil y relajante a jazmín silvestre'
    ],
    shades: [
      { id: 'universal-glow', name: 'Tono Universal Translúcido', hex: '#FAF0E6' }
    ],
    inStock: true,
    featured: false
  },
  {
    id: 'aurora-balm-blush',
    name: 'Velvet Lip & Cheek Multi-Stick',
    subtitle: 'Bálsamo hidratante con color para labios y mejillas',
    category: 'labios',
    categoryLabel: 'Labios & Mejillas',
    price: 24.00,
    rating: 4.7,
    reviewsCount: 110,
    image: lipstickVelvetImg,
    description: 'La versatilidad del minimalismo diario. Un stick cremoso que se funde con el calor de las yemas de los dedos, aportando un rubor natural y saludable en mejillas y un tinte jugoso en labios.',
    finish: 'Rocío saludable modulable',
    skinType: 'Todo tipo de piel',
    volume: '5.5 g / 0.19 oz',
    benefits: [
      'Textura fundente de fácil aplicación con los dedos',
      'Rico en aceite de jojoba y manteca de cacao',
      'Formato de bolsillo ideal para retoques rápidos',
      'Sin parabenos, fragancias sintéticas ni sulfatos'
    ],
    shades: [
      { id: 'petal-blush', name: 'Petal Blush', hex: '#E28D98' },
      { id: 'coral-sun', name: 'Golden Coral', hex: '#E88B74' },
      { id: 'berry-kiss', name: 'Deep Berry', hex: '#9C4C61' }
    ],
    inStock: true,
    featured: false
  }
];

export const CATEGORIES = [
  { id: 'todos', label: 'Todos los Productos' },
  { id: 'rostro', label: 'Rostro & Base' },
  { id: 'labios', label: 'Labiales' },
  { id: 'iluminadores', label: 'Iluminadores' },
  { id: 'ojos', label: 'Ojos' },
  { id: 'cuidado', label: 'Cuidado Facial' },
];

export const COUPONS: Record<string, { discountPercent?: number; discountFixed?: number; description: string }> = {
  'GLOW10': { discountPercent: 10, description: '10% de descuento en toda la orden' },
  'BEAUTYGOLD': { discountFixed: 15, description: '$15 USD de descuento de bienvenida' },
  'ENVIOVIP': { discountPercent: 5, description: '5% de descuento adicional' },
};
