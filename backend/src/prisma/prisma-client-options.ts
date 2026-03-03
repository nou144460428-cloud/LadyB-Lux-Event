import { PrismaClient } from '@prisma/client';

type PrismaCtor = new (options: unknown) => unknown;

function resolvePrismaClientOptions(): unknown {
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
  if (accelerateUrl) {
    return { accelerateUrl };
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'Prisma configuration error: set DATABASE_URL (for adapter mode) or PRISMA_ACCELERATE_URL.',
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require('@prisma/adapter-pg') as {
      PrismaPg: new (options: { connectionString: string }) => unknown;
    };

    return {
      adapter: new PrismaPg({ connectionString }),
    };
  } catch {
    throw new Error(
      'Prisma 7 requires a driver adapter. Install "@prisma/adapter-pg" and "pg", or set PRISMA_ACCELERATE_URL.',
    );
  }
}

export function createPrismaClient(): unknown {
  const Client = PrismaClient as unknown as PrismaCtor;
  return new Client(resolvePrismaClientOptions());
}
