'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Reorders a Category by moving it up or down relative to existing categories.
 */
export async function reorderCategory(id: string, direction: 'up' | 'down') {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' }
  });

  const currentIndex = categories.findIndex((c) => c.id === id);
  if (currentIndex === -1) return;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= categories.length) return;

  const currentCat = categories[currentIndex];
  const targetCat = categories[targetIndex];

  // If both have identical order numbers, adjust target to make swapping distinct
  let currentOrder = currentCat.order;
  let targetOrder = targetCat.order;

  if (currentOrder === targetOrder) {
    currentOrder = currentIndex;
    targetOrder = targetIndex;
  }

  await prisma.$transaction([
    prisma.category.update({
      where: { id: currentCat.id },
      data: { order: targetOrder }
    }),
    prisma.category.update({
      where: { id: targetCat.id },
      data: { order: currentOrder }
    })
  ]);

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  revalidatePath('/menu');
}

/**
 * Updates a Category's order number directly.
 */
export async function updateCategoryOrder(id: string, newOrder: number) {
  await prisma.category.update({
    where: { id },
    data: { order: newOrder }
  });

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  revalidatePath('/menu');
}

/**
 * Reorders a Product within its category by moving it up or down.
 */
export async function reorderProduct(id: string, direction: 'up' | 'down') {
  const currentProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!currentProduct) return;

  const categoryProducts = await prisma.product.findMany({
    where: { categoryId: currentProduct.categoryId },
    orderBy: { order: 'asc' }
  });

  const currentIndex = categoryProducts.findIndex((p) => p.id === id);
  if (currentIndex === -1) return;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= categoryProducts.length) return;

  const targetProduct = categoryProducts[targetIndex];

  let currentOrder = currentProduct.order;
  let targetOrder = targetProduct.order;

  if (currentOrder === targetOrder) {
    currentOrder = currentIndex;
    targetOrder = targetIndex;
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: currentProduct.id },
      data: { order: targetOrder }
    }),
    prisma.product.update({
      where: { id: targetProduct.id },
      data: { order: currentOrder }
    })
  ]);

  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  revalidatePath('/menu');
}

/**
 * Updates a Product's order number directly.
 */
export async function updateProductOrder(id: string, newOrder: number) {
  await prisma.product.update({
    where: { id },
    data: { order: newOrder }
  });

  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  revalidatePath('/menu');
}
