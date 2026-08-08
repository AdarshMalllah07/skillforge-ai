import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireAuth, requireRoles } from '@/server/middleware/auth';
import { Submission } from '@/server/models/Submission';
import { Course } from '@/server/models/Course';
import { Enrollment } from '@/server/models/Enrollment';
import { toClient, toClientList, newId } from '@/server/utils';
import { saveSubmissionAttachment } from '@/server/uploads';
import { parseBody, submissionCreateSchema } from '@/server/validation';

export async function GET(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const filter: Record<string, unknown> = {};
      const role = auth.user.role;
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status');
      const courseId = searchParams.get('courseId');

      if (role === 'STUDENT') {
        filter.studentId = auth.user.id;
      } else if (role === 'INSTRUCTOR') {
        const myCourses = await Course.find({ instructorId: auth.user.id }).select('_id');
        const ownedIds = myCourses.map((c) => String(c._id));
        if (courseId) {
          if (!ownedIds.includes(courseId)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
          }
          filter.courseId = courseId;
        } else {
          filter.courseId = { $in: ownedIds };
        }
      } else if (courseId) {
        filter.courseId = courseId;
      }

      if (status) filter.status = status;

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

async function readSubmissionPayload(req: NextRequest): Promise<{
  fields: Record<string, unknown>;
  file: File | null;
}> {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const fileEntry = form.get('attachment');
    const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
    const fields: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      if (key === 'attachment') continue;
      if (typeof value === 'string') fields[key] = value;
    }
    if (fields.maxScore != null) fields.maxScore = Number(fields.maxScore);
    return { fields, file };
  }

  return { fields: await req.json(), file: null };
}

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'STUDENT');
      if ('error' in auth) return auth.error;

      const { fields, file } = await readSubmissionPayload(req);
      const parsed = parseBody(submissionCreateSchema, fields);
      if ('error' in parsed) {
        // Allow file-only submissions when schema refine fails for empty text fields
        if (!file) {
          return NextResponse.json({ error: parsed.error }, { status: 400 });
        }
      }

      const data =
        'data' in parsed
          ? parsed.data
          : ({
              assignmentId: String(fields.assignmentId || ''),
              assignmentTitle: fields.assignmentTitle as string | undefined,
              courseId: fields.courseId as string | undefined,
              courseTitle: fields.courseTitle as string | undefined,
              codeContent: fields.codeContent as string | undefined,
              essayContent: fields.essayContent as string | undefined,
              repositoryUrl: fields.repositoryUrl as string | undefined,
              maxScore: fields.maxScore as number | undefined,
            } as const);

      if (!data.assignmentId) {
        return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
      }

      if (
        !data.codeContent?.trim() &&
        !data.essayContent?.trim() &&
        !data.repositoryUrl &&
        !file
      ) {
        return NextResponse.json(
          { error: 'Assignment ID and submission content are required' },
          { status: 400 }
        );
      }

      const course = data.courseId ? await Course.findById(data.courseId) : null;
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const assignment = course.assignments?.find(
        (a: { id: string }) => a.id === data.assignmentId
      );
      if (!assignment) {
        return NextResponse.json({ error: 'Assignment not found in course' }, { status: 404 });
      }

      const enrollment = await Enrollment.findOne({
        courseId: course._id,
        studentId: auth.user.id,
      });
      if (!enrollment) {
        return NextResponse.json(
          { error: 'You must enroll in this course before submitting' },
          { status: 403 }
        );
      }

      let attachmentUrl: string | undefined;
      let attachmentName: string | undefined;
      if (file) {
        const saved = await saveSubmissionAttachment(file, auth.user.id);
        attachmentUrl = saved.url;
        attachmentName = saved.originalName;
      }

      const submission = await Submission.create({
        _id: newId('sub'),
        assignmentId: data.assignmentId,
        assignmentTitle: data.assignmentTitle || assignment.title || 'Course Assignment',
        courseId: String(course._id),
        courseTitle: data.courseTitle || course.title || 'Course Title',
        studentId: auth.user.id,
        studentName: auth.user.name,
        studentEmail: auth.user.email,
        submittedAt: new Date(),
        codeContent: data.codeContent,
        essayContent: data.essayContent,
        repositoryUrl: data.repositoryUrl,
        attachmentUrl,
        attachmentName,
        status: 'PENDING',
        maxScore: data.maxScore || assignment.maxScore || 100,
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
