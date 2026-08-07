import fs from 'fs';
import path from 'path';

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';

// Vercel’s filesystem is read-only except /tmp; use that for uploads there.
const uploadsBase = process.env.VERCEL
  ? path.join('/tmp', 'skillforge-uploads')
  : path.join(process.cwd(), 'public', 'uploads');

export const UPLOADS_ROOT = uploadsBase;
export const PROFILE_UPLOADS_DIR = path.join(UPLOADS_ROOT, 'profiles');
export const PROFILE_UPLOADS_URL_PREFIX = '/uploads/profiles/';
export const SUBMISSION_UPLOADS_DIR = path.join(UPLOADS_ROOT, 'submissions');
export const SUBMISSION_UPLOADS_URL_PREFIX = '/uploads/submissions/';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_SUBMISSION_MIME = new Set([
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'text/javascript',
  'application/javascript',
  'text/typescript',
  'application/typescript',
  'text/x-python',
  'application/octet-stream',
]);
const ALLOWED_SUBMISSION_EXT = new Set([
  '.txt',
  '.md',
  '.pdf',
  '.zip',
  '.json',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.py',
  '.java',
  '.c',
  '.cpp',
  '.go',
  '.rs',
]);

export function ensureUploadDirs(): void {
  try {
    fs.mkdirSync(PROFILE_UPLOADS_DIR, { recursive: true });
    fs.mkdirSync(SUBMISSION_UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create upload dirs:', err);
  }
}

export function isLocalProfileAvatar(avatarUrl?: string | null): boolean {
  return Boolean(avatarUrl && avatarUrl.startsWith(PROFILE_UPLOADS_URL_PREFIX));
}

export function deleteLocalProfileAvatar(avatarUrl?: string | null): void {
  if (!isLocalProfileAvatar(avatarUrl)) return;

  const filename = path.basename(avatarUrl!);
  if (!filename || filename.includes('..')) return;

  const filePath = path.join(PROFILE_UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function saveProfileAvatar(
  file: File,
  userId: string
): Promise<{ filename: string; url: string }> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be 5MB or smaller');
  }

  ensureUploadDirs();

  const originalExt = path.extname(file.name).toLowerCase() || '.jpg';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(originalExt)
    ? originalExt
    : '.jpg';
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
  const filename = `profile_${safeUserId}_${Date.now()}${safeExt}`;
  const filePath = path.join(PROFILE_UPLOADS_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return {
    filename,
    url: `${PROFILE_UPLOADS_URL_PREFIX}${filename}`,
  };
}

export async function saveSubmissionAttachment(
  file: File,
  userId: string
): Promise<{ filename: string; url: string; originalName: string }> {
  const originalExt = path.extname(file.name).toLowerCase() || '';
  if (!ALLOWED_SUBMISSION_EXT.has(originalExt)) {
    throw new Error(
      'Unsupported file type. Allowed: txt, md, pdf, zip, json, and common source extensions'
    );
  }
  if (
    file.type &&
    !ALLOWED_SUBMISSION_MIME.has(file.type) &&
    !file.type.startsWith('text/')
  ) {
    throw new Error('Unsupported file MIME type');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Attachment must be 10MB or smaller');
  }

  ensureUploadDirs();

  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
  const filename = `sub_${safeUserId}_${Date.now()}${originalExt}`;
  const filePath = path.join(SUBMISSION_UPLOADS_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return {
    filename,
    url: `${SUBMISSION_UPLOADS_URL_PREFIX}${filename}`,
    originalName: path.basename(file.name).slice(0, 200),
  };
}
