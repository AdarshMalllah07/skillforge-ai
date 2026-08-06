import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireAuth } from '@/server/middleware/auth';
import { Candidate } from '@/server/models/Candidate';

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
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const body = await req.json();
      let candidate = await Candidate.findOne();
      if (!candidate) {
        candidate = new Candidate(body);
      } else {
        Object.assign(candidate, body);
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
