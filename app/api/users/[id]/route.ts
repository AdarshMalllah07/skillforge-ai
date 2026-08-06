import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { User } from '@/server/models/User';
import { toClient } from '@/server/utils';
import { deleteLocalProfileAvatar, isLocalProfileAvatar } from '@/server/uploads';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'ADMIN');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const body = await req.json();
      const allowed = [
        'name',
        'email',
        'role',
        'title',
        'bio',
        'skills',
        'avatar',
        'githubUrl',
        'linkedInUrl',
      ] as const;
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updates[key] = body[key];
      }

      if (body.password) {
        updates.password = await bcrypt.hash(body.password, 10);
      }

      const existing = await User.findById(id);
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

      const user = await User.findByIdAndUpdate(id, updates, { new: true });
      return NextResponse.json(toClient(user));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to update user', message }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'ADMIN');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      if (id === auth.user.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      deleteLocalProfileAvatar(user.avatar);
      return NextResponse.json({ message: 'User deleted', user: toClient(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to delete user', message }, { status: 500 });
    }
  });
}
