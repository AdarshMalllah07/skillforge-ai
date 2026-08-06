import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Enrollment } from '@/server/models/Enrollment';
import { toClientList } from '@/server/utils';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'INSTRUCTOR', 'ADMIN', 'EVALUATOR');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const enrollments = await Enrollment.find({ courseId: id }).sort({ enrolledAt: -1 });
      return NextResponse.json(toClientList(enrollments));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to list enrollments', message }, { status: 500 });
    }
  });
}
