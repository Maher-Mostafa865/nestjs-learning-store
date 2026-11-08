import type { Role } from '../generated/prisma/client.js';

/** A user safe to return from a route. Password hashes never appear here. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
