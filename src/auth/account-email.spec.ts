import { describe, expect, it } from 'vitest';
import { accountEmail } from './account-email.js';

describe('accountEmail', () => {
  it('reads a REST body and normalizes the address', () => {
    expect(accountEmail({ body: { email: '  Ada@Example.com ' } })).toBe(
      'ada@example.com',
    );
  });

  it('reads a GraphQL variables input', () => {
    expect(
      accountEmail({
        body: { variables: { input: { email: 'Ada@Example.com' } } },
      }),
    ).toBe('ada@example.com');
  });

  it('is empty when the request does not name an account', () => {
    expect(accountEmail(undefined)).toBe('');
    expect(accountEmail({ body: {} })).toBe('');
  });
});
