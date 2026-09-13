import prisma from '@/lib/prisma';
import { MenuDisplay } from '@/components/MenuDisplay';

export const revalidate = 60; // 60 saniyede bir (cache) yeniler, veritabanını hiç yormaz!

export default async function MenuPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  return <MenuDisplay categories={categories} />;
}
