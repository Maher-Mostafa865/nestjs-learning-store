import { ConflictException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { CredentialsService } from './credentials.service.js';

describe('CredentialsService', () => {
  let service: CredentialsService;

  const users = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findCredentials: vi.fn(),
    updatePasswordHash: vi.fn(),
  };

  const passwordHasher = {
    hash: vi.fn(async (password: string) => `hashed:${password}`),
    verify: vi.fn(
      async (password: string, encoded?: string | null) =>
        encoded === `hashed:${password}`,
    ),
    needsRehash: vi.fn(() => false),
  };

  const user = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'USER' as const,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        { provide: UsersService, useValue: users },
        { provide: PasswordHasher, useValue: passwordHasher },
      ],
    }).compile();

    service = module.get(CredentialsService);
  });

  it('refuses an email that is already registered before hashing', async () => {
    users.findByEmail.mockResolvedValue(user);

    await expect(
      service.register('ada@example.com', 'correct horse battery'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('stores the hash and returns the user', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue(user);

    await expect(
      service.register('ada@example.com', 'correct horse battery'),
    ).resolves.toEqual(user);
    expect(users.create).toHaveBeenCalledWith(
      'ada@example.com',
      'hashed:correct horse battery',
    );
  });

  it('checks a dummy hash when the email is unknown and returns null', async () => {
    users.findCredentials.mockResolvedValue(null);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      service.verify('missing@example.com', 'secret'),
    ).resolves.toBeNull();
    expect(passwordHasher.verify).toHaveBeenCalledWith('secret', undefined);
  });

  it('returns null for a wrong password', async () => {
    users.findCredentials.mockResolvedValue({
      user,
      passwordHash: 'hashed:other',
    });
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      service.verify('ada@example.com', 'secret'),
    ).resolves.toBeNull();
    expect(users.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('upgrades a hash whose cost is out of date', async () => {
    users.findCredentials.mockResolvedValue({
      user,
      passwordHash: 'hashed:correct horse battery',
    });
    passwordHasher.verify.mockResolvedValue(true);
    passwordHasher.needsRehash.mockReturnValue(true);

    await expect(
      service.verify('ada@example.com', 'correct horse battery'),
    ).resolves.toEqual(user);
    expect(users.updatePasswordHash).toHaveBeenCalledWith(
      'user-1',
      'hashed:correct horse battery',
    );
  });
});
