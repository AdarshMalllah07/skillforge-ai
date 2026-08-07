import { describe, expect, it } from 'vitest';
import { sanitizeForLog } from './logger';

describe('log sanitization (security)', () => {
  it('redacts sensitive fields from nested payloads', () => {
    const sanitized = sanitizeForLog({
      email: 'user@example.com',
      password: 'PlainText123!',
      token: 'jwt.here',
      nested: { authorization: 'Bearer abc', ok: true },
    }) as Record<string, unknown>;

    expect(sanitized.email).toBe('user@example.com');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect((sanitized.nested as Record<string, unknown>).authorization).toBe('[REDACTED]');
    expect((sanitized.nested as Record<string, unknown>).ok).toBe(true);
  });
});
