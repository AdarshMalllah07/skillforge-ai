import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    return NextResponse.json({
      message:
        'If an account exists for that email, password reset instructions have been sent.',
    });
  } catch {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
}
