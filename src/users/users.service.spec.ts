import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

function uniqueError() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });
}

describe('UsersService', () => {
  let service: UsersService;

  const prisma = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  const config = {
    get: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    config.get.mockImplementation((key: string) =>
      key === 'ADMIN_EMAILS'
        ? 'Admin@Example.com, other@example.com'
        : undefined,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('stores a normalized email and keeps the password hash out of the result', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    await expect(
      service.create('  Admin@Example.com ', 'hash'),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'admin@example.com',
        passwordHash: 'hash',
        role: 'ADMIN',
      },
      select: { id: true, email: true, role: true },
    });
  });

  it('gives everyone else the USER role', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user-2',
      email: 'ada@shop.test',
      role: 'USER',
    });

    await service.create('ada@shop.test', 'hash');

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'USER' }),
      }),
    );
  });

  it('maps a unique email to a conflict', async () => {
    prisma.user.create.mockRejectedValue(uniqueError());

    await expect(
      service.create('ada@example.com', 'hash'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns credentials for sign-in and nothing for an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'ada@example.com',
      role: 'USER',
      passwordHash: 'stored',
    });

    await expect(service.findCredentials('Ada@Example.com')).resolves.toEqual({
      user: { id: 'user-1', email: 'ada@example.com', role: 'USER' },
      passwordHash: 'stored',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'ada@example.com' },
      select: { id: true, email: true, role: true, passwordHash: true },
    });

    prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.findCredentials('missing@example.com'),
    ).resolves.toBeNull();
  });
});
