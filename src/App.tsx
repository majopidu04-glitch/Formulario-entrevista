import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { BrandPhilosophy } from './components/BrandPhilosophy';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ToastContainer } from './components/ToastContainer';
import { InterviewApp } from './interview/InterviewApp';
import { PRODUCTS } from './data/products';
import { Product } from './types';

const StoreContent: React.FC<{ onOpenInterview: () => void }> = ({ onOpenInterview }) => {
  const {
    selectedProductForDetail,
    setSelectedProductForDetail
  } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenSearch = () => {
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = catalogEl.querySelector('input');
        if (input) input.focus();
      }, 400);
    }
  };

  const handleExploreClick = () => {
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] text-stone-900 selection:bg-[#F3E7C4] selection:text-stone-900 font-sans">
      <AnnouncementBar />

      <Navbar
        onSelectCategory={handleSelectCategory}
        onOpenSearch={handleOpenSearch}
      />

      <main className="flex-1">
        <Hero onExploreClick={handleExploreClick} />

        <Catalog
          products={PRODUCTS}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenDetail={(product: Product) => setSelectedProductForDetail(product)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <BrandPhilosophy />

        <CustomerReviews />
      </main>

      <Footer />

      <div className="bg-[#141210] text-stone-400 text-xs py-3 px-4 border-t border-stone-800 text-center">
        <button
          onClick={onOpenInterview}
          className="hover:text-[#D4AF37] transition-colors underline cursor-pointer"
        >
          Abrir Formato de Entrevista y Diagnóstico de Servicio al Cliente
        </button>
      </div>

      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
      />

      <CartDrawer />

      <CheckoutModal />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'interview' | 'store'>(() =>
    window.location.hash === '#/tienda' ? 'store' : 'interview'
  );

  useEffect(() => {
    const onHashChange = () => {
      setView(window.location.hash === '#/tienda' ? 'store' : 'interview');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const switchToStore = () => {
    window.location.hash = '#/tienda';
    setView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchToInterview = () => {
    window.location.hash = '#/entrevista';
    setView('interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (view === 'store') {
    return (
      <CartProvider>
        <StoreContent onOpenInterview={switchToInterview} />
      </CartProvider>
    );
  }

  return <InterviewApp onOpenStore={switchToStore} />;
}
