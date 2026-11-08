import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '@nestjs/authentication';
import type { AuthUser } from '../users/user.js';
import { CredentialsService } from './credentials.service.js';

export interface SignedIn {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const PASSWORD_SIGN_IN = { method: 'password', claims: { amr: ['pwd'] } };

@Injectable()
export class AuthService {
  constructor(
    private readonly credentials: CredentialsService,
    private readonly tokens: TokenService,
  ) {}

  async signUp(email: string, password: string): Promise<SignedIn> {
    const user = await this.credentials.register(email, password);
    const tokens = await this.tokens.issue(user.id, PASSWORD_SIGN_IN);
    return { user, ...tokens };
  }

  async signIn(email: string, password: string): Promise<SignedIn> {
    const user = await this.credentials.verify(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = await this.tokens.issue(user.id, PASSWORD_SIGN_IN);
    return { user, ...tokens };
  }

  refresh(refreshToken: string) {
    return this.tokens.refresh(refreshToken);
  }

  /** Revokes one refresh-token family. Unknown tokens resolve false and are not reported. */
  signOut(refreshToken: string): Promise<boolean> {
    return this.tokens.revoke(refreshToken);
  }
}
