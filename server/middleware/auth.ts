import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = header.slice(7);
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const client = toClient(user) as AuthUser;
    req.user = client;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice(7);
  verifyTokenAsync(token)
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch(() => next());
}

async function verifyTokenAsync(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    return user ? (toClient(user) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required roles: ${roles.join(', ')}` });
    }
    next();
  };
}
