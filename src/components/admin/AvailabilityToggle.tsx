'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toggleProductAvailability } from '@/app/actions/product';

interface Props {
  productId: string;
  initialAvailable: boolean;
}

export function AvailabilityToggle({ productId, initialAvailable }: Props) {
  const [isPending, startTransition] = useTransition();
  const [available, setAvailable] = useState(initialAvailable);

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update
      setAvailable((prev) => !prev);
      const res = await toggleProductAvailability(productId);
      if (!res.success) {
        // Revert on error
        setAvailable((prev) => !prev);
        alert('Durum güncellenirken bir hata oluştu: ' + (res.error || 'Bilinmeyen hata'));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={available ? 'Menüden Çıkar (Tükendi / Pasife Al)' : 'Menüye Ekle (Stokta Var / Aktif Et)'}
      className={`p-2 rounded-xl border transition-all cursor-pointer ${
        available
          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
          : 'text-neutral-400 bg-neutral-100 border-neutral-200 hover:bg-neutral-200 hover:text-neutral-600'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : available ? (
        <Eye className="w-5 h-5" />
      ) : (
        <EyeOff className="w-5 h-5" />
      )}
    </button>
  );
}
