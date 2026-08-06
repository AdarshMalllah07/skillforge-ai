import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/lib/server/api';
import { User } from '@/server/models/User';
import {
  buildPasswordLink,
  createPasswordToken,
  PASSWORD_LINK_EXPIRY_MINUTES,
} from '@/server/email/tokens';
import { sendPasswordResetEmail } from '@/server/email/templates';

export async function POST(req: NextRequest) {
  return withDb(async () => {
    try {
      const { email } = await req.json();
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const genericMessage = `If an account exists for that email, a password reset link has been sent. The link expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes.`;

      const user = await User.findOne({ email: String(email).toLowerCase().trim() });
      if (user) {
        const { rawToken } = await createPasswordToken(user._id, 'RESET');
        const resetUrl = buildPasswordLink(rawToken, 'RESET');
        try {
          await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
          });
        } catch (err) {
          console.error('[email] Failed to send password reset email', err);
          return NextResponse.json(
            { error: 'Failed to send password reset email. Please try again later.' },
            { status: 502 }
          );
        }
      }

      return NextResponse.json({ message: genericMessage });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Password reset request failed', message }, { status: 500 });
    }
  });
}
