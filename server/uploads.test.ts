import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

const putMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => putMock(...args),
}));

describe('upload store selection', () => {
  const prevToken = process.env.BLOB_READ_WRITE_TOKEN;
  let tmpRoot: string;

  beforeEach(() => {
    putMock.mockReset();
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-uploads-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tmpRoot);
    vi.resetModules();
  });

  afterEach(() => {
    if (prevToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = prevToken;
    vi.restoreAllMocks();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('writes locally when BLOB_READ_WRITE_TOKEN is unset', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const { storeUpload, useBlobStorage } = await import('./uploads');
    expect(useBlobStorage()).toBe(false);

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const result = await storeUpload(file, {
      folder: 'submissions',
      userId: 'user_1',
      prefix: 'sub',
    });

    expect(result.storage).toBe('local');
    expect(result.url.startsWith('/uploads/submissions/')).toBe(true);
    expect(putMock).not.toHaveBeenCalled();
    const diskPath = path.join(
      tmpRoot,
      'public',
      'uploads',
      'submissions',
      result.filename
    );
    expect(fs.existsSync(diskPath)).toBe(true);
  });

  it('uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_test_token';
    putMock.mockResolvedValue({
      url: 'https://example.public.blob.vercel-storage.com/submissions/sub_user_1.txt',
    });

    const { storeUpload, useBlobStorage } = await import('./uploads');
    expect(useBlobStorage()).toBe(true);

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const result = await storeUpload(file, {
      folder: 'submissions',
      userId: 'user_1',
      prefix: 'sub',
    });

    expect(result.storage).toBe('blob');
    expect(result.url).toContain('blob.vercel-storage.com');
    expect(putMock).toHaveBeenCalledOnce();
  });
});
