import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withApi } from '@/lib/server/api';
import { User } from '@/server/models/User';
import { consumePasswordToken } from '@/server/email/tokens';
import { sendPasswordChangedEmail } from '@/server/email/templates';

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const { token, password } = await req.json();
      if (!token || !password) {
        return NextResponse.json(
          { error: 'Token and new password are required' },
          { status: 400 }
        );
      }
      if (String(password).length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const consumed = await consumePasswordToken(String(token));
      if (!consumed) {
        return NextResponse.json(
          { error: 'This link is invalid or has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      const user = await User.findById(consumed.userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      user.password = await bcrypt.hash(String(password), 10);
      await user.save();

      try {
        await sendPasswordChangedEmail({ to: user.email, name: user.name });
      } catch (err) {
        console.error('[email] Failed to send password-changed confirmation', err);
      }

      return NextResponse.json({
        message: 'Password set successfully. You can now sign in.',
        type: consumed.type,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to set password', message }, { status: 500 });
    }
  });
}
