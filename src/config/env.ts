import type { Duration } from '@nestjs/authentication';

export interface Env {
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  JWT_ACCESS_TTL: Duration;
  JWT_REFRESH_TTL: Duration;
  JWT_REFRESH_ABSOLUTE_TTL: Duration;
  ADMIN_EMAILS: string;
}

const DURATION = /^\d+(ms|s|m|h|d|w)$/;

/**
 * Fails startup when the token settings are missing or too weak.
 * `@nestjs/config` replaces `process.env` with this object for `ConfigService`.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const jwtSecret = required(config, 'JWT_SECRET');
  if (Buffer.byteLength(jwtSecret) < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes');
  }

  return {
    JWT_SECRET: jwtSecret,
    JWT_ISSUER: optional(config, 'JWT_ISSUER') ?? 'nestjs-learning-store',
    JWT_AUDIENCE: optional(config, 'JWT_AUDIENCE') ?? 'nestjs-learning-store',
    JWT_ACCESS_TTL: duration(config, 'JWT_ACCESS_TTL', '15m'),
    JWT_REFRESH_TTL: duration(config, 'JWT_REFRESH_TTL', '30d'),
    JWT_REFRESH_ABSOLUTE_TTL: duration(
      config,
      'JWT_REFRESH_ABSOLUTE_TTL',
      '90d',
    ),
    ADMIN_EMAILS: optional(config, 'ADMIN_EMAILS') ?? '',
  };
}

function required(config: Record<string, unknown>, key: string): string {
  const value = optional(config, key);
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function optional(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${key} must be a string`);
  }
  return value;
}

function duration(
  config: Record<string, unknown>,
  key: string,
  fallback: string,
): Duration {
  const value = optional(config, key) ?? fallback;
  if (typeof value !== 'string' || !DURATION.test(value)) {
    throw new Error(`${key} must be a duration such as 15m or 30d`);
  }
  return value as Duration;
}
