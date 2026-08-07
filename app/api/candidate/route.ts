import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { Candidate } from '@/server/models/Candidate';
import { candidateUpdateSchema, parseBody } from '@/server/validation';

export async function GET(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const candidate = await Candidate.findOne();
      if (!candidate) {
        return NextResponse.json(null);
      }
      const obj = candidate.toObject();
      delete (obj as { __v?: number }).__v;
      delete (obj as { _id?: unknown })._id;
      return NextResponse.json(obj);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to load candidate', message }, { status: 500 });
    }
  });
}

export async function PUT(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'ADMIN');
      if ('error' in auth) return auth.error;

      const parsed = parseBody(candidateUpdateSchema, await req.json());
      if ('error' in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      let candidate = await Candidate.findOne();
      if (!candidate) {
        candidate = new Candidate(parsed.data);
      } else {
        Object.assign(candidate, parsed.data);
      }
      await candidate.save();
      const obj = candidate.toObject();
      delete (obj as { __v?: number }).__v;
      delete (obj as { _id?: unknown })._id;
      return NextResponse.json(obj);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to update candidate', message }, { status: 500 });
    }
  });
}
