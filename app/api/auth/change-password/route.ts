import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withDb } from '@/lib/server/api';
import { requireAuth } from '@/server/middleware/auth';
import { User } from '@/server/models/User';

export async function POST(req: NextRequest) {
  return withDb(async () => {
    try {
      const auth = await requireAuth(req);
      if ('error' in auth) return auth.error;

      const { oldPassword, newPassword } = await req.json();
      if (!oldPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      if (String(newPassword).length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      if (oldPassword === newPassword) {
        return NextResponse.json(
          { error: 'New password must be different from current password' },
          { status: 400 }
        );
      }

      const user = await User.findById(auth.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return NextResponse.json({ message: 'Password updated successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to update password', message }, { status: 500 });
    }
  });
}
