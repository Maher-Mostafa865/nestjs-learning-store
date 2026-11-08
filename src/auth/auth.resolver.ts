import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Authenticate, CurrentUser, Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { hours, minutes, SkipThrottle, Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../users/user.js';
import { AuthService } from './auth.service.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import {
  AuthTokensType,
  AuthUserType,
  SignedInType,
} from './graphql/auth.types.js';

@Public()
@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @SkipThrottle({ account: true })
  @Throttle({ default: { limit: 10, ttl: hours(1) } })
  @Mutation(() => SignedInType)
  signUp(@Args('input') input: SignUpDto) {
    return this.auth.signUp(input.email, input.password);
  }

  @Throttle({
    default: { limit: 30, ttl: minutes(15) },
    account: { limit: 5, ttl: minutes(15) },
  })
  @Mutation(() => SignedInType)
  signIn(@Args('input') input: SignInDto) {
    return this.auth.signIn(input.email, input.password);
  }

  @SkipThrottle({ account: true })
  @Throttle({ default: { limit: 30, ttl: minutes(15) } })
  @Mutation(() => AuthTokensType)
  refreshToken(@Args('input') input: RefreshTokenDto) {
    return this.auth.refresh(input.refreshToken);
  }

  @SkipThrottle({ account: true })
  @Throttle({ default: { limit: 30, ttl: minutes(15) } })
  @Mutation(() => Boolean)
  async signOut(@Args('input') input: RefreshTokenDto): Promise<boolean> {
    await this.auth.signOut(input.refreshToken);
    return true;
  }

  @Authenticate()
  @Can.Anyone()
  @Query(() => AuthUserType, { name: 'me' })
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
