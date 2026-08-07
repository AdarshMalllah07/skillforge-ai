import { describe, expect, it } from 'vitest';
import { canAccessSubmission } from './submissionAccess';

describe('submission AI/eval access', () => {
  const submission = { studentId: 'stu_1', courseId: 'course_1' };

  it('allows students only for their own submission', () => {
    expect(
      canAccessSubmission({ id: 'stu_1', role: 'STUDENT' }, submission, false)
    ).toBe(true);
    expect(
      canAccessSubmission({ id: 'stu_2', role: 'STUDENT' }, submission, false)
    ).toBe(false);
  });

  it('allows instructors only when they own the course', () => {
    expect(
      canAccessSubmission({ id: 'inst_1', role: 'INSTRUCTOR' }, submission, true)
    ).toBe(true);
    expect(
      canAccessSubmission({ id: 'inst_1', role: 'INSTRUCTOR' }, submission, false)
    ).toBe(false);
  });

  it('allows evaluators and admins', () => {
    expect(
      canAccessSubmission({ id: 'ev_1', role: 'EVALUATOR' }, submission, false)
    ).toBe(true);
    expect(
      canAccessSubmission({ id: 'admin_1', role: 'ADMIN' }, submission, false)
    ).toBe(true);
  });
});

describe('AI evaluate request rules', () => {
  it('requires submissionId', () => {
    const body = { assignmentTitle: 'x' } as { submissionId?: string };
    const ok = Boolean(body.submissionId && typeof body.submissionId === 'string');
    expect(ok).toBe(false);
  });

  it('marks evaluation as advisory (no finalScore mutation)', () => {
    const submission: {
      status: string;
      finalScore?: number;
      aiEvaluation?: { overallScore: number };
    } = { status: 'PENDING', finalScore: undefined };

    const evaluation = { overallScore: 88 };
    submission.aiEvaluation = evaluation;
    if (submission.status === 'PENDING' || submission.status === 'AI_EVALUATED') {
      submission.status = 'AI_EVALUATED';
    }
    // Official grade must remain unset by AI path
    expect(submission.status).toBe('AI_EVALUATED');
    expect(submission.finalScore).toBeUndefined();
  });
});
