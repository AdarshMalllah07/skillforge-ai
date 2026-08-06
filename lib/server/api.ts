import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/server/ensure-db';
import { logger, newRequestId, requestContext, sanitizeForLog } from '@/server/logger';

async function readRequestDetails(req: NextRequest) {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'authorization') {
      headers[key] = value.startsWith('Bearer ') ? 'Bearer [REDACTED]' : '[REDACTED]';
    } else if (key.toLowerCase() === 'cookie') {
      headers[key] = '[REDACTED]';
    } else {
      headers[key] = value.length > 500 ? `${value.slice(0, 500)}…` : value;
    }
  });

  let body: unknown = undefined;
  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      body = await req.clone().json();
    } else if (contentType.includes('multipart/form-data')) {
      body = { type: 'multipart/form-data', note: 'binary/form fields omitted' };
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      body = await req.clone().text();
    } else if (req.method !== 'GET' && req.method !== 'HEAD') {
      const text = await req.clone().text();
      body = text ? text.slice(0, 2000) : undefined;
    }
  } catch (err) {
    body = {
      parseError: err instanceof Error ? err.message : 'Failed to parse body',
    };
  }

  return {
    method: req.method,
    url: req.url,
    path: req.nextUrl.pathname,
    query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    headers,
    body: sanitizeForLog(body),
  };
}

async function readResponseDetails(response: Response) {
  const status = response.status;
  const contentType = response.headers.get('content-type') || '';
  let body: unknown = undefined;

  try {
    const clone = response.clone();
    if (contentType.includes('application/json')) {
      body = await clone.json();
    } else {
      const text = await clone.text();
      body = text ? text.slice(0, 4000) : undefined;
    }
  } catch (err) {
    body = {
      parseError: err instanceof Error ? err.message : 'Failed to parse response body',
    };
  }

  return { status, contentType, body: sanitizeForLog(body) };
}

/**
 * Ensures DB connection, runs the route handler, and writes a detailed API log entry.
 * Prefer this for all `/api/*` route handlers.
 */
export async function withApi(
  req: NextRequest,
  handler: () => Promise<Response | NextResponse>
): Promise<Response | NextResponse> {
  const requestId = newRequestId();
  const started = Date.now();
  const requestDetails = await readRequestDetails(req);

  return requestContext.run(
    { requestId, method: req.method, path: requestDetails.path },
    async () => {
      logger.api('API request started', { requestId, ...requestDetails });

      try {
        await ensureDb();
        const response = await handler();
        const responseDetails = await readResponseDetails(response);
        const durationMs = Date.now() - started;

        logger.api('API request completed', {
          requestId,
          method: req.method,
          path: requestDetails.path,
          durationMs,
          ...responseDetails,
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
          path: requestDetails.path,
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
