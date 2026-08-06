import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { User } from '@/server/models/User';
import { toClient } from '@/server/utils';
import {
  buildPasswordLink,
  createPasswordToken,
  findActivePasswordToken,
  PASSWORD_LINK_EXPIRY_MINUTES,
} from '@/server/email/tokens';
import { sendSetupPasswordInviteEmail } from '@/server/email/templates';

type Ctx = { params: Promise<{ id: string }> };

/**
 * Resend account setup / password invite email for users who were provisioned
 * without a password (invitePending).
 *
 * Body: { force?: boolean }
 * - If an active setup link exists and force is not true → 409 with requiresConfirm
 * - If force is true → expire old token, create new, send email
 */
export async function POST(req: NextRequest, context: Ctx) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'ADMIN');
      if ('error' in auth) return auth.error;

      const { id } = await context.params;
      const body = await req.json().catch(() => ({}));
      const force = Boolean(body?.force);

      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (!user.invitePending) {
        const lingering = await findActivePasswordToken(user._id, 'SETUP');
        if (!lingering) {
          return NextResponse.json(
            {
              error:
                'This user already has a password set. Use password reset instead of account setup.',
            },
            { status: 400 }
          );
        }
      }

      const active = await findActivePasswordToken(user._id, 'SETUP');
      if (active && !force) {
        return NextResponse.json(
          {
            error: 'An active setup link already exists for this user.',
            requiresConfirm: true,
            message: `A previous account setup link is still active until ${active.expiresAt.toISOString()}. Click Send Anyway to expire it and email a new link.`,
            expiresAt: active.expiresAt.toISOString(),
            expiryMinutes: PASSWORD_LINK_EXPIRY_MINUTES,
          },
          { status: 409 }
        );
      }

      // createPasswordToken already expires prior unused tokens of the same type
      const { rawToken, expiresAt } = await createPasswordToken(user._id, 'SETUP');
      const setupUrl = buildPasswordLink(rawToken, 'SETUP');

      if (!user.invitePending) {
        user.invitePending = true;
        await user.save();
      }

      await sendSetupPasswordInviteEmail({
        to: user.email,
        name: user.name,
        role: user.role,
        setupUrl,
      });

      return NextResponse.json({
        message: 'Account setup email sent.',
        expiresAt: expiresAt.toISOString(),
        forced: force && Boolean(active),
        user: toClient(user),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to resend setup email', message },
        { status: 500 }
      );
    }
  });
}
