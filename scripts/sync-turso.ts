import { createClient } from '@libsql/client';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function syncToTurso() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || tursoUrl.startsWith('file:')) {
    console.error('HATA: .env dosyanızda geçerli bir TURSO_DATABASE_URL (libsql://... formatında) tanımlı değil!');
    console.log('Lütfen Turso veritabanı URL ve TURSO_AUTH_TOKEN değerlerinizi .env dosyasına ekleyip tekrar deneyin.');
    process.exit(1);
  }

  console.log('1. Yerel veritabanı (dev.db) okunuyor...');
  const localDbPath = path.join(process.cwd(), 'dev.db').replace(/\\/g, '/');
  const localClient = createClient({ url: `file:${localDbPath}` });

  console.log('2. Uzak Turso veritabanına bağlanılıyor:', tursoUrl);
  const tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  // Tabloları Turso'da oluştur
  console.log('3. Turso üzerinde tablolar kontrol ediliyor ve oluşturuluyor...');
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name_tr" TEXT NOT NULL,
      "name_en" TEXT NOT NULL,
      "imageUrl" TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "categoryId" TEXT NOT NULL,
      "name_tr" TEXT NOT NULL,
      "name_en" TEXT NOT NULL,
      "description_tr" TEXT,
      "description_en" TEXT,
      "price" REAL NOT NULL,
      "imageUrl" TEXT,
      "isAvailable" BOOLEAN NOT NULL DEFAULT 1,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS "Feedback" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "rating" INTEGER NOT NULL,
      "comment" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "username" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL
    );
  `);

  // Yerel verileri çek
  const categoriesResult = await localClient.execute('SELECT * FROM Category');
  const productsResult = await localClient.execute('SELECT * FROM Product');

  console.log(`Yerel veritabanında ${categoriesResult.rows.length} kategori ve ${productsResult.rows.length} ürün bulundu.`);

  // Turso'ya kategorileri aktar
  console.log('4. Kategoriler Turso\'ya aktarılıyor...');
  for (const cat of categoriesResult.rows) {
    await tursoClient.execute({
      sql: `INSERT INTO Category (id, name_tr, name_en, imageUrl, "order", createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name_tr = excluded.name_tr,
              name_en = excluded.name_en,
              imageUrl = excluded.imageUrl,
              "order" = excluded."order",
              updatedAt = excluded.updatedAt`,
      args: [
        cat.id,
        cat.name_tr,
        cat.name_en,
        cat.imageUrl ?? null,
        cat.order ?? 0,
        cat.createdAt,
        cat.updatedAt,
      ],
    });
  }
  console.log(`✓ ${categoriesResult.rows.length} kategori başarıyla aktarıldı.`);

  // Turso'ya ürünleri aktar
  console.log('5. Ürünler Turso\'ya aktarılıyor...');
  for (const prod of productsResult.rows) {
    await tursoClient.execute({
      sql: `INSERT INTO Product (id, categoryId, name_tr, name_en, description_tr, description_en, price, imageUrl, isAvailable, "order", createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              categoryId = excluded.categoryId,
              name_tr = excluded.name_tr,
              name_en = excluded.name_en,
              description_tr = excluded.description_tr,
              description_en = excluded.description_en,
              price = excluded.price,
              imageUrl = excluded.imageUrl,
              isAvailable = excluded.isAvailable,
              "order" = excluded."order",
              updatedAt = excluded.updatedAt`,
      args: [
        prod.id,
        prod.categoryId,
        prod.name_tr,
        prod.name_en,
        prod.description_tr ?? null,
        prod.description_en ?? null,
        prod.price,
        prod.imageUrl ?? null,
        prod.isAvailable ?? 1,
        prod.order ?? 0,
        prod.createdAt,
        prod.updatedAt,
      ],
    });
  }
  console.log(`✓ ${productsResult.rows.length} ürün başarıyla aktarıldı.`);

  console.log('\n=========================================');
  console.log('TEBRİKLER! Tüm veriler Turso veritabanına başarıyla eşitlendi.');
  console.log('Vercel projenizde TURSO_DATABASE_URL ve TURSO_AUTH_TOKEN tanımlayarak canlıya alabilirsiniz.');
  console.log('=========================================\n');
}

syncToTurso().catch((err) => {
  console.error('Senkronizasyon hatası:', err);
  process.exit(1);
});
