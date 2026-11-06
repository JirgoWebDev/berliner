import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import path from 'path';

function getDatabaseConfig() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL;

  // 1. Check for remote Turso URL
  if (tursoUrl && !tursoUrl.startsWith('file:')) {
    return {
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
      isRemote: true,
    };
  }

  // 2. Check for remote DATABASE_URL (libsql://...)
  if (dbUrl && !dbUrl.startsWith('file:')) {
    return {
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
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

export const isRemoteDatabase = dbConfig.isRemote;
export default prisma;
export { prisma as defaultPrisma };
