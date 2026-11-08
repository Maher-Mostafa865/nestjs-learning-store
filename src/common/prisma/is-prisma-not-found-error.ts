import { Prisma } from '../../generated/prisma/client.js';

/** True when Prisma throws because a required record was not found (P2025). */
export function isPrismaNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}
