import { PrismaClient } from '@prisma/client';
import config from '@/config/config';

// Add prisma to the NodeJS global type
interface CustomNodeJsGlobal {
  prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['info', 'warn', 'error'],
  });

if (config.env === 'development') global.prisma = prisma;

export default prisma;

// Prisma's interactive-transaction default (5s timeout, 2s maxWait) assumes a
// low-latency DB. Against a serverless Postgres host (Neon) that can add
// connection/cold-start latency per round trip, a transaction with several
// sequential creates can blow past 5s and abort with "Transaction already
// closed" even though nothing was actually wrong. Give every multi-step
// interactive transaction more headroom: prisma.$transaction(fn, TX_OPTIONS).
export const TX_OPTIONS = { timeout: 15_000, maxWait: 10_000 };
