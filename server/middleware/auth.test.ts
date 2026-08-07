import { describe, expect, it } from 'vitest';
import { signToken, verifyToken } from './auth';

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
});
