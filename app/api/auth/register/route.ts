import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withApi } from '@/lib/server/api';
import { User } from '@/server/models/User';
import { signToken } from '@/server/middleware/auth';
import { toClient, newId } from '@/server/utils';
import { DEFAULT_AVATAR } from '@/server/uploads';
import { sendWelcomeEmail } from '@/server/email/templates';

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const { name, email, password } = await req.json();
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Name, email, and password are required' },
          { status: 400 }
        );
      }
      if (String(password).length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const existing = await User.findOne({ email: String(email).toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        _id: newId('user_student'),
        name,
        email: String(email).toLowerCase(),
        password: hashed,
        role: 'STUDENT',
        avatar: DEFAULT_AVATAR,
        title: 'Student / Candidate',
        bio: 'Enrolled student exploring courses and submitting assignments on SkillForge AI.',
        skills: [],
      });

      try {
        await sendWelcomeEmail({
          to: user.email,
          name: user.name,
          role: 'STUDENT',
        });
      } catch (err) {
        console.error('[email] Failed to send signup welcome email', err);
      }

      const client = toClient(user)!;
      const token = signToken({ id: client.id, email: client.email, role: client.role });
      return NextResponse.json({ token, user: client }, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Registration failed', message }, { status: 500 });
    }
  });
}
