'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageContext';
import { ArrowLeft, ChefHat, ChevronRight, Image as ImageIcon, Search, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { FeedbackModal } from './FeedbackModal';
import type { Category, Product } from '@prisma/client';

type CategoryWithProducts = Category & { products: Product[] };

export function MenuDisplay({ categories }: { categories: CategoryWithProducts[] }) {
  const { language, t, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories.length > 0 ? categories[0].id : ''
  );
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Kategori bölüm referanslarını ve yatay buton referanslarını tutacağız
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const categoryBtnRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isManualScroll = useRef(false);

  // Arama Filtresi
  const isSearching = searchQuery.trim().length > 0;

  // SCROLLSPY EFFECT
  useEffect(() => {
    if (isSearching) return;

    const handleScroll = () => {
      if (isManualScroll.current) return;

      const scrollPosition = window.scrollY + 180;

      for (const category of categories) {
        const el = categoryRefs.current[category.id];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategoryId(category.id);
            
            categoryBtnRefs.current[category.id]?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, isSearching]);

  // Kategoriye Kaydır
  const scrollToCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    isManualScroll.current = true;

    const targetEl = categoryRefs.current[categoryId];
    if (targetEl) {
      const headerOffset = 140;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      categoryBtnRefs.current[categoryId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }

    setTimeout(() => {
      isManualScroll.current = false;
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 pb-24">
      
      {/* 1. ÜST KISIM: Ana Header (Kırmızı) */}
      <header className="sticky top-0 z-50 bg-[#e3372c] text-white shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Moda Berliner</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLanguage('tr')}
              className={`transition-all rounded-full overflow-hidden w-7 h-7 flex items-center justify-center ${language === 'tr' ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100 grayscale-[30%]'}`}
            >
              <img src="/flags/tr.png" alt="TR" className="w-full h-full object-cover" />
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`transition-all rounded-full overflow-hidden w-7 h-7 flex items-center justify-center ${language === 'en' ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100 grayscale-[30%]'}`}
            >
              <img src="/flags/en.png" alt="EN" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        {/* 2. STICKY KATEGORİ BARI */}
        <div className="bg-white border-b border-neutral-200 shadow-sm px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar py-0.5">
            {categories.map((category) => {
              const catName = language === 'tr' ? category.name_tr : category.name_en;
              const isActive = category.id === activeCategoryId && !isSearching;

              return (
                <button
                  key={category.id}
                  ref={(el) => { categoryBtnRefs.current[category.id] = el; }}
                  onClick={() => scrollToCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all shrink-0 whitespace-nowrap
                    ${isActive 
                      ? 'bg-[#e3372c] border-[#e3372c] text-white shadow-md scale-105' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'}`}
                >
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={catName} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <ImageIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  )}
                  <span>{catName.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ARAMA BARI VE GERİ BİLDİRİM BANNER'I */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder={language === 'tr' ? 'Menüde ürün ara...' : 'Search items...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#e3372c] shadow-sm transition-all"
          />
        </div>

        {/* Görseldekine benzer Şık Puanlama/Geri Bildirim Duyuru Banner'ı */}
        {!isSearching && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center justify-between bg-red-50/80 border border-red-200/60 p-3.5 rounded-2xl cursor-pointer hover:bg-red-100/60 transition-all shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e3372c] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  {language === 'tr' ? 'Deneyiminizi beğendiniz mi?' : 'Did you enjoy your experience?'}
                </p>
                <p className="text-xs text-[#e3372c] font-semibold underline underline-offset-2">
                  {language === 'tr' ? 'Bizi değerlendirin' : 'Rate us here'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#e3372c]" />
          </motion.div>
        )}
      </div>

      {/* ANA İÇERİK */}
      <main className="px-4 space-y-8 max-w-2xl mx-auto mt-1">
        {categories.map((category) => {
          const catName = language === 'tr' ? category.name_tr : category.name_en;
          
          const filteredProducts = category.products.filter(product => {
            const name = language === 'tr' ? product.name_tr : product.name_en;
            const desc = language === 'tr' ? product.description_tr : product.description_en;
            const search = searchQuery.toLowerCase();
            return (
              name.toLowerCase().includes(search) ||
              (desc && desc.toLowerCase().includes(search))
            );
          });

          if (isSearching && filteredProducts.length === 0) return null;

          return (
            <div 
              key={category.id} 
              ref={(el) => { categoryRefs.current[category.id] = el; }}
              className="scroll-mt-36"
            >
              {category.imageUrl && !isSearching && (
                <div className="mb-4 rounded-2xl overflow-hidden h-32 md:h-40 relative shadow-sm border border-neutral-100">
                  <img 
                    src={category.imageUrl} 
                    alt={catName} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h2 className="absolute bottom-3 left-4 text-xl font-black text-white uppercase tracking-tight drop-shadow-md">
                    {catName}
                  </h2>
                </div>
              )}
              
              {(!category.imageUrl || isSearching) && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
                  <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">
                    {catName}
                  </h2>
                  <span className="text-xs font-semibold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">
                    {filteredProducts.length}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {filteredProducts.map(product => {
                  const prodName = language === 'tr' ? product.name_tr : product.name_en;
                  const prodDesc = language === 'tr' ? product.description_tr : product.description_en;

                  return (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                    >
                      <Link href={`/menu/product/${product.id}`} className="flex items-center gap-3.5 p-3">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={prodName} 
                            className="w-20 h-20 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-100">
                            <ImageIcon className="w-6 h-6 text-neutral-300" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-neutral-900 text-base leading-snug truncate group-hover:text-[#e3372c] transition-colors">
                            {prodName}
                          </h3>
                          
                          {prodDesc && (
                            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mt-0.5">
                              {prodDesc}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <span className="font-extrabold text-base text-neutral-950">
                              {product.price.toFixed(2)} {t('currency')}
                            </span>
                            <div className="p-1 rounded-full bg-neutral-100 text-neutral-400 group-hover:bg-red-50 group-hover:text-[#e3372c] transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* ALT BAR: Sabit Hızlı Puanlama Butonu & Dil Değiştirici */}
      <footer className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-2xl mx-auto flex items-center justify-between pointer-events-none">
        {/* Sol/Orta: Ekran Aşağı Kaydırıldığında Değerlendirme Butonu */}
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="pointer-events-auto flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-lg border border-neutral-800 hover:bg-neutral-800 active:scale-95 transition-all text-xs font-bold"
        >
          <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span>{language === 'tr' ? 'Değerlendir' : 'Rate Us'}</span>
        </button>

        {/* (Dil değiştirici üst tarafa taşındı) */}
      </footer>

    </div>
  );
}