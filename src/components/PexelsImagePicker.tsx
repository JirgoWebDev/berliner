'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { searchPexelsImages } from '@/app/actions/pexels';

interface PexelsPhoto {
  id: number;
  src: string;
  largeSrc: string;
  alt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

export function PexelsImagePicker({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    const res = await searchPexelsImages(query.trim());
    
    if (res.success) {
      setPhotos(res.photos || []);
    } else {
      setError(res.error || 'Arama sırasında bir hata oluştu.');
    }
    
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-100 bg-neutral-50/80">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Pexels'te Görsel Ara</h3>
                <p className="text-sm text-neutral-500 mt-1">Stok fotoğraflar arasından seçim yapın.</p>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 md:p-6 pb-2">
              <div className="relative flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder="Örn: Kahve, Tatlı, Burger..."
                    className="w-full bg-neutral-100 border border-neutral-200 rounded-2xl pl-12 pr-4 py-3.5 text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:ring-1 focus:ring-[#e3372c] transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => handleSearch(e)}
                  disabled={isLoading || !query.trim()}
                  className="bg-[#e3372c] text-white px-6 py-3.5 rounded-2xl font-bold whitespace-nowrap hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Ara
                </button>
              </div>
              
              {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-10 h-10 text-neutral-300 animate-spin" />
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div 
                      key={photo.id}
                      onClick={() => {
                        onSelect(photo.largeSrc);
                        onClose();
                      }}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-neutral-200 shadow-sm hover:border-[#e3372c] hover:shadow-md transition-all"
                    >
                      <img 
                        src={photo.src} 
                        alt={photo.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="bg-white text-neutral-900 rounded-full p-2 scale-0 group-hover:scale-100 transition-transform shadow-lg flex items-center gap-1">
                          <Check className="w-4 h-4 text-[#e3372c] ml-1" />
                          <span className="text-xs font-bold mr-2 text-[#e3372c]">Seç</span>
                        </div>
                      </div>
                      <a 
                        href={`https://www.pexels.com/photo/${photo.id}/`} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-2 left-2 right-2 text-[10px] text-white/80 hover:text-white hover:underline bg-black/50 px-2 py-1 rounded truncate opacity-0 group-hover:opacity-100 transition-opacity text-center"
                      >
                        Pexels
                      </a>
                    </div>
                  ))}
                </div>
              ) : query && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <Search className="w-12 h-12 mb-3 text-neutral-200" />
                  <p>Aramanıza uygun görsel bulunamadı.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <ImageIcon className="w-12 h-12 mb-3 text-neutral-200" />
                  <p>Arama yaparak görselleri listeleyebilirsiniz.</p>
                  <p className="text-xs mt-2 text-neutral-400">Görseller Pexels tarafından sağlanmaktadır.</p>
                </div>
              )}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
