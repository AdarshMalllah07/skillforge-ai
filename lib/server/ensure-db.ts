import { connectDB } from '@/server/db';
import { seedDatabase } from '@/server/seed';
import { ensureUploadDirs } from '@/server/uploads';

let dbReady: Promise<void> | null = null;

export async function ensureDb(): Promise<void> {
  if (!dbReady) {
    dbReady = (async () => {
      ensureUploadDirs();
      await connectDB();
      await seedDatabase();
    })().catch((err) => {
      dbReady = null;
      throw err;
    });
  }
  await dbReady;
}
