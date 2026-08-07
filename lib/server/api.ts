import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/server/ensure-db';
import { logger, newRequestId, requestContext } from '@/server/logger';

function requestSummary(req: NextRequest) {
  return {
    method: req.method,
    path: req.nextUrl.pathname,
    queryKeys: [...req.nextUrl.searchParams.keys()],
    contentType: req.headers.get('content-type') || undefined,
  };
}

/**
 * Ensures DB connection, runs the route handler, and writes a compact API log entry.
 * Prefer this for all `/api/*` route handlers.
 * Intentionally omits request/response bodies and PII to avoid log leakage.
 */
export async function withApi(
  req: NextRequest,
  handler: () => Promise<Response | NextResponse>
): Promise<Response | NextResponse> {
  const requestId = newRequestId();
  const started = Date.now();
  const summary = requestSummary(req);

  return requestContext.run(
    { requestId, method: req.method, path: summary.path },
    async () => {
      logger.api('API request started', { requestId, ...summary });

      try {
        await ensureDb();
        const response = await handler();
        const durationMs = Date.now() - started;

        logger.api('API request completed', {
          requestId,
          method: req.method,
          path: summary.path,
          status: response.status,
          durationMs,
        });

        try {
          response.headers.set('x-request-id', requestId);
        } catch {
          // Some response header maps are immutable; logging still succeeded.
        }
        return response;
      } catch (err: unknown) {
        const durationMs = Date.now() - started;
        const message = err instanceof Error ? err.message : 'Unknown error';
        const stack = err instanceof Error ? err.stack : undefined;

        logger.apiError('API request failed', {
          requestId,
          method: req.method,
          path: summary.path,
          durationMs,
          error: message,
          stack,
        });

        if (message.includes('MONGODB_URI') || message.toLowerCase().includes('mongo')) {
          return NextResponse.json(
            { error: 'Database unavailable', requestId },
            { status: 503, headers: { 'x-request-id': requestId } }
          );
        }

        return NextResponse.json(
          { error: 'Internal server error', message, requestId },
          { status: 500, headers: { 'x-request-id': requestId } }
        );
      }
    }
  );
}

/** @deprecated Prefer withApi(req, handler) for request logging. Kept for gradual migration. */
export async function withDb<T>(handler: () => Promise<T>): Promise<T | NextResponse> {
  try {
    await ensureDb();
    return await handler();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.apiError('withDb handler failed', {
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    if (message.includes('MONGODB_URI') || message.toLowerCase().includes('mongo')) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    throw err;
  }
}
