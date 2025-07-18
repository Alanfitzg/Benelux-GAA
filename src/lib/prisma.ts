import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize for serverless environments
    transactionOptions: {
      maxWait: 5000, // 5 seconds max wait
      timeout: 10000, // 10 seconds timeout
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 