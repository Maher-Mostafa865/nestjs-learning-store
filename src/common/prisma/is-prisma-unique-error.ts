import { Prisma } from '../../generated/prisma/client.js';

/** True when a write violates a unique constraint (P2002). */
export function isPrismaUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
