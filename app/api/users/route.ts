import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withDb } from '@/lib/server/api';
import { requireRoles } from '@/server/middleware/auth';
import { User } from '@/server/models/User';
import { toClient, toClientList, newId } from '@/server/utils';
import { UserRole } from '@/server/types';
import { DEFAULT_AVATAR } from '@/server/uploads';

export async function GET(req: NextRequest) {
  return withDb(async () => {
    try {
      const auth = await requireRoles(req, 'ADMIN');
      if ('error' in auth) return auth.error;

      const users = await User.find().sort({ createdAt: -1 });
      return NextResponse.json(toClientList(users));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to list users', message }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withDb(async () => {
    try {
      const auth = await requireRoles(req, 'ADMIN');
      if ('error' in auth) return auth.error;

      const { name, email, role, title, bio, skills, avatar, password } = await req.json();
      if (!name || !email || !role || !password) {
        return NextResponse.json(
          { error: 'Name, email, role, and password are required' },
          { status: 400 }
        );
      }

      if (String(password).length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const validRoles: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'EVALUATOR', 'ADMIN'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      const existing = await User.findOne({ email: String(email).toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        _id: newId(`user_${String(role).toLowerCase()}`),
        name,
        email: String(email).toLowerCase(),
        password: hashed,
        role,
        title: title || `${role} Member`,
        bio: bio || '',
        skills: skills || [],
        avatar: avatar || DEFAULT_AVATAR,
      });

      return NextResponse.json(toClient(user), { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to create user', message }, { status: 500 });
    }
  });
}
