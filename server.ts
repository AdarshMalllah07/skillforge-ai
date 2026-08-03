import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { connectDB } from './server/db';
import { seedDatabase } from './server/seed';
import { ensureUploadDirs, UPLOADS_ROOT } from './server/uploads';
import authRoutes from './server/routes/auth';
import userRoutes from './server/routes/users';
import courseRoutes from './server/routes/courses';
import submissionRoutes from './server/routes/submissions';
import aiRoutes from './server/routes/ai';
import miscRoutes from './server/routes/misc';

dotenv.config();
ensureUploadDirs();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isVercel = Boolean(process.env.VERCEL);
const isProd = process.env.NODE_ENV === 'production' || isVercel;

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_ROOT));

let dbReady: Promise<void> | null = null;

async function ensureDb(): Promise<void> {
  if (!dbReady) {
    dbReady = (async () => {
      await connectDB();
      await seedDatabase();
    })().catch((err) => {
      dbReady = null;
      throw err;
    });
  }
  await dbReady;
}

function resolveStaticRoot(): string {
  const candidates = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'dist'),
  ];
  return candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) || candidates[0];
}

function isSpaExcluded(reqPath: string): boolean {
  return (
    reqPath.startsWith('/api') ||
    reqPath.startsWith('/uploads') ||
    reqPath.startsWith('/assets') ||
    Boolean(path.extname(reqPath))
  );
}

// DB only required for API routes
app.use('/api', async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

app.use('/api', miscRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);

async function attachFrontend(): Promise<void> {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    return;
  }

  // On Vercel, Vite output lives in the function under public/ (CDN static/ is empty),
  // so Express must serve JS/CSS itself.
  const staticRoot = resolveStaticRoot();
  app.use(express.static(staticRoot, { index: false, fallthrough: true }));
  app.get('*', (req, res, next) => {
    if (isSpaExcluded(req.path)) return next();
    const indexPath = path.join(staticRoot, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(500).send('Frontend build missing. Run vite build --outDir public.');
    }
    res.sendFile(indexPath);
  });
}

const frontendReady = attachFrontend().catch((err) => {
  console.error('Frontend setup failed:', err);
  throw err;
});

// Ensure frontend middleware is attached before handling non-API traffic.
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  try {
    await frontendReady;
    next();
  } catch {
    res.status(503).send('Service unavailable');
  }
});

async function startServer() {
  await ensureDb();
  await frontendReady;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('API: MongoDB + JWT RBAC (STUDENT | INSTRUCTOR | EVALUATOR | ADMIN)');
  });
}

if (!isVercel) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
