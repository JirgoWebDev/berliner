import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Veritabanını temizle
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Eski veriler temizlendi. Yeni test verileri ekleniyor...');

  // Kategoriler oluştur
  const category1 = await prisma.category.create({
    data: {
      name_tr: 'Berliner Tatlıları',
      name_en: 'Berliner Desserts',
      order: 1,
      products: {
        create: [
          {
            name_tr: 'Klasik Berliner',
            name_en: 'Classic Berliner',
            description_tr: 'Pudra şekerli, çilek marmelatı dolgulu klasik berliner.',
            description_en: 'Classic berliner filled with strawberry marmalade, topped with powdered sugar.',
            price: 65,
            order: 1,
          },
          {
            name_tr: 'Çikolatalı Berliner',
            name_en: 'Chocolate Berliner',
            description_tr: 'Yoğun Belçika çikolatası dolgulu ve üzeri çikolata kaplı.',
            description_en: 'Filled with rich Belgian chocolate and coated with chocolate.',
            price: 75,
            order: 2,
          },
          {
            name_tr: 'Kremalı Berliner',
            name_en: 'Cream Berliner',
            description_tr: 'Taze pastacı kreması dolgulu yumuşacık berliner.',
            description_en: 'Soft berliner filled with fresh pastry cream.',
            price: 70,
            order: 3,
          }
        ]
      }
    }
  });

  const category2 = await prisma.category.create({
    data: {
      name_tr: 'Sıcak İçecekler',
      name_en: 'Hot Drinks',
      order: 2,
      products: {
        create: [
          {
            name_tr: 'Türk Kahvesi',
            name_en: 'Turkish Coffee',
            description_tr: 'Taze çekilmiş geleneksel Türk kahvesi.',
            description_en: 'Freshly ground traditional Turkish coffee.',
            price: 45,
            order: 1,
          },
          {
            name_tr: 'Filtre Kahve',
            name_en: 'Filter Coffee',
            description_tr: 'Taze demlenmiş %100 Arabica filtre kahve.',
            description_en: 'Freshly brewed 100% Arabica filter coffee.',
            price: 55,
            order: 2,
          },
          {
            name_tr: 'Çay',
            name_en: 'Turkish Tea',
            description_tr: 'İnce belli bardakta tavşan kanı çay.',
            description_en: 'Traditional Turkish tea served in a tulip glass.',
            price: 25,
            order: 3,
          }
        ]
      }
    }
  });

  const category3 = await prisma.category.create({
    data: {
      name_tr: 'Soğuk İçecekler',
      name_en: 'Cold Drinks',
      order: 3,
      products: {
        create: [
          {
            name_tr: 'Ev Yapımı Limonata',
            name_en: 'Homemade Lemonade',
            description_tr: 'Taze limon ve nane yapraklarıyla hazırlanan serinletici limonata.',
            description_en: 'Refreshing lemonade made with fresh lemons and mint leaves.',
            price: 65,
            order: 1,
          },
          {
            name_tr: 'Iced Latte',
            name_en: 'Iced Latte',
            description_tr: 'Buzlu espresso ve soğuk süt.',
            description_en: 'Iced espresso with cold milk.',
            price: 85,
            order: 2,
          },
          {
            name_tr: 'Maden Suyu',
            name_en: 'Mineral Water',
            price: 30,
            order: 3,
          }
        ]
      }
    }
  });

  console.log('Test verileri başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
