'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface Props {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage?: string;
  title?: string;
  className?: string;
}

export function DeleteButton({
  action,
  id,
  confirmMessage = 'Bu kaydı silmek istediğinize emin misiniz?',
  title = 'Sil',
  className = 'p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-200 rounded-xl transition-all cursor-pointer',
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
      return;
    }
    setLoading(true);
  };

  return (
    <form action={action} onSubmit={handleSubmit} className="inline-block">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={loading}
        className={className}
        title={title}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </button>
    </form>
  );
}
