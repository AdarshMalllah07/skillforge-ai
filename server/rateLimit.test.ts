import { describe, expect, it } from 'vitest';
import { evaluateWindow, rateLimitResponse, AUTH_LOGIN_LIMIT } from './rateLimit';

describe('rate limit sliding window', () => {
  const windowMs = 60_000;
  const limit = 3;

  it('allows requests under the limit', () => {
    const t0 = 1_000_000;
    let hits: number[] = [];
    for (let i = 0; i < limit; i++) {
      const result = evaluateWindow(hits, t0 + i * 1000, limit, windowMs);
      expect(result.allowed).toBe(true);
      hits = result.nextHits;
    }
    expect(hits).toHaveLength(limit);
  });

  it('denies when the limit is exceeded inside the window', () => {
    const t0 = 1_000_000;
    const hits = [t0, t0 + 1000, t0 + 2000];
    const result = evaluateWindow(hits, t0 + 3000, limit, windowMs);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSec).toBeGreaterThan(0);
  });

  it('drops hits that fall outside the window', () => {
    const now = 1_000_000;
    const hits = [now - windowMs - 1, now - 10_000];
    const result = evaluateWindow(hits, now, limit, windowMs);
    expect(result.allowed).toBe(true);
    expect(result.nextHits).toEqual([now - 10_000, now]);
    expect(result.remaining).toBe(1);
  });

  it('simulates login rate limit returning 429 after threshold', async () => {
    const { limit: max, windowMs: win } = AUTH_LOGIN_LIMIT;
    const t0 = Date.now();
    let hits: number[] = [];
    for (let i = 0; i < max; i++) {
      const r = evaluateWindow(hits, t0 + i, max, win);
      expect(r.allowed).toBe(true);
      hits = r.nextHits;
    }
    const blocked = evaluateWindow(hits, t0 + max + 1, max, win);
    expect(blocked.allowed).toBe(false);
    const res = rateLimitResponse(blocked);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
    const body = await res.json();
    expect(body.error).toMatch(/too many requests/i);
  });
});
