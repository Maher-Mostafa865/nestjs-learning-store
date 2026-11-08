import { describe, expect, it } from 'vitest';
import { Role } from '../generated/prisma/client.js';
import type { AuthUser } from '../users/user.js';
import { ProductPolicy } from './product.policy.js';

const guest = null;
const customer: AuthUser = { id: '1', email: 'ada@example.com', role: Role.USER };
const admin: AuthUser = { id: '2', email: 'admin@example.com', role: Role.ADMIN };

describe('ProductPolicy', () => {
  const policy = new ProductPolicy();

  it.each(['create', 'update', 'remove'] as const)(
    'allows an admin to %s a product',
    (ability) => {
      expect(policy[ability](admin)).toBe(true);
    },
  );

  it.each(['create', 'update', 'remove'] as const)(
    'refuses a customer and a guest to %s a product',
    (ability) => {
      expect(policy[ability](customer)).toBe(false);
      expect(policy[ability](guest)).toBe(false);
    },
  );
});
