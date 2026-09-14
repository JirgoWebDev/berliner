'use client';

import React, { createContext, useContext } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  tr: {
    welcome: 'Hoşgeldiniz',
    select_language: 'Dil Seçiniz',
    categories: 'Kategoriler',
    popular: 'Popüler',
    add_to_cart: 'Sepete Ekle',
    currency: '₺',
  },
  en: {
    welcome: 'Welcome',
    select_language: 'Select Language',
    categories: 'Categories',
    popular: 'Popular',
    add_to_cart: 'Add to Cart',
    currency: '₺',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getLanguageSnapshot(): Language {
  const saved = localStorage.getItem('language');
  return (saved === 'tr' || saved === 'en') ? saved : 'tr';
}

function getLanguageServerSnapshot(): Language {
  return 'tr';
}

function subscribeLanguage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

const emptySubscribe = () => () => {};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = React.useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getLanguageServerSnapshot
  );
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    window.dispatchEvent(new Event('storage'));
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['tr']] || key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
