import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Enrollment } from '@/server/models/Enrollment';
import { toClientList } from '@/server/utils';

export async function GET(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'STUDENT', 'ADMIN');
      if ('error' in auth) return auth.error;

      const enrollments = await Enrollment.find({ studentId: auth.user.id }).sort({
        enrolledAt: -1,
      });
      return NextResponse.json(toClientList(enrollments));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to list enrollments', message }, { status: 500 });
    }
  });
}
