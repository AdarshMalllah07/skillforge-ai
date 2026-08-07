import { describe, expect, it } from 'vitest';
import { cookieMaxAgeSeconds, signToken, verifyToken } from './auth';

describe('JWT authentication', () => {
  it('signs and verifies a role-bearing token', () => {
    const token = signToken({
      id: 'user_student_1',
      email: 'student@example.com',
      role: 'STUDENT',
    });

    const payload = verifyToken(token);
    expect(payload.sub).toBe('user_student_1');
    expect(payload.email).toBe('student@example.com');
    expect(payload.role).toBe('STUDENT');
  });

  it('rejects tampered tokens', () => {
    const token = signToken({
      id: 'user_1',
      email: 'a@b.com',
      role: 'ADMIN',
    });
    expect(() => verifyToken(`${token}x`)).toThrow();
  });

  it('requires JWT_SECRET (no hardcoded fallback)', () => {
    const previous = process.env.JWT_SECRET;
    try {
      delete process.env.JWT_SECRET;
      expect(() =>
        signToken({ id: 'u', email: 'a@b.com', role: 'STUDENT' })
      ).toThrow(/JWT_SECRET/);
    } finally {
      process.env.JWT_SECRET = previous;
    }
  });

  it('parses cookie max-age from JWT_EXPIRES_IN', () => {
    expect(cookieMaxAgeSeconds('7d')).toBe(7 * 86400);
    expect(cookieMaxAgeSeconds('12h')).toBe(12 * 3600);
    expect(cookieMaxAgeSeconds('30m')).toBe(30 * 60);
  });
});
