import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Course } from '@/server/models/Course';
import { assignmentUpdateSchema, parseBody } from '@/server/validation';

type Ctx = { params: Promise<{ id: string; assignmentId: string }> };

async function loadOwnedCourse(req: NextRequest, courseId: string) {
  const auth = await requireRoles(req, 'INSTRUCTOR', 'ADMIN');
  if ('error' in auth) return auth;

  const course = await Course.findById(courseId);
  if (!course) {
    return { error: NextResponse.json({ error: 'Course not found' }, { status: 404 }) };
  }

  if (auth.user.role === 'INSTRUCTOR' && course.instructorId !== auth.user.id) {
    return {
      error: NextResponse.json(
        { error: 'You can only manage assignments on your own courses' },
        { status: 403 }
      ),
    };
  }

  return { auth, course };
}

export async function PUT(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const { id, assignmentId } = await context.params;
      const loaded = await loadOwnedCourse(req, id);
      if ('error' in loaded) return loaded.error;

      const parsed = parseBody(assignmentUpdateSchema, await req.json());
      if ('error' in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const assignment = loaded.course.assignments.find(
        (a: { id: string }) => a.id === assignmentId
      );
      if (!assignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }

      Object.assign(assignment, parsed.data);
      await loaded.course.save();
      return NextResponse.json(assignment);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to update assignment', message },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const { id, assignmentId } = await context.params;
      const loaded = await loadOwnedCourse(req, id);
      if ('error' in loaded) return loaded.error;

      const before = loaded.course.assignments.length;
      loaded.course.assignments = loaded.course.assignments.filter(
        (a: { id: string }) => a.id !== assignmentId
      );
      if (loaded.course.assignments.length === before) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }

      await loaded.course.save();
      return NextResponse.json({ message: 'Assignment deleted', assignmentId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to delete assignment', message },
        { status: 500 }
      );
    }
  });
}
