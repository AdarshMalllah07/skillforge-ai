import { UserRole } from '@/src/types';
import { analyticsPathForRole, submissionsPathForRole } from './permissions';

export type AppTab =
  | 'courses'
  | 'submissions'
  | 'generator'
  | 'analytics'
  | 'admin_overview'
  | 'admin_users'
  | 'admin_courses'
  | 'admin_submissions'
  | 'admin_analytics'
  | 'student_dashboard'
  | 'student_submissions'
  | 'student_analytics'
  | 'instructor_dashboard'
  | 'instructor_submissions'
  | 'instructor_analytics'
  | 'evaluator_dashboard'
  | 'evaluator_submissions'
  | 'evaluator_analytics'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'reset_password'
  | 'setup_password';

export const AUTH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/setup-password',
] as const;

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  INSTRUCTOR: '/instructor',
  STUDENT: '/student',
  EVALUATOR: '/evaluator',
};

export const TAB_PATH: Record<AppTab, string> = {
  login: '/login',
  signup: '/signup',
  forgot_password: '/forgot-password',
  reset_password: '/reset-password',
  setup_password: '/setup-password',
  student_dashboard: '/student',
  student_submissions: '/student/submissions',
  student_analytics: '/student/analytics',
  instructor_dashboard: '/instructor',
  instructor_submissions: '/instructor/submissions',
  instructor_analytics: '/instructor/analytics',
  evaluator_dashboard: '/evaluator',
  evaluator_submissions: '/evaluator/submissions',
  evaluator_analytics: '/evaluator/analytics',
  admin_overview: '/admin',
  admin_users: '/admin/users',
  admin_courses: '/admin/courses',
  admin_submissions: '/admin/submissions',
  admin_analytics: '/admin/analytics',
  courses: '/courses',
  submissions: '/submissions',
  analytics: '/analytics',
  generator: '/generator',
};

export function pathToTab(pathname: string): AppTab | null {
  if (pathname === '/admin' || pathname === '/admin/') return 'admin_overview';
  if (pathname.startsWith('/admin/users')) return 'admin_users';
  if (pathname.startsWith('/admin/courses')) return 'admin_courses';
  if (pathname.startsWith('/admin/submissions')) return 'admin_submissions';
  if (pathname.startsWith('/admin/analytics')) return 'admin_analytics';
  if (pathname.startsWith('/student/submissions')) return 'student_submissions';
  if (pathname.startsWith('/student/analytics')) return 'student_analytics';
  if (pathname.startsWith('/student')) return 'student_dashboard';
  if (pathname.startsWith('/instructor/submissions')) return 'instructor_submissions';
  if (pathname.startsWith('/instructor/analytics')) return 'instructor_analytics';
  if (pathname.startsWith('/instructor')) return 'instructor_dashboard';
  if (pathname.startsWith('/evaluator/submissions')) return 'evaluator_submissions';
  if (pathname.startsWith('/evaluator/analytics')) return 'evaluator_analytics';
  if (pathname.startsWith('/evaluator')) return 'evaluator_dashboard';
  if (pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/submissions')) return 'submissions';
  if (pathname.startsWith('/analytics')) return 'analytics';
  if (pathname.startsWith('/generator')) return 'generator';
  if (pathname.startsWith('/login')) return 'login';
  if (pathname.startsWith('/signup')) return 'signup';
  if (pathname.startsWith('/forgot-password')) return 'forgot_password';
  if (pathname.startsWith('/reset-password')) return 'reset_password';
  if (pathname.startsWith('/setup-password')) return 'setup_password';
  return null;
}

/** Legacy shared paths → role-scoped destinations */
export function legacyRedirectPath(
  pathname: string,
  role: UserRole
): string | null {
  if (pathname === '/submissions' || pathname.startsWith('/submissions/')) {
    return submissionsPathForRole(role);
  }
  if (pathname === '/analytics' || pathname.startsWith('/analytics/')) {
    return analyticsPathForRole(role);
  }
  return null;
}

export function canAccessPath(
  pathname: string,
  role: UserRole | undefined,
  authenticated: boolean
): boolean {
  const tab = pathToTab(pathname);
  if (!tab) return authenticated;
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (!authenticated || !role) return false;

  // Admin can open every authenticated app route
  if (role === 'ADMIN') {
    if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return true;
    return true;
  }

  switch (tab) {
    case 'admin_overview':
    case 'admin_users':
    case 'admin_courses':
    case 'admin_submissions':
    case 'admin_analytics':
      return false;
    case 'student_dashboard':
    case 'student_submissions':
    case 'student_analytics':
      return role === 'STUDENT';
    case 'instructor_dashboard':
    case 'instructor_submissions':
    case 'instructor_analytics':
      return role === 'INSTRUCTOR';
    case 'evaluator_dashboard':
    case 'evaluator_submissions':
    case 'evaluator_analytics':
      return role === 'EVALUATOR';
    case 'generator':
      return role === 'INSTRUCTOR';
    case 'courses':
      return true;
    case 'submissions':
    case 'analytics':
      // Legacy — AppShell redirects; allow briefly so redirect can run
      return true;
    default:
      return false;
  }
}
