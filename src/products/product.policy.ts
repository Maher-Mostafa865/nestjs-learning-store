import { Policy } from '@nestjs/authorization';
import { Role } from '../generated/prisma/client.js';
import type { AuthUser } from '../users/user.js';

const isAdmin = (user: AuthUser | null) => user?.role === Role.ADMIN;

/** Catalog changes are an admin ability. Guests and customers can only read. */
@Policy()
export class ProductPolicy {
  create(user: AuthUser | null): boolean {
    return isAdmin(user);
  }

  update(user: AuthUser | null): boolean {
    return isAdmin(user);
  }

  remove(user: AuthUser | null): boolean {
    return isAdmin(user);
  }
}
