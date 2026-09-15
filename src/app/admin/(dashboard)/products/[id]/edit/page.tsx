import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { UtensilsCrossed, Save, ArrowLeft, Tag } from 'lucide-react';
import { ImageDropzone } from '@/components/ImageDropzone';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import Link from 'next/link';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

  if (!product) {
    redirect('/admin/products');
  }

  async function updateProduct(formData: FormData) {
    'use server';
    if (!product) return;

    try {
      const name_tr = formData.get('name_tr') as string;
      const name_en = formData.get('name_en') as string;
      const categoryId = formData.get('categoryId') as string;
      const price = parseFloat(formData.get('price') as string);
      const orderInput = formData.get('order') as string;
      const order = orderInput ? parseInt(orderInput, 10) : product.order;
      const description_tr = formData.get('description_tr') as string;
      const description_en = formData.get('description_en') as string;
      const imageFile = formData.get('image') as File | null;
      const pexelsUrl = formData.get('pexelsUrl') as string | null;

      let imageUrl = product.imageUrl; // Keep old image by default

      if (pexelsUrl) {
        imageUrl = pexelsUrl;
      } else if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      if (name_tr && name_en && categoryId && !isNaN(price)) {
        await prisma.product.update({
          where: { id },
          data: {
            name_tr,
            name_en,
            categoryId,
            price,
            description_tr,
            description_en,
            imageUrl,
            order: isNaN(order) ? product.order : order
          }
        });
        revalidatePath('/admin/products');
        revalidatePath('/menu');
        redirect('/admin/products');
      }
    } catch (error: unknown) {
      const err = error as { digest?: string };
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
      console.error('Update product failed:', error);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto md:p-2">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-neutral-400 hover:text-neutral-900 bg-white rounded-xl border border-neutral-200 shadow-sm transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2 md:gap-3">
            <UtensilsCrossed className="w-6 h-6 md:w-8 md:h-8 text-[#e3372c]" />
            Ürün Düzenle
          </h2>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
        <form action={updateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori *
            </label>
            <select
              required
              name="categoryId"
              defaultValue={product.categoryId}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Kategori Seçiniz...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
            </select>
          </div>

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
                defaultValue={product.price}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all"
              />
              <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Ürün Adı (TR) *
            </label>
            <input
              required
              name="name_tr"
              type="text"
              defaultValue={product.name_tr}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Ürün Adı (EN) *
            </label>
            <input
              required
              name="name_en"
              type="text"
              defaultValue={product.name_en}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Kategori İçi Sıra / Index Numarası
            </label>
            <input
              name="order"
              type="number"
              defaultValue={product.order}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all"
            />
            <p className="text-xs text-neutral-400 mt-1">Ürünün kendi kategorisi içindeki gösterim sırası (Küçük olan önce görünür).</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Açıklama (TR)
            </label>
            <textarea
              name="description_tr"
              rows={3}
              defaultValue={product.description_tr || ''}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Açıklama (EN)
            </label>
            <textarea
              name="description_en"
              rows={3}
              defaultValue={product.description_en || ''}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#e3372c] focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Ürün Görseli (Değiştirmek istemiyorsanız boş bırakın)
            </label>
            {product.imageUrl && (
              <div className="mb-4">
                <span className="block text-xs text-neutral-500 mb-2">Mevcut Görsel:</span>
                <img src={product.imageUrl} alt="Mevcut Görsel" className="w-24 h-24 object-cover rounded-xl border border-neutral-200" />
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
