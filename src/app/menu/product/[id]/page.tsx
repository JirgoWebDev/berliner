import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export const revalidate = 60; // 60 saniyede bir cache yenilenir

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true }
  });

  if (!product || !product.isAvailable) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
