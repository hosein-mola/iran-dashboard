// Approach 1: Explicit Type Declaration (Recommended)
import path from 'node:path';

import { PrismaClient } from '@/prisma/client/client';

const prismaClientSingleton = () => {
  const datasourceUrl =
    process.env.DATABASE_URL ??
    `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;

  return new PrismaClient({ datasourceUrl });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  interface Global {
    prisma: PrismaClientSingleton | undefined;
  }
}

const cachedPrisma = globalThis.prisma;
const prisma = cachedPrisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
