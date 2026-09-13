import prisma from '@/lib/prisma';
import { Tag, Utensils } from 'lucide-react';

export default async function AdminDashboardPage() {
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Yönetim Özeti</h2>
      
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
