import prisma, { ensureTursoInitialized } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PackagePlus, Image as ImageIcon, UtensilsCrossed, Tag, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { ImageDropzone } from '@/components/ImageDropzone';
import { reorderProduct } from '@/app/actions/reorder';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { AvailabilityToggle } from '@/components/admin/AvailabilityToggle';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  await ensureTursoInitialized();
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  const rawProducts = await prisma.product.findMany({
    include: { category: true }
  });

  // Kategori sırasına ve ürünün kategori içi sırasına göre sıralayalım
  const products = rawProducts.sort((a, b) => {
    if (a.category.order !== b.category.order) {
      return a.category.order - b.category.order;
    }
    return a.order - b.order;
  });

  // Her kategorideki ürünleri gruplayalım (kategori içi index için)
  const productsByCategory: { [categoryId: string]: typeof products } = {};
  for (const p of products) {
    if (!productsByCategory[p.categoryId]) {
      productsByCategory[p.categoryId] = [];
    }
    productsByCategory[p.categoryId].push(p);
  }

  async function addProduct(formData: FormData) {
    'use server';
    try {
      const name_tr = formData.get('name_tr') as string;
      const raw_name_en = formData.get('name_en') as string;
      const categoryId = formData.get('categoryId') as string;
      const price = parseFloat(formData.get('price') as string);
      const description_tr = formData.get('description_tr') as string;
      const description_en = formData.get('description_en') as string;
      const imageFile = formData.get('image') as File | null;
      const pexelsUrl = formData.get('pexelsUrl') as string | null;
      const isAvailable = formData.get('isAvailable') === 'on' || formData.get('isAvailable') === 'true';
      
      const name_en = raw_name_en && raw_name_en.trim().length > 0 ? raw_name_en.trim() : name_tr?.trim() || '';

      let imageUrl: string | null = null;

      if (pexelsUrl) {
        imageUrl = pexelsUrl;
      } else if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      if (name_tr && categoryId && !isNaN(price)) {
        const maxProd = await prisma.product.findFirst({
          where: { categoryId },
          orderBy: { order: 'desc' }
        });
        const nextOrder = maxProd ? maxProd.order + 1 : 0;

        await prisma.product.create({
          data: { 
            name_tr: name_tr.trim(), 
            name_en: name_en, 
            categoryId, 
            price, 
            description_tr: description_tr?.trim() || null, 
            description_en: description_en?.trim() || null,
            imageUrl,
            isAvailable,
            order: nextOrder 
          }
        });
        revalidatePath('/admin/products');
        revalidatePath('/admin/dashboard');
        revalidatePath('/menu');
      }
    } catch (error: unknown) {
      console.error('Add product failed:', error);
    }
  }

  async function deleteProduct(formData: FormData) {
    'use server';
    try {
      const id = formData.get('id') as string;
      if (!id) return;
      await prisma.product.delete({ where: { id } });
      revalidatePath('/admin/products');
      revalidatePath('/admin/dashboard');
      revalidatePath('/menu');
    } catch (error: unknown) {
      console.error('Delete product failed:', error);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto md:p-2">
      {/* Üst Başlık Bölümü */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2 md:gap-3">
            <UtensilsCrossed className="w-6 h-6 md:w-8 md:h-8 text-[#e3372c]" />
            Ürün Yönetimi
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Menünüzdeki ürünleri ekleyin, düzenleyin, sırasını değiştirin veya menüden çıkarıp aktif edin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-50 text-[#e3372c] font-semibold px-4 py-2 rounded-full text-xs md:text-sm border border-red-100">
            Toplam: {products.length} Ürün
          </div>
        </div>
      </div>
      
      {/* Ürün Ekleme Formu */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-neutral-100 text-neutral-800 font-semibold text-base md:text-lg">
          <PackagePlus className="w-5 h-5 text-[#e3372c]" />
          <span>Yeni Ürün Ekle</span>
        </div>

        <form action={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Kategori Seçimi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori *
            </label>
            <select 
              required 
              name="categoryId" 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Kategori Seçiniz...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
            </select>
          </div>

          {/* Fiyat Inputu */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Fiyat (₺) *
            </label>
            <div className="relative">
              <input 
                required 
                name="price" 
                type="number" 
                step="0.01" 
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
                placeholder="0.00" 
              />
              <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Ürün Adı (TR) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Ürün Adı (TR) *
            </label>
            <input 
              required 
              name="name_tr" 
              type="text" 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
              placeholder="Örn: Berliner Çikolatalı" 
            />
          </div>

          {/* Ürün Adı (EN) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Ürün Adı (EN) <span className="text-neutral-400 font-normal lowercase">(isteğe bağlı)</span>
            </label>
            <input 
              name="name_en" 
              type="text" 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
              placeholder="Boş bırakılırsa Türkçe isim kullanılır" 
            />
          </div>

          {/* Açıklama (TR) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Açıklama (TR)
            </label>
            <textarea 
              name="description_tr" 
              rows={3} 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all resize-none" 
              placeholder="Belçika çikolatası ve özel krema dolgusu ile..." 
            />
          </div>

          {/* Açıklama (EN) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Açıklama (EN)
            </label>
            <textarea 
              name="description_en" 
              rows={3} 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all resize-none" 
              placeholder="Filled with Belgian chocolate and special cream..." 
            />
          </div>

          {/* Dosya Yükleme Alanı */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Ürün Görseli
            </label>
            <ImageDropzone name="image" />
          </div>

          {/* Durum Checkbox */}
          <div className="md:col-span-2 flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              defaultChecked
              className="w-5 h-5 text-[#e3372c] rounded focus:ring-[#e3372c] cursor-pointer"
            />
            <label htmlFor="isAvailable" className="text-sm font-semibold text-neutral-700 cursor-pointer">
              Bu ürünü hemen menüde yayınla (Stokta Var)
            </label>
          </div>

          {/* Kaydet Butonu */}
          <div className="md:col-span-2 flex justify-end mt-2">
            <button 
              type="submit" 
              className="bg-[#e3372c] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-md hover:shadow-lg active:scale-[0.99] transition-transform cursor-pointer"
            >
              Ürünü Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* Ürün Listesi Tablosu */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[10px] md:text-xs uppercase tracking-wider font-bold text-neutral-500">
                <th className="px-4 md:px-6 py-3 md:py-4 w-20 text-center">Sıra</th>
                <th className="px-4 md:px-6 py-3 md:py-4 w-16">Görsel</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Ürün Adı</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Kategori</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Fiyat</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Durum</th>
                <th className="px-4 md:px-6 py-3 md:py-4 w-52 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {products.map((prod) => {
                const categoryList = productsByCategory[prod.categoryId] || [];
                const indexInCategory = categoryList.findIndex((p) => p.id === prod.id);
                const totalInCategory = categoryList.length;

                return (
                  <tr key={prod.id} className={`hover:bg-neutral-50/50 transition-colors ${!prod.isAvailable ? 'opacity-60 bg-neutral-50/30' : ''}`}>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <span className="font-extrabold text-xs bg-red-50 text-[#e3372c] px-3 py-1.5 rounded-xl border border-red-100 shadow-xs inline-block">
                        #{indexInCategory + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {prod.imageUrl ? (
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name_tr} 
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200 bg-neutral-100" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{prod.name_tr}</div>
                      <div className="text-xs text-neutral-400">{prod.name_en}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {prod.category.name_tr}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-neutral-900 text-base">
                      {prod.price.toFixed(2)} ₺
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {prod.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Menüde Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500 border border-neutral-300">
                          <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                          Menüden Çıkarıldı
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Menüde Göster / Menüden Çıkar Hızlı Butonu */}
                        <AvailabilityToggle
                          productId={prod.id}
                          initialAvailable={prod.isAvailable}
                        />

                        {/* Yukarı Taşı */}
                        <form action={reorderProduct.bind(null, prod.id, 'up')} className="inline-block">
                          <button
                            type="submit"
                            disabled={indexInCategory === 0}
                            className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-200 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-600 cursor-pointer disabled:cursor-not-allowed"
                            title="Kategori İçinde Yukarı Taşı"
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                        </form>

                        {/* Aşağı Taşı */}
                        <form action={reorderProduct.bind(null, prod.id, 'down')} className="inline-block">
                          <button
                            type="submit"
                            disabled={indexInCategory === totalInCategory - 1}
                            className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-200 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-600 cursor-pointer disabled:cursor-not-allowed"
                            title="Kategori İçinde Aşağı Taşı"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                        </form>

                        {/* Düzenle */}
                        <Link 
                          href={`/admin/products/${prod.id}/edit`}
                          className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 border border-neutral-200 rounded-xl transition-all"
                          title="Ürünü Düzenle"
                        >
                          <Pencil className="w-5 h-5" />
                        </Link>

                        {/* Sil (Onay Korumalı) */}
                        <DeleteButton
                          action={deleteProduct}
                          id={prod.id}
                          confirmMessage={`"${prod.name_tr}" ürününü silmek istediğinize emin misiniz?`}
                          title="Ürünü Sil"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                    <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                    Henüz hiçbir ürün eklenmemiş.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
