import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withDb } from '@/lib/server/api';
import { User } from '@/server/models/User';
import { signToken } from '@/server/middleware/auth';
import { toClient } from '@/server/utils';

export async function POST(req: NextRequest) {
  return withDb(async () => {
    try {
      const { email, password } = await req.json();
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email: String(email).toLowerCase() });
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const client = toClient(user)!;
      const token = signToken({ id: client.id, email: client.email, role: client.role });
      return NextResponse.json({ token, user: client });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Login failed', message }, { status: 500 });
    }
  });
}
