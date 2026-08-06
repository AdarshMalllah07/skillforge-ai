import crypto from 'crypto';
import { PasswordToken, PasswordTokenType } from '../models/PasswordToken';
import { newId } from '../utils';

export const PASSWORD_LINK_EXPIRY_MINUTES = 30;

export function getAppBaseUrl(): string {
  const fromEnv = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv && !fromEnv.includes('MY_APP_URL')) {
    return fromEnv.replace(/\/$/, '');
  }
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function createPasswordToken(
  userId: string,
  type: PasswordTokenType
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_LINK_EXPIRY_MINUTES * 60 * 1000);

  await PasswordToken.updateMany(
    { userId, type, usedAt: null },
    { $set: { usedAt: new Date() } }
  );

  await PasswordToken.create({
    _id: newId('pwtoken'),
    userId,
    tokenHash,
    type,
    expiresAt,
  });

  return { rawToken, expiresAt };
}

export function buildPasswordLink(rawToken: string, type: PasswordTokenType): string {
  const path = type === 'SETUP' ? '/setup-password' : '/reset-password';
  return `${getAppBaseUrl()}${path}?token=${encodeURIComponent(rawToken)}`;
}

export async function consumePasswordToken(
  rawToken: string,
  expectedType?: PasswordTokenType
): Promise<{ userId: string; type: PasswordTokenType } | null> {
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const candidate = await PasswordToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
    ...(expectedType ? { type: expectedType } : {}),
  });

  if (!candidate) return null;

  candidate.usedAt = new Date();
  await candidate.save();
  return { userId: candidate.userId, type: candidate.type as PasswordTokenType };
}
