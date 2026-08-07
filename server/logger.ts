import fs from 'fs';
import path from 'path';
import { AsyncLocalStorage } from 'async_hooks';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_RETENTION_DAYS = 14;
const DATE_LOG_RE = /^(\d{4}-\d{2}-\d{2})\.log$/;

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface RequestLogContext {
  requestId: string;
  method: string;
  path: string;
}

export const requestContext = new AsyncLocalStorage<RequestLogContext>();

let lastCleanupMs = 0;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // at most once per hour

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/** Local calendar date as yyyy-mm-dd (not UTC). */
export function dayStamp(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todaysLogFile(): string {
  ensureLogDir();
  return path.join(LOG_DIR, `${dayStamp()}.log`);
}

function parseLogDate(filename: string): Date | null {
  const match = DATE_LOG_RE.exec(filename);
  if (!match) return null;
  const [y, m, d] = match[1].split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Deletes `yyyy-mm-dd.log` files older than 14 days. Also removes legacy api-/email- prefixed logs. */
export function cleanupOldLogs(retentionDays = LOG_RETENTION_DAYS): { deleted: string[] } {
  ensureLogDir();
  const deleted: string[] = [];
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - retentionDays);

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(LOG_DIR, { withFileTypes: true });
  } catch {
    return { deleted };
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    const fullPath = path.join(LOG_DIR, name);

    // Legacy names from earlier logger versions
    if (/^(api|email)-\d{4}-\d{2}-\d{2}\.log$/.test(name)) {
      try {
        fs.unlinkSync(fullPath);
        deleted.push(name);
      } catch {
        /* ignore */
      }
      continue;
    }

    const fileDate = parseLogDate(name);
    if (!fileDate) continue;
    if (fileDate < cutoff) {
      try {
        fs.unlinkSync(fullPath);
        deleted.push(name);
      } catch {
        /* ignore */
      }
    }
  }

  return { deleted };
}

function maybeCleanupOldLogs() {
  const now = Date.now();
  if (now - lastCleanupMs < CLEANUP_INTERVAL_MS) return;
  lastCleanupMs = now;
  try {
    const { deleted } = cleanupOldLogs();
    if (deleted.length > 0) {
      console.log(`[logger] Deleted ${deleted.length} old log file(s): ${deleted.join(', ')}`);
    }
  } catch (err) {
    console.error('[logger] Log cleanup failed', err);
  }
}

const SENSITIVE_KEYS = new Set([
  'password',
  'oldpassword',
  'newpassword',
  'confirmpassword',
  'token',
  'rawtoken',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'smtp_pass',
  'smtppass',
  'apikey',
  'api_key',
  'secret',
  'jwt',
  'email',
  'to',
  'from',
  'cc',
  'bcc',
  'studentemail',
  'setupurl',
  'reseturl',
  'textpreview',
  'html',
  'text',
  'codecontent',
  'essaycontent',
  'mongodburi',
  'mongodburipassword',
]);

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_WITH_TOKEN_RE = /(https?:\/\/[^\s"'<>]*[?&]token=)[^&\s"'<>]+/gi;

function redactString(value: string): string {
  let out = value.replace(EMAIL_RE, '[REDACTED_EMAIL]');
  out = out.replace(URL_WITH_TOKEN_RE, '$1[REDACTED]');
  if (out.length > 500) return `${out.slice(0, 500)}…[truncated ${out.length} chars]`;
  return out;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_]/g, '');
}

export function sanitizeForLog(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (depth > 6) return '[MaxDepth]';

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeForLog(item, depth + 1));
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(normalizeKey(key))) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = sanitizeForLog(val, depth + 1);
      }
    }
    return out;
  }

  return value;
}

function writeLine(category: string, level: LogLevel, message: string, meta?: unknown) {
  maybeCleanupOldLogs();

  const ctx = requestContext.getStore();
  const entry = {
    ts: new Date().toISOString(),
    level,
    category,
    requestId: ctx?.requestId,
    method: ctx?.method,
    path: ctx?.path,
    message,
    ...(meta !== undefined ? { meta: sanitizeForLog(meta) } : {}),
  };

  const line = JSON.stringify(entry) + '\n';
  try {
    fs.appendFileSync(todaysLogFile(), line, 'utf8');
  } catch (err) {
    console.error('[logger] Failed to write log file', err);
  }

  const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  consoleFn(`[${category}] ${message}`, meta !== undefined ? sanitizeForLog(meta) : '');
}

export const logger = {
  api(message: string, meta?: unknown) {
    writeLine('api', 'info', message, meta);
  },
  apiWarn(message: string, meta?: unknown) {
    writeLine('api', 'warn', message, meta);
  },
  apiError(message: string, meta?: unknown) {
    writeLine('api', 'error', message, meta);
  },
  email(message: string, meta?: unknown) {
    writeLine('email', 'info', message, meta);
  },
  emailWarn(message: string, meta?: unknown) {
    writeLine('email', 'warn', message, meta);
  },
  emailError(message: string, meta?: unknown) {
    writeLine('email', 'error', message, meta);
  },
  info(category: string, message: string, meta?: unknown) {
    writeLine(category, 'info', message, meta);
  },
  error(category: string, message: string, meta?: unknown) {
    writeLine(category, 'error', message, meta);
  },
};

export function newRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getLogsDir(): string {
  ensureLogDir();
  return LOG_DIR;
}
