import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { User } from '@/server/models/User';
import {
  buildPasswordLink,
  createPasswordToken,
  PASSWORD_LINK_EXPIRY_MINUTES,
} from '@/server/email/tokens';
import { sendPasswordResetEmail } from '@/server/email/templates';
import { logger } from '@/server/logger';

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const { email } = await req.json();
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const normalized = String(email).toLowerCase().trim();
      const genericMessage = `If an account exists for that email, a password reset link has been sent. The link expires in ${PASSWORD_LINK_EXPIRY_MINUTES} minutes.`;

      const user = await User.findOne({ email: normalized });
      logger.email('Password reset requested', {
        email: normalized,
        userFound: Boolean(user),
        userId: user?._id,
      });

      if (user) {
        const { rawToken, expiresAt } = await createPasswordToken(user._id, 'RESET');
        const resetUrl = buildPasswordLink(rawToken, 'RESET');
        logger.email('Password reset token created', {
          userId: user._id,
          expiresAt: expiresAt.toISOString(),
          resetUrl,
        });
        try {
          const result = await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
          });
          logger.email('Password reset email dispatched', {
            to: user.email,
            result,
          });
        } catch (err) {
          logger.emailError('Failed to send password reset email', {
            to: user.email,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          });
          return NextResponse.json(
            {
              error: 'Failed to send password reset email. Please try again later.',
              detail: err instanceof Error ? err.message : String(err),
            },
            { status: 502 }
          );
        }
      }

      return NextResponse.json({ message: genericMessage });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.apiError('Password reset request failed', { error: message });
      return NextResponse.json({ error: 'Password reset request failed', message }, { status: 500 });
    }
  });
}
