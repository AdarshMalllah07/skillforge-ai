import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';

const uploadsBase = path.join(process.cwd(), 'public', 'uploads');

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

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function ensureUploadDirs(): void {
  if (useBlobStorage()) return;
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

export type StoreUploadResult = {
  filename: string;
  url: string;
  originalName: string;
  storage: 'local' | 'blob';
};

export async function storeUpload(
  file: File,
  options: { folder: 'profiles' | 'submissions'; userId: string; prefix: string }
): Promise<StoreUploadResult> {
  const originalExt = path.extname(file.name).toLowerCase() || '';
  const safeUserId = options.userId.replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
  const filename = `${options.prefix}_${safeUserId}_${Date.now()}${originalExt}`;
  const originalName = path.basename(file.name).slice(0, 200);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (useBlobStorage()) {
    const blob = await put(`${options.folder}/${filename}`, buffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return {
      filename,
      url: blob.url,
      originalName,
      storage: 'blob',
    };
  }

  ensureUploadDirs();
  const dir =
    options.folder === 'profiles' ? PROFILE_UPLOADS_DIR : SUBMISSION_UPLOADS_DIR;
  const urlPrefix =
    options.folder === 'profiles'
      ? PROFILE_UPLOADS_URL_PREFIX
      : SUBMISSION_UPLOADS_URL_PREFIX;
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);

  return {
    filename,
    url: `${urlPrefix}${filename}`,
    originalName,
    storage: 'local',
  };
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

  const originalExt = path.extname(file.name).toLowerCase() || '.jpg';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(originalExt)
    ? originalExt
    : '.jpg';

  // Normalize extension for consistent local filenames
  const renamed = new File([file], `avatar${safeExt}`, { type: file.type });
  const stored = await storeUpload(renamed, {
    folder: 'profiles',
    userId,
    prefix: 'profile',
  });

  return { filename: stored.filename, url: stored.url };
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

  const stored = await storeUpload(file, {
    folder: 'submissions',
    userId,
    prefix: 'sub',
  });

  return {
    filename: stored.filename,
    url: stored.url,
    originalName: stored.originalName,
  };
}
