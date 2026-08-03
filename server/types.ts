export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'EVALUATOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title?: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedInUrl?: string;
  createdAt?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
