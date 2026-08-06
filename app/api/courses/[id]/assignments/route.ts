import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Course } from '@/server/models/Course';
import { newId } from '@/server/utils';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: Ctx) {
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
          { error: 'You can only add assignments to your own courses' },
          { status: 403 }
        );
      }

      const body = await req.json();
      const assignment = {
        id: newId('assign'),
        courseId: course._id,
        title: body.title || 'New Challenge',
        description: body.description || '',
        type: body.type || 'CODE',
        programmingLanguage: body.programmingLanguage || 'typescript',
        starterCode: body.starterCode || '// Write code here...',
        maxScore: body.maxScore || 100,
        dueDate: body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        rubrics: body.rubrics || [
          {
            id: newId('rub'),
            title: 'Functionality & Architecture',
            description: 'Execution quality',
            maxPoints: 50,
          },
          {
            id: newId('rub'),
            title: 'Security & Sanitization',
            description: 'Input safety',
            maxPoints: 50,
          },
        ],
      };

      course.assignments.push(assignment);
      await course.save();
      return NextResponse.json(assignment, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to create assignment', message },
        { status: 500 }
      );
    }
  });
}
