import { UserRole } from '@/src/types';

/** Course authoring: create / edit / delete / AI generate */
export function canManageCourses(role?: UserRole): boolean {
  return role === 'INSTRUCTOR' || role === 'ADMIN';
}

/** Edit/delete a specific course (instructors: own only; admin: any) */
export function canEditCourse(
  role: UserRole | undefined,
  userId: string | undefined,
  instructorId: string
): boolean {
  if (role === 'ADMIN') return true;
  if (role === 'INSTRUCTOR' && userId && instructorId === userId) return true;
  return false;
}

/** Open AI Architect / generate-course */
export function canUseGenerator(role?: UserRole): boolean {
  return role === 'INSTRUCTOR' || role === 'ADMIN';
}

/** Grade submissions (scope enforced by API) */
export function canGradeSubmissions(role?: UserRole): boolean {
  return role === 'INSTRUCTOR' || role === 'EVALUATOR' || role === 'ADMIN';
}

/** Staff who see drafts / non-published courses */
export function canViewDraftCourses(role?: UserRole): boolean {
  return (
    role === 'INSTRUCTOR' ||
    role === 'EVALUATOR' ||
    role === 'ADMIN'
  );
}

/** Role-scoped home for submissions list */
export function submissionsPathForRole(role?: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/submissions';
    case 'INSTRUCTOR':
      return '/instructor/submissions';
    case 'EVALUATOR':
      return '/evaluator/submissions';
    case 'STUDENT':
      return '/student/submissions';
    default:
      return '/submissions';
  }
}

/** Role-scoped home for analytics */
export function analyticsPathForRole(role?: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/analytics';
    case 'INSTRUCTOR':
      return '/instructor/analytics';
    case 'EVALUATOR':
      return '/evaluator/analytics';
    case 'STUDENT':
      return '/student/analytics';
    default:
      return '/analytics';
  }
}
