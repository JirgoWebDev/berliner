import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL || 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Veritabanına bağlanılıyor...');

  // 1. "asdasd" yorumlarını sil
  const del1 = await prisma.feedback.deleteMany({
    where: {
      comment: {
        contains: 'asdasd'
      }
    }
  });
  console.log(`'asdasd' içeren ${del1.count} yorum silindi.`);

  // 2. Sadece "asd" yorumlarını sil (tam eşleşme veya içerir)
  const del2 = await prisma.feedback.deleteMany({
    where: {
      comment: {
        contains: 'asd'
      }
    }
  });
  console.log(`'asd' içeren ${del2.count} yorum silindi.`);

  // 3. 4 yıldız olan yorumu sil
  const del3 = await prisma.feedback.deleteMany({
    where: {
      rating: 4
    }
  });
  console.log(`4 yıldızlı ${del3.count} yorum silindi.`);

  console.log('İşlem tamamlandı!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
