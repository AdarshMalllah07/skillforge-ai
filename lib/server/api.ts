import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/server/ensure-db';

export async function withDb<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    await ensureDb();
    return await handler();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('MONGODB_URI') || message.toLowerCase().includes('mongo')) {
      console.error('Database connection failed:', err);
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    throw err;
  }
}
