import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { getAuthUser, requireRoles } from '@/server/middleware/auth';
import { Course } from '@/server/models/Course';
import { Enrollment } from '@/server/models/Enrollment';
import { toClient, slugify } from '@/server/utils';
import { courseUpdateSchema, parseBody } from '@/server/validation';

type Ctx = { params: Promise<{ id: string }> };

function canViewUnpublishedCourse(
  user: { id: string; role: string } | null,
  course: { instructorId: string; status: string }
): boolean {
  if (course.status === 'PUBLISHED') return true;
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'INSTRUCTOR' && course.instructorId === user.id) return true;
  return false;
}

export async function GET(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const { id } = await context.params;
      const user = await getAuthUser(req);
      const course = await Course.findById(id);
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      if (!canViewUnpublishedCourse(user, course)) {
        return NextResponse.json({ error: 'Course not available' }, { status: 403 });
      }
      const client = toClient(course)!;
      return NextResponse.json({
        ...client,
        createdAt: client.createdAt?.toISOString?.() || client.createdAt,
        updatedAt: client.updatedAt?.toISOString?.() || client.updatedAt,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to fetch course', message }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'INSTRUCTOR', 'ADMIN');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const course = await Course.findById(id);
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      if (auth.user.role === 'INSTRUCTOR' && course.instructorId !== auth.user.id) {
        return NextResponse.json(
          { error: 'You can only edit your own courses' },
          { status: 403 }
        );
      }

      const parsed = parseBody(courseUpdateSchema, await req.json());
      if ('error' in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const body = parsed.data;
      const allowed = [
        'title',
        'description',
        'category',
        'level',
        'thumbnail',
        'status',
        'modules',
        'assignments',
        'rating',
      ] as const;

      for (const key of allowed) {
        if (body[key] !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (course as any)[key] = body[key];
        }
      }
      if (body.title) {
        course.slug = slugify(body.title);
      }

      await course.save();
      return NextResponse.json(toClient(course));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to update course', message }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'INSTRUCTOR', 'ADMIN');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const course = await Course.findById(id);
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      if (auth.user.role === 'INSTRUCTOR' && course.instructorId !== auth.user.id) {
        return NextResponse.json(
          { error: 'You can only delete your own courses' },
          { status: 403 }
        );
      }

      await course.deleteOne();
      await Enrollment.deleteMany({ courseId: id });
      return NextResponse.json({ message: 'Course deleted', course: toClient(course) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to delete course', message }, { status: 500 });
    }
  });
}
