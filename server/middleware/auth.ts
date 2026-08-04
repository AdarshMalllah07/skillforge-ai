import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '../models/User';
import { AuthUser, UserRole } from '../types';
import { toClient } from '../utils';

const JWT_SECRET = process.env.JWT_SECRET || 'edtech_matrix_dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): { sub: string; email: string; role: UserRole } {
  return jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: UserRole };
}

function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = extractBearer(req);
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
  const token = extractBearer(req);
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
