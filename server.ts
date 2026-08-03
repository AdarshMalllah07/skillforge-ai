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
let frontendReady: Promise<void> | null = null;

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

async function setupFrontend(): Promise<void> {
  if (frontendReady) {
    await frontendReady;
    return;
  }

  frontendReady = (async () => {
    if (!isProd) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      return;
    }

    // On Vercel, files in public/ are served by the CDN; Express still needs an SPA fallback.
    const staticRoot = resolveStaticRoot();
    if (!isVercel) {
      app.use(express.static(staticRoot));
    }
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
      const indexPath = path.join(staticRoot, 'index.html');
      if (!fs.existsSync(indexPath)) {
        return res.status(500).send('Frontend build missing. Run vite build --outDir public.');
      }
      res.sendFile(indexPath);
    });
  })().catch((err) => {
    frontendReady = null;
    throw err;
  });

  await frontendReady;
}

app.use(async (req, res, next) => {
  try {
    if (req.path.startsWith('/api')) {
      await ensureDb();
    }
    await setupFrontend();
    next();
  } catch (err) {
    console.error('Request bootstrap failed:', err);
    if (req.path.startsWith('/api')) {
      res.status(503).json({ error: 'Database unavailable' });
      return;
    }
    res.status(503).send('Service unavailable');
  }
});

// API routes
app.use('/api', miscRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);

async function startServer() {
  await ensureDb();
  await setupFrontend();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('API: MongoDB + JWT RBAC (STUDENT | INSTRUCTOR | EVALUATOR | ADMIN)');
  });
}

// Vercel: export the app. Local / traditional host: listen on a port.
if (!isVercel) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
