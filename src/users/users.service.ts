import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isPrismaUniqueError } from '../common/prisma/is-prisma-unique-error.js';
import { Prisma, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail } from './normalize-email.js';
import type { AuthUser } from './user.js';

const userSelect = {
  id: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

/**
 * The only place that reads the users table.
 * Password hashes stay inside this class.
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(email: string, passwordHash: string): Promise<AuthUser> {
    const normalized = normalizeEmail(email);
    try {
      const row = await this.prisma.user.create({
        data: {
          email: normalized,
          passwordHash,
          role: this.roleFor(normalized),
        },
        select: userSelect,
      });
      return toUser(row);
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    return row ? toUser(row) : null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: userSelect,
    });
    return row ? toUser(row) : null;
  }

  /** For password sign-in only. */
  async findCredentials(
    email: string,
  ): Promise<{ user: AuthUser; passwordHash: string } | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: { ...userSelect, passwordHash: true },
    });
    if (!row) {
      return null;
    }
    const { passwordHash, ...user } = row;
    return { user: toUser(user), passwordHash };
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /** Emails listed in ADMIN_EMAILS become admins at sign-up. Everyone else is a user. */
  private roleFor(email: string): Role {
    const configured = this.config.get<string>('ADMIN_EMAILS') ?? '';
    const admins = configured
      .split(',')
      .map((value) => normalizeEmail(value))
      .filter((value) => value.length > 0);
    return admins.includes(email) ? Role.ADMIN : Role.USER;
  }
}

function toUser(row: UserRow): AuthUser {
  return { id: row.id, email: row.email, role: row.role };
}
