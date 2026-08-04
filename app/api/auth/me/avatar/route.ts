import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/server/api';
import { requireAuth } from '@/server/middleware/auth';
import { User } from '@/server/models/User';
import { toClient } from '@/server/utils';
import {
  DEFAULT_AVATAR,
  deleteLocalProfileAvatar,
  saveProfileAvatar,
} from '@/server/uploads';

export async function POST(req: NextRequest) {
  return withDb(async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const formData = await req.formData();
      const file = formData.get('avatar');
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
      }

      const user = await User.findById(auth.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      let saved;
      try {
        saved = await saveProfileAvatar(file, auth.user.id);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        return NextResponse.json({ error: message }, { status: 400 });
      }

      deleteLocalProfileAvatar(user.avatar);
      user.avatar = saved.url;
      await user.save();

      return NextResponse.json({ user: toClient(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Avatar upload failed', message }, { status: 500 });
    }
  });
}

export async function DELETE(req: NextRequest) {
  return withDb(async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const user = await User.findById(auth.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      deleteLocalProfileAvatar(user.avatar);
      user.avatar = DEFAULT_AVATAR;
      await user.save();

      return NextResponse.json({ user: toClient(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to remove avatar', message }, { status: 500 });
    }
  });
}
