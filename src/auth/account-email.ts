import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql';
import { normalizeEmail } from '../users/normalize-email.js';

interface AccountRequest {
  body?: {
    email?: unknown;
    variables?: {
      email?: unknown;
      input?: { email?: unknown };
    };
  };
  ip?: string;
}

/** The address a sign-in body names, or `''` when the request is not about an account. */
export function accountEmail(req: AccountRequest | undefined): string {
  const email =
    req?.body?.email ??
    req?.body?.variables?.input?.email ??
    req?.body?.variables?.email;
  return typeof email === 'string' ? normalizeEmail(email) : '';
}

export function requestOf(context: ExecutionContext): AccountRequest {
  if (context.getType<GqlContextType>() === 'graphql') {
    const gql = GqlExecutionContext.create(context);
    return gql.getContext<{ req?: AccountRequest }>().req ?? {};
  }
  return context.switchToHttp().getRequest<AccountRequest>();
}
