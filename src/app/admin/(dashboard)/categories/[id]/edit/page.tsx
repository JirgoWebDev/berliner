import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Layers, Save, ArrowLeft } from 'lucide-react';
import { ImageDropzone } from '@/components/ImageDropzone';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import Link from 'next/link';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const category = await prisma.category.findUnique({
    where: { id }
  });

  if (!category) {
    redirect('/admin/categories');
  }

  async function updateCategory(formData: FormData) {
    'use server';
    if (!category) return;

    try {
      const name_tr = formData.get('name_tr') as string;
      const name_en = formData.get('name_en') as string;
      const orderInput = formData.get('order') as string;
      const order = orderInput ? parseInt(orderInput, 10) : category.order;
      const imageFile = formData.get('image') as File | null;
      const pexelsUrl = formData.get('pexelsUrl') as string | null;
      
      let imageUrl = category.imageUrl; // Keep old image by default

      if (pexelsUrl) {
        imageUrl = pexelsUrl;
      } else if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      if (name_tr && name_en) {
        await prisma.category.update({
          where: { id },
          data: { name_tr, name_en, imageUrl, order: isNaN(order) ? category.order : order }
        });
        revalidatePath('/admin/categories');
        revalidatePath('/menu');
        redirect('/admin/categories');
      }
    } catch (error: unknown) {
      const err = error as { digest?: string };
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
      console.error('Update category failed:', error);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto md:p-2">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 text-neutral-400 hover:text-neutral-900 bg-white rounded-xl border border-neutral-200 shadow-sm transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2 md:gap-3">
            <Layers className="w-6 h-6 md:w-8 md:h-8 text-[#e3372c]" />
            Kategori Düzenle
          </h2>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
        <form action={updateCategory} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori Adı (TR) *
            </label>
            <input 
              required 
              name="name_tr" 
              type="text" 
              defaultValue={category.name_tr}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori Adı (EN) *
            </label>
            <input 
              required 
              name="name_en" 
              type="text" 
              defaultValue={category.name_en}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Sıra / Index Numarası
            </label>
            <input 
              name="order" 
              type="number" 
              defaultValue={category.order}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all" 
            />
            <p className="text-xs text-neutral-400 mt-1">Kategorinin menüdeki gösterim sırası (Küçük olan önce görünür).</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori Görseli (Değiştirmek istemiyorsanız boş bırakın)
            </label>
            {category.imageUrl && (
              <div className="mb-4">
                <span className="block text-xs text-neutral-500 mb-2">Mevcut Görsel:</span>
                <img src={category.imageUrl} alt="Mevcut Görsel" className="w-24 h-24 object-cover rounded-xl border border-neutral-200" />
              </div>
            )}
            <ImageDropzone name="image" />
          </div>

          <div className="md:col-span-2 flex justify-end mt-4 pt-4 border-t border-neutral-100">
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-[#e3372c] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-md hover:shadow-lg active:scale-[0.99] transition-transform"
            >
              <Save className="w-5 h-5" />
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
