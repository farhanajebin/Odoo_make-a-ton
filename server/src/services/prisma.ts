import { PrismaClient } from '@prisma/client';
import { env } from '../config/environment.js';

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient | null {
  if (!env.DATABASE_URL) {
    return null;
  }

  if (!prisma) {
    prisma = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
