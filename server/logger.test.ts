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

    expect(sanitized.email).toBe('[REDACTED]');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect((sanitized.nested as Record<string, unknown>).authorization).toBe('[REDACTED]');
    expect((sanitized.nested as Record<string, unknown>).ok).toBe(true);
  });

  it('redacts emails and tokenized URLs inside strings', () => {
    const sanitized = sanitizeForLog({
      note: 'reset for student@school.edu at https://app.example/reset-password?token=abc123&x=1',
      setupUrl: 'https://app.example/setup-password?token=secret',
    }) as Record<string, unknown>;

    expect(sanitized.setupUrl).toBe('[REDACTED]');
    expect(String(sanitized.note)).toContain('[REDACTED_EMAIL]');
    expect(String(sanitized.note)).toContain('token=[REDACTED]');
    expect(String(sanitized.note)).not.toContain('student@school.edu');
    expect(String(sanitized.note)).not.toContain('abc123');
  });
});
