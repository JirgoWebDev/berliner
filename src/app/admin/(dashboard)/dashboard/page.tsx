import prisma from '@/lib/prisma';
import { Tag, Utensils, AlertTriangle } from 'lucide-react';

export default async function AdminDashboardPage() {
  let categoryCount = 0;
  let productCount = 0;
  let dbError: string | null = null;

  try {
    categoryCount = await prisma.category.count();
    productCount = await prisma.product.count();
  } catch (error: unknown) {
    dbError = error instanceof Error ? error.message : String(error);
    console.error('Database connection error in dashboard:', error);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Yönetim Özeti</h2>

      {dbError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Veritabanı Bağlantı Durumu</span>
          </div>
          <p className="text-xs text-amber-800 font-mono break-all">{dbError}</p>
          <p className="text-xs text-neutral-600 mt-2">
            Vercel üzerinde kalıcı veritabanı için Vercel Settings &gt; Environment Variables kısmına <strong>TURSO_DATABASE_URL</strong> ve <strong>TURSO_AUTH_TOKEN</strong> değerlerini ekleyebilirsiniz.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Toplam Kategori</p>
            <p className="text-2xl font-bold text-neutral-900">{categoryCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Toplam Ürün</p>
            <p className="text-2xl font-bold text-neutral-900">{productCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
