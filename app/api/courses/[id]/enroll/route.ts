import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Course } from '@/server/models/Course';
import { Enrollment } from '@/server/models/Enrollment';
import { toClient, newId } from '@/server/utils';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: Ctx) {
  return withDb(async () => {
    try {
      const auth = await requireRoles(req, 'STUDENT');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const course = await Course.findById(id);
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      if (course.status !== 'PUBLISHED') {
        return NextResponse.json(
          { error: 'Course is not open for enrollment' },
          { status: 400 }
        );
      }

      const existing = await Enrollment.findOne({
        courseId: course._id,
        studentId: auth.user.id,
      });
      if (existing) {
        return NextResponse.json({
          message: 'Already enrolled',
          enrollment: toClient(existing),
        });
      }

      const enrollment = await Enrollment.create({
        _id: newId('enroll'),
        courseId: course._id,
        studentId: auth.user.id,
      });

      course.enrolledStudentsCount = (course.enrolledStudentsCount || 0) + 1;
      await course.save();

      return NextResponse.json(
        { message: 'Enrolled successfully', enrollment: toClient(enrollment) },
        { status: 201 }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Enrollment failed', message }, { status: 500 });
    }
  });
}
