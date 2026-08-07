import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withApi } from '@/lib/server/api';
import { User } from '@/server/models/User';
import { setAuthCookie, signToken } from '@/server/middleware/auth';
import { toClient } from '@/server/utils';
import {
  AUTH_LOGIN_LIMIT,
  clientIp,
  enforceRateLimit,
} from '@/server/rateLimit';

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const limited = await enforceRateLimit(req, {
        key: `auth:login:${clientIp(req)}`,
        ...AUTH_LOGIN_LIMIT,
      });
      if (limited) return limited;

      const { email, password } = await req.json();
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const loginId = String(email).toLowerCase().trim();
      let user = await User.findOne({ email: loginId });

      // Allow signing in with the classic "admin" username even after email is a real address
      if (!user && loginId === 'admin') {
        user =
          (await User.findById('user_admin_1')) ||
          (await User.findOne({ role: 'ADMIN' }).sort({ createdAt: 1 }));
      }

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const client = toClient(user)!;
      const token = signToken({ id: client.id, email: client.email, role: client.role });
      const res = NextResponse.json({ user: client });
      setAuthCookie(res, token);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Login failed', message }, { status: 500 });
    }
  });
}
