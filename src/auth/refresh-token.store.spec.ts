import { describe, expect, it, vi } from 'vitest';
import { PrismaRefreshTokenStore } from './refresh-token.store.js';

describe('PrismaRefreshTokenStore', () => {
  const prisma = {
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
      findFirst: vi.fn(),
    },
  };
  const storage = { registerSource: vi.fn() };
  const store = new PrismaRefreshTokenStore(prisma as never, storage as never);

  it('registers itself as the refresh-token store', () => {
    expect(storage.registerSource).toHaveBeenCalledWith({
      refreshTokens: store,
    });
  });

  it('marks a token used only while it is unused', async () => {
    const at = new Date('2026-11-08T10:00:00.000Z');
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

    await expect(store.markRefreshTokenUsed('token-hash', at)).resolves.toBe(
      true,
    );
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { id: 'token-hash', usedAt: null },
      data: { usedAt: at },
    });
  });

  it('reports a lost race when the conditional update changes nothing', async () => {
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      store.markRefreshTokenUsed('token-hash', new Date()),
    ).resolves.toBe(false);
  });

  it('omits null claims and usedAt from a loaded token', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'token-hash',
      familyId: 'family-1',
      userId: 'user-1',
      createdAt: new Date('2026-11-08T10:00:00.000Z'),
      expiresAt: new Date('2026-12-08T10:00:00.000Z'),
      familyExpiresAt: new Date('2027-02-06T10:00:00.000Z'),
      usedAt: null,
      revoked: false,
      claims: null,
    });

    const record = await store.getRefreshToken('token-hash');

    expect(record).toEqual({
      id: 'token-hash',
      familyId: 'family-1',
      userId: 'user-1',
      createdAt: new Date('2026-11-08T10:00:00.000Z'),
      expiresAt: new Date('2026-12-08T10:00:00.000Z'),
      familyExpiresAt: new Date('2027-02-06T10:00:00.000Z'),
    });
    expect(record).not.toHaveProperty('usedAt');
    expect(record).not.toHaveProperty('revoked');
    expect(record).not.toHaveProperty('claims');
  });
});
