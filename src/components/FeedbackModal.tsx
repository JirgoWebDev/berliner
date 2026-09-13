'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { submitFeedback } from '@/app/actions/feedback';

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = {
    tr: {
      title: 'Bizi Değerlendirin',
      subtitle: 'Deneyiminizi bizimle paylaşın',
      commentPlaceholder: 'Varsa öneri veya şikayetlerinizi yazabilirsiniz...',
      submit: 'Gönder',
      submitting: 'Gönderiliyor...',
      successTitle: 'Teşekkürler!',
      successDesc: 'Geri bildiriminiz başarıyla alındı.',
    },
    en: {
      title: 'Rate Us',
      subtitle: 'Share your experience with us',
      commentPlaceholder: 'Any suggestions or complaints...',
      submit: 'Submit',
      submitting: 'Submitting...',
      successTitle: 'Thank You!',
      successDesc: 'Your feedback has been received successfully.',
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setIsSubmitting(true);
    const result = await submitFeedback(rating, comment);
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setIsSuccess(false);
          setRating(0);
          setComment('');
        }, 300);
      }, 2000);
    }
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
            className="bg-[#161616] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden relative shadow-2xl z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 pt-8">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{t.successTitle}</h3>
                  <p className="text-neutral-400 text-sm">{t.successDesc}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col text-center">
                  <h3 className="text-2xl font-bold text-white mb-1">{t.title}</h3>
                  <p className="text-sm text-neutral-400 mb-8">{t.subtitle}</p>

                  <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star 
                          className={`w-10 h-10 transition-colors ${
                            star <= (hoveredRating || rating) 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-neutral-700'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.commentPlaceholder}
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#ef4444]/50 resize-none mb-6 placeholder:text-neutral-600"
                  />

                  <button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    className="w-full bg-[#ef4444] text-white font-semibold py-3.5 rounded-full transition-all hover:bg-[#dc2626] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-[#ef4444] shadow-lg"
                  >
                    {isSubmitting ? t.submitting : t.submit}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
