import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '../models/User';
import { AuthUser, UserRole } from '../types';
import { toClient } from '../utils';

export const AUTH_COOKIE = 'sf_session';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/** Convert values like `7d`, `12h`, `30m`, or raw seconds into cookie maxAge. */
export function cookieMaxAgeSeconds(expiresIn = JWT_EXPIRES_IN): number {
  const match = /^(\d+)([smhd])?$/i.exec(String(expiresIn).trim());
  if (!match) return 60 * 60 * 24 * 7;
  const amount = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * (multipliers[unit] || 1);
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: cookieMaxAgeSeconds(),
  };
}

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(AUTH_COOKIE, token, authCookieOptions());
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(AUTH_COOKIE, '', {
    ...authCookieOptions(),
    maxAge: 0,
  });
}

export function signToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    requireJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): { sub: string; email: string; role: UserRole } {
  return jwt.verify(token, requireJwtSecret()) as { sub: string; email: string; role: UserRole };
}

function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export function extractToken(req: NextRequest): string | null {
  const fromCookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  return extractBearer(req);
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    return user ? (toClient(user) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: NextRequest
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const token = extractToken(req);
  if (!token) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return { error: NextResponse.json({ error: 'Invalid session' }, { status: 401 }) };
    }
    return { user: toClient(user) as AuthUser };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}

export async function requireRoles(
  req: NextRequest,
  ...roles: UserRole[]
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const result = await requireAuth(req);
  if ('error' in result) return result;

  if (!roles.includes(result.user.role)) {
    return {
      error: NextResponse.json(
        { error: `Access denied. Required roles: ${roles.join(', ')}` },
        { status: 403 }
      ),
    };
  }

  return result;
}
