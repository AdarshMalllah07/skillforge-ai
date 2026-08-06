import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/server/api';
import { requireAuth, requireRoles } from '@/server/middleware/auth';
import { Submission } from '@/server/models/Submission';
import { Course } from '@/server/models/Course';
import { User } from '@/server/models/User';
import { toClient } from '@/server/utils';
import { getAppBaseUrl } from '@/server/email/tokens';
import { sendSubmissionGradedEmail } from '@/server/email/templates';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  return withDb(async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const submission = await Submission.findById(id);
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }

      if (auth.user.role === 'STUDENT' && submission.studentId !== auth.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const client = toClient(submission)!;
      return NextResponse.json({
        ...client,
        submittedAt: client.submittedAt?.toISOString?.() || client.submittedAt,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to fetch submission', message },
        { status: 500 }
      );
    }
  });
}

export async function PUT(req: NextRequest, context: Ctx) {
  return withDb(async () => {
    try {
      const auth = await requireRoles(req, 'INSTRUCTOR', 'EVALUATOR', 'ADMIN');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const submission = await Submission.findById(id);
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }

      if (auth.user.role === 'INSTRUCTOR') {
        const course = await Course.findById(submission.courseId);
        if (!course || course.instructorId !== auth.user.id) {
          return NextResponse.json(
            { error: 'You can only grade submissions for your courses' },
            { status: 403 }
          );
        }
      }

      const previousStatus = submission.status;
      const { finalScore, instructorFeedback, status, aiEvaluation } = await req.json();

      if (finalScore !== undefined) submission.finalScore = Number(finalScore);
      if (instructorFeedback !== undefined) submission.instructorFeedback = instructorFeedback;
      if (aiEvaluation !== undefined) submission.aiEvaluation = aiEvaluation;
      if (status !== undefined) {
        submission.status = status;
      } else if (finalScore !== undefined || instructorFeedback !== undefined) {
        submission.status = 'GRADED';
      }

      await submission.save();

      const becameGraded = previousStatus !== 'GRADED' && submission.status === 'GRADED';
      if (becameGraded) {
        try {
          const [student, course] = await Promise.all([
            User.findById(submission.studentId),
            Course.findById(submission.courseId),
          ]);
          if (student?.email) {
            await sendSubmissionGradedEmail({
              to: student.email,
              name: student.name,
              courseTitle: course?.title || 'your course',
              score: submission.finalScore,
              submissionsUrl: `${getAppBaseUrl()}/submissions`,
            });
          }
        } catch (err) {
          console.error('[email] Failed to send graded submission email', err);
        }
      }

      const client = toClient(submission)!;
      return NextResponse.json({
        ...client,
        submittedAt: client.submittedAt?.toISOString?.() || client.submittedAt,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to update submission', message },
        { status: 500 }
      );
    }
  });
}
