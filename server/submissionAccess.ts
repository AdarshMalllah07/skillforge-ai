import type { AuthUser } from './types';

export type SubmissionAccessFields = {
  studentId: string;
  courseId: string;
};

/**
 * Whether a user may AI-evaluate or read a submission for grading workflows.
 * Instructor access requires the course ownership check to be supplied by the caller
 * (pass `instructorOwnsCourse`).
 */
export function canAccessSubmission(
  user: Pick<AuthUser, 'id' | 'role'>,
  submission: SubmissionAccessFields,
  instructorOwnsCourse: boolean
): boolean {
  if (user.role === 'ADMIN' || user.role === 'EVALUATOR') return true;
  if (user.role === 'STUDENT') return submission.studentId === user.id;
  if (user.role === 'INSTRUCTOR') return instructorOwnsCourse;
  return false;
}
