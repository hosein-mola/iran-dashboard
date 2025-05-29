// Approach 1: Explicit Type Declaration (Recommended)
import { PrismaClient } from '@/prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  interface Global {
    prisma: PrismaClientSingleton | undefined;
  }
}

const prisma = globalThis.prisma || prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
