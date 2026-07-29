import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton (guarded against hot reloads).
 *
 * In development the instance is cached on `globalThis`, which stops Next.js
 * HMR from creating a new PrismaClient on every change.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
