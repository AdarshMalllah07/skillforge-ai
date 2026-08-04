import { UserRole } from '@/src/types';

export type AppTab =
  | 'courses'
  | 'submissions'
  | 'generator'
  | 'analytics'
  | 'admin_users'
  | 'student_dashboard'
  | 'instructor_dashboard'
  | 'evaluator_dashboard'
  | 'login'
  | 'signup'
  | 'forgot_password';

export const AUTH_PATHS = ['/login', '/signup', '/forgot-password'] as const;

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin/users',
  INSTRUCTOR: '/instructor',
  STUDENT: '/student',
  EVALUATOR: '/evaluator',
};

export const TAB_PATH: Record<AppTab, string> = {
  login: '/login',
  signup: '/signup',
  forgot_password: '/forgot-password',
  student_dashboard: '/student',
  instructor_dashboard: '/instructor',
  evaluator_dashboard: '/evaluator',
  admin_users: '/admin/users',
  courses: '/courses',
  submissions: '/submissions',
  analytics: '/analytics',
  generator: '/generator',
};

export function pathToTab(pathname: string): AppTab | null {
  if (pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/submissions')) return 'submissions';
  if (pathname.startsWith('/analytics')) return 'analytics';
  if (pathname.startsWith('/generator')) return 'generator';
  if (pathname.startsWith('/admin/users')) return 'admin_users';
  if (pathname.startsWith('/student')) return 'student_dashboard';
  if (pathname.startsWith('/instructor')) return 'instructor_dashboard';
  if (pathname.startsWith('/evaluator')) return 'evaluator_dashboard';
  if (pathname.startsWith('/login')) return 'login';
  if (pathname.startsWith('/signup')) return 'signup';
  if (pathname.startsWith('/forgot-password')) return 'forgot_password';
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

  switch (tab) {
    case 'admin_users':
      return role === 'ADMIN';
    case 'student_dashboard':
      return role === 'STUDENT';
    case 'instructor_dashboard':
      return role === 'INSTRUCTOR';
    case 'evaluator_dashboard':
      return role === 'EVALUATOR';
    case 'generator':
      return role === 'ADMIN' || role === 'INSTRUCTOR' || role === 'EVALUATOR';
    case 'courses':
    case 'submissions':
    case 'analytics':
      return true;
    default:
      return false;
  }
}
