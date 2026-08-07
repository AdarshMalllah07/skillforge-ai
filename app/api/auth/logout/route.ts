import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { clearAuthCookie } from '@/server/middleware/auth';

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    const res = NextResponse.json({ message: 'Logged out' });
    clearAuthCookie(res);
    return res;
  });
}
