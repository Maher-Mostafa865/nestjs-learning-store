import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule, type Duration } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { minutes, normalizeIp, ThrottlerModule } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { accountEmail, requestOf } from './auth/account-email.js';
import { AppThrottlerGuard } from './auth/app-throttler.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.js';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';
import { TestModule } from './test/test.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: minutes(1), limit: 100 },
      {
        name: 'account',
        ttl: minutes(15),
        limit: 5,
        skipIf: (context) => !accountEmail(requestOf(context)),
        getTracker: (req) =>
          `${accountEmail(req)}|${normalizeIp(typeof req.ip === 'string' ? req.ip : '')}`,
      },
    ]),
    // Authentication before authorization: its guard sets the user the policy reads.
    AuthenticationModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        accessToken: {
          key: config.getOrThrow<string>('JWT_SECRET'),
          issuer: config.getOrThrow<string>('JWT_ISSUER'),
          audience: config.getOrThrow<string>('JWT_AUDIENCE'),
          ttl: config.getOrThrow<Duration>('JWT_ACCESS_TTL'),
        },
        refreshToken: {
          ttl: config.getOrThrow<Duration>('JWT_REFRESH_TTL'),
          absoluteTtl: config.getOrThrow<Duration>('JWT_REFRESH_ABSOLUTE_TTL'),
        },
      }),
    }),
    AuthorizationModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      // GraphiQL in development. `playground: false` disables the landing page,
      // and a browser GET of /graphql is then rejected as a CSRF attempt.
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      fieldResolverEnhancers: ['guards', 'interceptors'],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppModule {}
