import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';

export async function GET(req: NextRequest) {
  return withApi(req, async () => {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'mongodb',
    });
  });
}
