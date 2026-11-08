import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { AuthUser } from '../users/user.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly users: UsersService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(email: string, password: string): Promise<AuthUser> {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }
    return this.users.create(email, await this.passwordHasher.hash(password));
  }

  /**
   * The user, or `null` when the email or the password is wrong.
   * Both cases take the same path, so the response does not reveal which emails are registered.
   */
  async verify(email: string, password: string): Promise<AuthUser | null> {
    const found = await this.users.findCredentials(email);
    const valid = await this.passwordHasher.verify(
      password,
      found?.passwordHash,
    );
    if (!valid || !found?.passwordHash) {
      return null;
    }
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.users.updatePasswordHash(
        found.user.id,
        await this.passwordHasher.hash(password),
      );
    }
    return found.user;
  }
}
