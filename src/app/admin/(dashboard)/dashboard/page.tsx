import prisma, { isRemoteDatabase, ensureTursoInitialized } from '@/lib/prisma';
import { Tag, Utensils, AlertTriangle, CheckCircle2, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await ensureTursoInitialized();

  const isRemote = isRemoteDatabase();
  let categoryCount = 0;
  let productCount = 0;
  let activeProductCount = 0;
  let hiddenProductCount = 0;
  let dbError: string | null = null;

  try {
    categoryCount = await prisma.category.count();
    productCount = await prisma.product.count();
    activeProductCount = await prisma.product.count({ where: { isAvailable: true } });
    hiddenProductCount = await prisma.product.count({ where: { isAvailable: false } });
  } catch (error: unknown) {
    dbError = error instanceof Error ? error.message : String(error);
    console.error('Database connection error in dashboard:', error);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Yönetim Özeti
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Moda Berliner QR menü yönetim paneline hoş geldiniz.
          </p>
        </div>

        {/* Veritabanı Durumu Rozeti */}
        <div className="flex items-center gap-2">
          {isRemote ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Turso Cloud DB (Vercel Kalıcı Aktif ✓)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Yerel SQLite (dev.db)</span>
            </div>
          )}
        </div>
      </div>

      {dbError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Veritabanı Bağlantı Durumu</span>
          </div>
          <p className="text-xs text-amber-800 font-mono break-all">{dbError}</p>
        </div>
      )}

      {!isRemote && (
        <div className="bg-sky-50 border border-sky-200 text-sky-950 p-4 rounded-2xl text-xs md:text-sm space-y-2">
          <p className="font-bold text-sky-900 flex items-center gap-2">
            🚀 Vercel Canlı Yayını İçin Bilgilendirme
          </p>
          <p className="text-sky-800 leading-relaxed">
            Şu an yerel SQLite dosyasını kullanıyorsunuz. Vercel sunucusunda yeni ürün ekleme, silme ve düzenleme işlemlerinin kalıcı olması için projenizi ücretsiz <strong>Turso</strong> veritabanına bağlayabilirsiniz.
          </p>
          <p className="text-sky-700 font-mono text-xs">
            Tek komutla yerel verilerinizi Turso&apos;ya aktarmak için terminalde: <code className="bg-white/80 px-2 py-0.5 rounded border border-sky-200 text-sky-900">npm run db:sync-turso</code>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Toplam Kategori</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{categoryCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-[#e3372c] rounded-2xl flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Toplam Ürün</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{productCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Menüde Aktif</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{activeProductCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-2xl flex items-center justify-center shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Menüden Çıkarılan</p>
            <p className="text-2xl font-black text-neutral-600 mt-0.5">{hiddenProductCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
