import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_ROOT));

// API routes
app.use('/api', miscRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);

async function startServer() {
  await connectDB();
  await seedDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('API: MongoDB + JWT RBAC (STUDENT | INSTRUCTOR | EVALUATOR | ADMIN)');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
