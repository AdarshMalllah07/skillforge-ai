import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireAuth, requireRoles } from '@/server/middleware/auth';
import { Submission } from '@/server/models/Submission';
import { Course } from '@/server/models/Course';
import { toClient, toClientList, newId } from '@/server/utils';

export async function GET(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const filter: Record<string, unknown> = {};
      const role = auth.user.role;
      const { searchParams } = new URL(req.url);

      if (role === 'STUDENT') {
        filter.studentId = auth.user.id;
      } else if (role === 'INSTRUCTOR') {
        const myCourses = await Course.find({ instructorId: auth.user.id }).select('_id');
        const ids = myCourses.map((c) => c._id);
        filter.courseId = { $in: ids };
      }

      const status = searchParams.get('status');
      const courseId = searchParams.get('courseId');
      if (status) filter.status = status;
      if (courseId) filter.courseId = courseId;

      const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
      return NextResponse.json(
        toClientList(submissions).map((s) => ({
          ...s,
          submittedAt: s.submittedAt?.toISOString?.() || s.submittedAt,
        }))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to fetch submissions', message },
        { status: 500 }
      );
    }
  });
}

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'STUDENT');
      if ('error' in auth) return auth.error;

      const {
        assignmentId,
        assignmentTitle,
        courseId,
        courseTitle,
        codeContent,
        essayContent,
        repositoryUrl,
        maxScore,
      } = await req.json();

      if (!assignmentId || (!codeContent && !essayContent && !repositoryUrl)) {
        return NextResponse.json(
          { error: 'Assignment ID and submission content are required' },
          { status: 400 }
        );
      }

      const course = courseId ? await Course.findById(courseId) : null;
      const assignment = course?.assignments?.find(
        (a: { id: string }) => a.id === assignmentId
      );

      const submission = await Submission.create({
        _id: newId('sub'),
        assignmentId,
        assignmentTitle: assignmentTitle || assignment?.title || 'Course Assignment',
        courseId: courseId || course?._id || '',
        courseTitle: courseTitle || course?.title || 'Course Title',
        studentId: auth.user.id,
        studentName: auth.user.name,
        studentEmail: auth.user.email,
        submittedAt: new Date(),
        codeContent,
        essayContent,
        repositoryUrl,
        status: 'PENDING',
        maxScore: maxScore || assignment?.maxScore || 100,
      });

      const client = toClient(submission)!;
      return NextResponse.json(
        {
          ...client,
          submittedAt: client.submittedAt?.toISOString?.() || client.submittedAt,
        },
        { status: 201 }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to create submission', message },
        { status: 500 }
      );
    }
  });
}
