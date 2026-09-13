'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AtSign, KeyRound, ArrowRight, ChefHat, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError('Hatalı kullanıcı adı veya şifre.');
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Kart Container: Masaüstünde geniştir (max-w-2xl), mobilde tam sığar */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-neutral-200/80 shadow-2xl p-6 md:p-12 space-y-8">
        
        {/* Başlık Alanı - Sade & Kurumsal */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between pb-6 border-b border-neutral-100 gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-neutral-950 tracking-tight">
                Moda Berliner
              </h1>
              <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase mt-0.5">
                Yönetici Paneli Girişi
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-xs font-semibold text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-[#e3372c]" />
            <span>Güvenli Giriş</span>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-[#e3372c] p-4 rounded-2xl text-sm font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        {/* Giriş Formu - Yan yana genişleyen Grid yapısı */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Kullanıcı Adı Inputu */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                Kullanıcı Adı *
              </label>
              <div className="relative">
                <AtSign className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Şifre Inputu */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                Şifre *
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

          </div>

          {/* Giriş Yap Butonu */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e3372c] text-white font-bold rounded-2xl px-6 py-4 hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50 text-base flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 group"
            >
              {loading ? (
                <span>Giriş Yapılıyor...</span>
              ) : (
                <>
                  <span>Sisteme Giriş Yap</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Alt Bilgi */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400 font-medium">
          <span>Moda Berliner QR Menu Systems</span>
          <span>© 2026 Admin Portal</span>
        </div>

      </div>
    </div>
  );
}