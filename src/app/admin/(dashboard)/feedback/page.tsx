import prisma from '@/lib/prisma';
import { Star, MessageSquare } from 'lucide-react';

export default async function FeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const totalReviews = feedbacks.length;
  const averageRating = totalReviews > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 md:p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">Değerlendirmeler</h1>
          <p className="text-neutral-500 text-sm mt-1">Müşterilerinizden gelen geri bildirimler</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-500 rounded-full">
            <Star className="w-8 h-8 fill-current" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Ortalama Puan</p>
            <p className="text-3xl font-bold text-neutral-900">{averageRating} / 5</p>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-500 rounded-full">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Toplam Değerlendirme</p>
            <p className="text-3xl font-bold text-neutral-900">{totalReviews}</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-900">Son Yorumlar</h2>
        </div>
        
        {feedbacks.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            Henüz hiç değerlendirme yapılmamış.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-5 h-5 ${star <= feedback.rating ? 'fill-orange-500 text-orange-500' : 'text-neutral-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-400">
                    {new Date(feedback.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {feedback.comment ? (
                  <p className="text-neutral-700 leading-relaxed bg-neutral-100/50 p-4 rounded-xl border border-neutral-200/50">
                    &quot;{feedback.comment}&quot;
                  </p>
                ) : (
                  <p className="text-neutral-400 italic text-sm">
                    Yorum yapılmamış. Sadece puan verilmiş.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
