import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Authenticate, CurrentUser, Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { hours, minutes, SkipThrottle, Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../users/user.js';
import { AuthService } from './auth.service.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @SkipThrottle({ account: true })
  @Throttle({ default: { limit: 10, ttl: hours(1) } })
  @Post('sign-up')
  signUp(@Body() body: SignUpDto) {
    return this.auth.signUp(body.email, body.password);
  }

  @Throttle({
    default: { limit: 30, ttl: minutes(15) },
    account: { limit: 5, ttl: minutes(15) },
  })
  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() body: SignInDto) {
    return this.auth.signIn(body.email, body.password);
  }

  @SkipThrottle({ account: true })
  @Throttle({ default: { limit: 30, ttl: minutes(15) } })
  @Post('token/refresh')
  @HttpCode(200)
  refresh(@Body() body: RefreshTokenDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @SkipThrottle({ account: true })
  @Throttle({ default: { limit: 30, ttl: minutes(15) } })
  @Post('sign-out')
  @HttpCode(204)
  async signOut(@Body() body: RefreshTokenDto): Promise<void> {
    await this.auth.signOut(body.refreshToken);
  }

  @Authenticate()
  @Can.Anyone()
  @Get('me')
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
