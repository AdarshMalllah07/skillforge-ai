import { describe, expect, it } from 'vitest';
import {
  canAccessPath,
  isAuthPath,
  isGuestAllowedPath,
  legacyRedirectPath,
  ROLE_HOME,
} from './routes';

describe('route guards (authorization)', () => {
  it('allows guests on auth and public paths only', () => {
    expect(isGuestAllowedPath('/')).toBe(true);
    expect(isGuestAllowedPath('/login')).toBe(true);
    expect(isAuthPath('/signup')).toBe(true);
    expect(isGuestAllowedPath('/admin')).toBe(false);
    expect(isGuestAllowedPath('/student')).toBe(false);
  });

  it('maps each role to a home dashboard', () => {
    expect(ROLE_HOME.ADMIN).toBe('/admin');
    expect(ROLE_HOME.STUDENT).toBe('/student');
    expect(ROLE_HOME.INSTRUCTOR).toBe('/instructor');
    expect(ROLE_HOME.EVALUATOR).toBe('/evaluator');
  });

  it('blocks students from admin and instructor areas', () => {
    expect(canAccessPath('/admin', 'STUDENT', true)).toBe(false);
    expect(canAccessPath('/admin/users', 'STUDENT', true)).toBe(false);
    expect(canAccessPath('/instructor', 'STUDENT', true)).toBe(false);
    expect(canAccessPath('/generator', 'STUDENT', true)).toBe(false);
  });

  it('allows role-scoped dashboards and shared courses', () => {
    expect(canAccessPath('/student', 'STUDENT', true)).toBe(true);
    expect(canAccessPath('/student/submissions', 'STUDENT', true)).toBe(true);
    expect(canAccessPath('/courses', 'STUDENT', true)).toBe(true);
    expect(canAccessPath('/instructor', 'INSTRUCTOR', true)).toBe(true);
    expect(canAccessPath('/generator', 'INSTRUCTOR', true)).toBe(true);
    expect(canAccessPath('/evaluator/submissions', 'EVALUATOR', true)).toBe(true);
  });

  it('lets admin access every authenticated app route', () => {
    expect(canAccessPath('/admin', 'ADMIN', true)).toBe(true);
    expect(canAccessPath('/student', 'ADMIN', true)).toBe(true);
    expect(canAccessPath('/generator', 'ADMIN', true)).toBe(true);
  });

  it('redirects legacy shared paths to role-scoped destinations', () => {
    expect(legacyRedirectPath('/submissions', 'STUDENT')).toBe('/student/submissions');
    expect(legacyRedirectPath('/analytics', 'INSTRUCTOR')).toBe('/instructor/analytics');
    expect(legacyRedirectPath('/courses', 'STUDENT')).toBeNull();
  });
});
