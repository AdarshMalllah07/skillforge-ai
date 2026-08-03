import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';

// Vercel’s filesystem is read-only except /tmp; use that for uploads there.
const uploadsBase = process.env.VERCEL
  ? path.join('/tmp', 'skillforge-uploads')
  : path.join(process.cwd(), 'uploads');

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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDirs();
    cb(null, PROFILE_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    const userId = (req.user?.id || 'user').replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `profile_${userId}_${Date.now()}${safeExt}`);
  },
});

export const profileUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
      return;
    }
    cb(null, true);
  },
});
