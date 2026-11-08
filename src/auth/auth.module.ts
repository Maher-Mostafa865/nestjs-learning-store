import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthResolver } from './auth.resolver.js';
import { AuthService } from './auth.service.js';
import { CredentialsService } from './credentials.service.js';
import { JwtAuth } from './jwt-auth.provider.js';
import { PrismaRefreshTokenStore } from './refresh-token.store.js';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [AuthController],
  providers: [
    CredentialsService,
    AuthService,
    JwtAuth,
    PrismaRefreshTokenStore,
    AuthResolver,
  ],
})
export class AuthModule {}
