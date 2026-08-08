import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Course } from '@/server/models/Course';
import { Enrollment } from '@/server/models/Enrollment';
import { toClientList } from '@/server/utils';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'INSTRUCTOR', 'ADMIN', 'EVALUATOR');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const course = await Course.findById(id).select('_id instructorId');
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      if (
        auth.user.role === 'INSTRUCTOR' &&
        course.instructorId !== auth.user.id
      ) {
        return NextResponse.json(
          { error: 'You can only view enrollments for your courses' },
          { status: 403 }
        );
      }

      const enrollments = await Enrollment.find({ courseId: id }).sort({ enrolledAt: -1 });
      return NextResponse.json(toClientList(enrollments));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to list enrollments', message }, { status: 500 });
    }
  });
}
