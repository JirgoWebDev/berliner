import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const localDbPath = path.join(process.cwd(), 'dev.db');
const dbUrl =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  `file:${localDbPath}`;

const adapter = new PrismaLibSql({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
export { prisma as defaultPrisma };
