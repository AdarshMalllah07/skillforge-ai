import mongoose, { Schema } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

const rateLimitSchema = new Schema(
  {
    _id: { type: String, required: true },
    hits: { type: [Number], default: [] },
  },
  { versionKey: false }
);

export const RateLimitModel =
  mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);

export type RateLimitOptions = {
  /** Stable bucket id, e.g. `auth:login:ip` or `ai:evaluate:userId` */
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  limit: number;
};

/** Pure sliding-window check used by tests and the DB-backed enforcer. */
export function evaluateWindow(
  hits: number[],
  now: number,
  limit: number,
  windowMs: number
): RateLimitResult & { nextHits: number[] } {
  const windowStart = now - windowMs;
  const recent = hits.filter((t) => t > windowStart);
  if (recent.length >= limit) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
      limit,
      nextHits: recent,
    };
  }
  const nextHits = [...recent, now];
  return {
    allowed: true,
    remaining: Math.max(0, limit - nextHits.length),
    retryAfterSec: 0,
    limit,
    nextHits,
  };
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

export async function checkRateLimit(
  options: RateLimitOptions,
  now = Date.now()
): Promise<RateLimitResult> {
  const doc = await RateLimitModel.findById(options.key);
  const hits: number[] = Array.isArray(doc?.hits) ? doc.hits.map(Number) : [];
  const result = evaluateWindow(hits, now, options.limit, options.windowMs);

  await RateLimitModel.findByIdAndUpdate(
    options.key,
    { $set: { hits: result.nextHits } },
    { upsert: true, new: true }
  );

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    retryAfterSec: result.retryAfterSec,
    limit: result.limit,
  };
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      retryAfterSec: result.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSec),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
      },
    }
  );
}

/**
 * Returns a 429 response when the bucket is exhausted; otherwise null.
 */
export async function enforceRateLimit(
  req: NextRequest,
  options: Omit<RateLimitOptions, 'key'> & { key: string }
): Promise<NextResponse | null> {
  const result = await checkRateLimit(options);
  if (!result.allowed) return rateLimitResponse(result);
  return null;
}

export const AUTH_LOGIN_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };
export const AUTH_REGISTER_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
export const AUTH_FORGOT_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
export const AI_USER_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };
