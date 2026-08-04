import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/server/api';
import { requireAuth } from '@/server/middleware/auth';
import { User } from '@/server/models/User';
import { toClient } from '@/server/utils';
import { deleteLocalProfileAvatar, isLocalProfileAvatar } from '@/server/uploads';

export async function GET(req: NextRequest) {
  return withDb(async () => {
    const auth = await requireAuth(req);
    if ('error' in auth) return auth.error;
    return NextResponse.json({ user: auth.user });
  });
}

export async function PUT(req: NextRequest) {
  return withDb(async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const body = await req.json();
      const allowed = ['name', 'title', 'bio', 'skills', 'avatar', 'githubUrl', 'linkedInUrl'] as const;
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updates[key] = body[key];
      }

      const existing = await User.findById(auth.user.id);
      if (!existing) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (
        typeof updates.avatar === 'string' &&
        updates.avatar !== existing.avatar &&
        isLocalProfileAvatar(existing.avatar)
      ) {
        deleteLocalProfileAvatar(existing.avatar);
      }

      const user = await User.findByIdAndUpdate(auth.user.id, updates, { new: true });
      return NextResponse.json({ user: toClient(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Profile update failed', message }, { status: 500 });
    }
  });
}
