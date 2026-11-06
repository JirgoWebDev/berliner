import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { FolderPlus, Image as ImageIcon, Layers, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { ImageDropzone } from '@/components/ImageDropzone';
import { reorderCategory } from '@/app/actions/reorder';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  async function addCategory(formData: FormData) {
    'use server';
    try {
      const name_tr = formData.get('name_tr') as string;
      const raw_name_en = formData.get('name_en') as string;
      const imageFile = formData.get('image') as File | null;
      const pexelsUrl = formData.get('pexelsUrl') as string | null;
      
      const name_en = raw_name_en && raw_name_en.trim().length > 0 ? raw_name_en.trim() : name_tr?.trim() || '';

      let imageUrl: string | null = null;

      if (pexelsUrl) {
        imageUrl = pexelsUrl;
      } else if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      
      if (name_tr && name_tr.trim().length > 0) {
        const maxCat = await prisma.category.findFirst({ orderBy: { order: 'desc' } });
        const nextOrder = maxCat ? maxCat.order + 1 : 0;

        await prisma.category.create({
          data: { 
            name_tr: name_tr.trim(), 
            name_en: name_en, 
            imageUrl, 
            order: nextOrder 
          }
        });
        revalidatePath('/admin/categories');
        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/products');
        revalidatePath('/menu');
      }
    } catch (error: unknown) {
      console.error('Add category failed:', error);
    }
  }

  async function deleteCategory(formData: FormData) {
    'use server';
    try {
      const id = formData.get('id') as string;
      if (!id) return;
      await prisma.category.delete({ where: { id } });
      revalidatePath('/admin/categories');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/products');
      revalidatePath('/menu');
    } catch (error: unknown) {
      console.error('Delete category failed:', error);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto md:p-2">
      {/* Başlık Bölümü */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2 md:gap-3">
            <Layers className="w-6 h-6 md:w-8 md:h-8 text-[#e3372c]" />
            Kategori Yönetimi
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Menü kategorilerini ekleyin, sıralayın, düzenleyin veya silin.
          </p>
        </div>
        <div className="bg-red-50 text-[#e3372c] font-semibold px-4 py-2 rounded-full text-xs md:text-sm border border-red-100 self-start sm:self-auto">
          Toplam: {categories.length} Kategori
        </div>
      </div>
      
      {/* Kategori Ekleme Formu */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100 text-neutral-800 font-semibold text-base md:text-lg">
          <FolderPlus className="w-5 h-5 text-[#e3372c]" />
          <span>Yeni Kategori Ekle</span>
        </div>

        <form action={addCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori Adı (TR) *
            </label>
            <input 
              required 
              name="name_tr" 
              type="text" 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
              placeholder="Örn: Sıcak İçecekler" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori Adı (EN) <span className="text-neutral-400 font-normal lowercase">(isteğe bağlı)</span>
            </label>
            <input 
              name="name_en" 
              type="text" 
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
              placeholder="Boş bırakılırsa Türkçe isim kullanılır" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori Görseli (İsteğe Bağlı)
            </label>
            <ImageDropzone name="image" />
          </div>

          <div className="md:col-span-3 flex justify-end mt-2">
            <button 
              type="submit" 
              className="bg-[#e3372c] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-md hover:shadow-lg active:scale-[0.99] transition-transform cursor-pointer"
            >
              Kategoriyi Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* Kategoriler Tablosu */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[10px] md:text-xs uppercase tracking-wider font-bold text-neutral-500">
                <th className="px-4 md:px-6 py-3 md:py-4 w-24 text-center">Sıra</th>
                <th className="px-4 md:px-6 py-3 md:py-4 w-14 md:w-16">Görsel</th>
                <th className="px-4 md:px-6 py-3 md:py-4">TR İsim</th>
                <th className="px-4 md:px-6 py-3 md:py-4">EN İsim</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Ürün Sayısı</th>
                <th className="px-4 md:px-6 py-3 md:py-4 w-52 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-neutral-50/70 transition-all duration-200 group">
                  <td className="px-4 md:px-6 py-4 text-center">
                    <span className="font-extrabold text-xs bg-gradient-to-br from-red-50 to-amber-50 text-[#e3372c] px-3.5 py-1.5 rounded-xl border border-red-100/80 shadow-xs inline-block transition-transform duration-200 group-hover:scale-105">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {cat.imageUrl ? (
                      <img 
                        src={cat.imageUrl} 
                        alt={cat.name_tr} 
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200 bg-neutral-100 group-hover:shadow-sm transition-shadow" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-900">
                    {cat.name_tr}
                  </td>
                  <td className="px-6 py-4 font-medium text-neutral-500">
                    {cat.name_en}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                      {cat._count.products} Ürün
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Yukarı Taşı */}
                      <form action={reorderCategory.bind(null, cat.id, 'up')} className="inline-block">
                        <button
                          type="submit"
                          disabled={index === 0}
                          className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-1 active:translate-y-0 active:scale-90 transition-all duration-200 disabled:opacity-25 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-600 disabled:hover:border-indigo-100 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="w-5 h-5" />
                        </button>
                      </form>

                      {/* Aşağı Taşı */}
                      <form action={reorderCategory.bind(null, cat.id, 'down')} className="inline-block">
                        <button
                          type="submit"
                          disabled={index === categories.length - 1}
                          className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/20 hover:translate-y-1 active:translate-y-0 active:scale-90 transition-all duration-200 disabled:opacity-25 disabled:hover:bg-amber-50 disabled:hover:text-amber-600 disabled:hover:border-amber-100 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="w-5 h-5" />
                        </button>
                      </form>

                      {/* Düzenle */}
                      <Link 
                        href={`/admin/categories/${cat.id}/edit`}
                        className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-600 hover:text-white hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 hover:scale-105 active:scale-90 transition-all duration-200 inline-block"
                        title="Kategoriyi Düzenle"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>

                      {/* Sil (Onay Korumalı) */}
                      <DeleteButton
                        action={deleteCategory}
                        id={cat.id}
                        confirmMessage={`"${cat.name_tr}" kategorisini ve bu kategoriye ait ${cat._count.products} ürünü tamamen silmek istediğinize emin misiniz?`}
                        title="Kategoriyi Sil"
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-md hover:shadow-rose-500/20 hover:scale-105 hover:rotate-3 active:scale-90 transition-all duration-200 cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    <Layers className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                    Henüz hiçbir kategori eklenmemiş.
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
