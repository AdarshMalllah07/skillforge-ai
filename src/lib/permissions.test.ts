import { describe, expect, it } from 'vitest';
import {
  canEditCourse,
  canGradeSubmissions,
  canManageCourses,
  canUseGenerator,
} from './permissions';

describe('permission helpers (RBAC)', () => {
  it('restricts course management to instructors and admins', () => {
    expect(canManageCourses('INSTRUCTOR')).toBe(true);
    expect(canManageCourses('ADMIN')).toBe(true);
    expect(canManageCourses('STUDENT')).toBe(false);
    expect(canManageCourses('EVALUATOR')).toBe(false);
  });

  it('lets instructors edit only their own courses', () => {
    expect(canEditCourse('INSTRUCTOR', 'user_1', 'user_1')).toBe(true);
    expect(canEditCourse('INSTRUCTOR', 'user_1', 'user_2')).toBe(false);
    expect(canEditCourse('ADMIN', 'admin_1', 'user_2')).toBe(true);
  });

  it('scopes generator and grading correctly', () => {
    expect(canUseGenerator('INSTRUCTOR')).toBe(true);
    expect(canUseGenerator('STUDENT')).toBe(false);
    expect(canGradeSubmissions('EVALUATOR')).toBe(true);
    expect(canGradeSubmissions('INSTRUCTOR')).toBe(true);
    expect(canGradeSubmissions('STUDENT')).toBe(false);
  });
});
