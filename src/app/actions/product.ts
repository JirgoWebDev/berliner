'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Toggles product availability (Menüde Göster / Menüden Çıkar).
 */
export async function toggleProductAvailability(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, isAvailable: true }
    });

    if (!product) return { success: false, error: 'Ürün bulunamadı' };

    const updated = await prisma.product.update({
      where: { id },
      data: { isAvailable: !product.isAvailable }
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');
    revalidatePath('/menu');
    return { success: true, isAvailable: updated.isAvailable };
  } catch (error) {
    console.error('Toggle product availability error:', error);
    return { success: false, error: String(error) };
  }
}
