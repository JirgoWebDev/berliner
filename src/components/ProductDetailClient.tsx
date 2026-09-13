'use client';

import { useLanguage } from './LanguageContext';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Utensils, Tag } from 'lucide-react';
import type { Product, Category } from '@prisma/client';

export function ProductDetailClient({ product }: { product: Product & { category: Category } }) {
  const { language, t } = useLanguage();
  const prodName = language === 'tr' ? product.name_tr : product.name_en;
  const prodDesc = language === 'tr' ? product.description_tr : product.description_en;
  const catName = language === 'tr' ? product.category.name_tr : product.category.name_en;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex items-center justify-center p-0 md:p-8">
      
      {/* Ana Kart Container: Mobilde dikey, PC'de 2 kolonlu yatay görünüm */}
      <div className="w-full max-w-md md:max-w-4xl bg-white min-h-screen md:min-h-0 md:rounded-[32px] md:shadow-2xl md:border md:border-neutral-200/80 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Sol Kolon: Ürün Kapak Görseli */}
        <div className="relative h-80 sm:h-96 md:h-auto md:w-1/2 bg-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
          {product.imageUrl ? (
            <>
              <img 
                src={product.imageUrl} 
                alt={prodName} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 md:hidden z-10" />
            </>
          ) : (
            <div className="w-full h-full bg-neutral-200 flex flex-col items-center justify-center text-neutral-400 gap-2 p-8">
              <ImageIcon className="w-16 h-16" />
              <span className="text-xs font-semibold">Görsel Bulunamadı</span>
            </div>
          )}
          
          {/* Geri Butonu (PC ve Mobilde Şık Görünüm) */}
          <Link 
            href="/menu" 
            className="absolute top-5 left-5 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/50 text-neutral-800 hover:bg-white hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Sağ Kolon: Ürün Detay Bilgileri */}
        <div className="flex-1 p-6 md:p-10 -mt-8 md:mt-0 bg-white rounded-t-[32px] md:rounded-none relative z-20 flex flex-col justify-between">
          
          <div>
            {/* Mobilde Görünür Tutamak Çizgisi */}
            <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-6 md:hidden" />

            {/* Kategori Etiketi */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#e3372c] border border-red-100">
                <Utensils className="w-3.5 h-3.5" />
                {catName}
              </span>
            </div>

            {/* Başlık ve Fiyat */}
            <div className="flex justify-between items-start mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl font-black text-neutral-950 leading-tight">
                {prodName}
              </h1>

              <div className="bg-[#e3372c] text-white px-4 py-2.5 rounded-2xl shrink-0 shadow-md shadow-red-500/20 flex items-center gap-1.5">
                <span className="text-xl md:text-2xl font-black">
                  {product.price.toFixed(2)}
                </span>
                <span className="text-xs font-bold">{t('currency')}</span>
              </div>
            </div>

            {/* Ayraç Çizgisi */}
            <div className="w-full h-px bg-neutral-100 mb-6" />
            
            {/* Ürün Açıklaması */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                {language === 'tr' ? 'Ürün Detayı' : 'Product Details'}
              </h3>

              {prodDesc ? (
                <div className="bg-neutral-50 border border-neutral-100 p-5 rounded-2xl">
                  <p className="text-neutral-700 text-base leading-relaxed">
                    {prodDesc}
                  </p>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-100 p-5 rounded-2xl text-center">
                  <p className="text-neutral-400 text-sm italic">
                    {language === 'tr' ? 'Bu lezzet için henüz açıklama girilmemiş.' : 'No description available for this item.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alt Bilgi / Menüye Dönüş Butonu */}
          <div className="pt-8 mt-auto">
            <Link
              href="/menu"
              className="w-full bg-neutral-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition-all shadow-lg"
            >
              {language === 'tr' ? 'Menüye Geri Dön' : 'Back to Menu'}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}