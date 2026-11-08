import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  JwtBearerProvider,
  type JwtClaims,
} from '@nestjs/authentication';
import type { AuthUser } from '../users/user.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class JwtAuth extends JwtBearerProvider<AuthUser> {
  constructor(
    private readonly users: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super({ realm: 'store' });
    registry.registerProvider(this);
  }

  /** A deleted user loses access on the next request, not when the access token expires. */
  validate({ sub }: JwtClaims): Promise<AuthUser | null> {
    return sub ? this.users.findById(sub) : Promise.resolve(null);
  }
}
