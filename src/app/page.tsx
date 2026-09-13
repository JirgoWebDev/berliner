'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function SplashScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      className="min-h-screen text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans bg-cover bg-center bg-no-repeat bg-[url('/uploads/mobilback.png')] md:bg-[url('/uploads/back.png')]"
    >
      
      {/* Karanlık Overlay (Yazıların okunması için) */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Logo ve Hoş Geldiniz Alanı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 flex flex-col items-center text-center mb-10"
      >
        <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
          Moda Berliner
        </h1>
        <p className="text-white font-medium text-lg tracking-wide">
          {language === 'tr' ? 'Hoş Geldiniz' : 'Welcome'}
        </p>
      </motion.div>

      {/* Butonlar Alanı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="z-10 w-full max-w-[280px] flex flex-col items-center gap-5"
      >
        {/* Ana Buton */}
        <button
          onClick={() => router.push('/menu')}
          className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold text-base py-3.5 rounded-full transition-all shadow-lg active:scale-95"
        >
          {language === 'tr' ? 'Menüye Gidin' : 'Go to Menu'}
        </button>

        {/* Alt Seçenekler (Diller) */}
        <div className="flex items-center justify-center gap-3 w-full">
          {/* TR Butonu */}
          <button
            onClick={() => setLanguage('tr')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border transition-all ${
              language === 'tr' 
                ? 'border-white/60 bg-white/10' 
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <img src="/flags/tr.png" alt="TR" className="w-4 h-4 rounded-full object-cover" />
            <span className="text-sm font-medium">Türkçe</span>
          </button>

          {/* EN Butonu */}
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border transition-all ${
              language === 'en' 
                ? 'border-white/60 bg-white/10' 
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <img src="/flags/en.png" alt="EN" className="w-4 h-4 rounded-full object-cover" />
            <span className="text-sm font-medium">English</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}