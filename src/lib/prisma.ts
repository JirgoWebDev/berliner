import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import path from 'path';

function cleanEnv(val: string | undefined): string | undefined {
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, '');
}

export function getDatabaseConfig() {
  const tursoUrl = cleanEnv(process.env.TURSO_DATABASE_URL);
  const dbUrl = cleanEnv(process.env.DATABASE_URL);
  const authToken = cleanEnv(process.env.TURSO_AUTH_TOKEN);

  // 1. Check for remote Turso URL
  if (tursoUrl && !tursoUrl.startsWith('file:')) {
    return {
      url: tursoUrl,
      authToken: authToken,
      isRemote: true,
    };
  }

  // 2. Check for remote DATABASE_URL (libsql://...)
  if (dbUrl && !dbUrl.startsWith('file:')) {
    return {
      url: dbUrl,
      authToken: authToken,
      isRemote: true,
    };
  }

  // 3. Fallback to local SQLite file
  const localDbPath = path.join(process.cwd(), 'dev.db').replace(/\\/g, '/');
  return {
    url: `file:${localDbPath}`,
    authToken: undefined,
    isRemote: false,
  };
}

const dbConfig = getDatabaseConfig();

const adapter = new PrismaLibSql({
  url: dbConfig.url,
  authToken: dbConfig.authToken,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let initPromise: Promise<void> | null = null;

export async function ensureTursoInitialized() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const config = getDatabaseConfig();
    if (!config.isRemote) return;

    try {
      const { createClient } = await import('@libsql/client');
      const client = createClient({
        url: config.url,
        authToken: config.authToken,
      });

      // 1. Tablolar yoksa oluştur
      await client.batch([
        `CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "name_tr" TEXT NOT NULL,
          "name_en" TEXT NOT NULL,
          "imageUrl" TEXT,
          "order" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS "Product" (
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
        )`,
        `CREATE TABLE IF NOT EXISTS "Feedback" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "rating" INTEGER NOT NULL,
          "comment" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "username" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL
        )`
      ]);

      // 2. Turso boş ise yerel dev.db'deki kategorileri ve ürünleri otomatik aktar
      const countRes = await client.execute('SELECT COUNT(*) as c FROM Category');
      const count = Number(countRes.rows[0]?.c || 0);

      if (count === 0) {
        console.log('Turso veritabanı boş, yerel dev.db verileri otomatik aktarılıyor...');
        const localDbPath = path.join(process.cwd(), 'dev.db').replace(/\\/g, '/');
        const localClient = createClient({ url: `file:${localDbPath}` });

        const cats = await localClient.execute('SELECT * FROM Category');
        for (const cat of cats.rows) {
          await client.execute({
            sql: `INSERT OR IGNORE INTO Category (id, name_tr, name_en, imageUrl, "order", createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [cat.id, cat.name_tr, cat.name_en, cat.imageUrl ?? null, cat.order ?? 0, cat.createdAt, cat.updatedAt]
          });
        }

        const prods = await localClient.execute('SELECT * FROM Product');
        for (const prod of prods.rows) {
          await client.execute({
            sql: `INSERT OR IGNORE INTO Product (id, categoryId, name_tr, name_en, description_tr, description_en, price, imageUrl, isAvailable, "order", createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
              prod.updatedAt
            ]
          });
        }
        console.log(`Turso'ya ${cats.rows.length} kategori ve ${prods.rows.length} ürün başarıyla yüklendi!`);
      }
    } catch (err) {
      console.error('Turso otomatik başlatma hatası:', err);
    }
  })();
  return initPromise;
}

export const isRemoteDatabase = () => getDatabaseConfig().isRemote;
export default prisma;
export { prisma as defaultPrisma };
