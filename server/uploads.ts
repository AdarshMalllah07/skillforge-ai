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

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function ensureUploadDirs(): void {
  try {
    fs.mkdirSync(PROFILE_UPLOADS_DIR, { recursive: true });
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
