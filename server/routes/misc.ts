import { Router, Request, Response } from 'express';
import { Candidate } from '../models/Candidate';
import { Enrollment } from '../models/Enrollment';
import { authenticate, requireRoles } from '../middleware/auth';
import { toClient, toClientList } from '../utils';

const router = Router();

router.get('/candidate', async (_req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findOne();
    if (!candidate) {
      return res.json(null);
    }
    const obj = candidate.toObject();
    delete (obj as any).__v;
    delete (obj as any)._id;
    res.json(obj);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load candidate', message: err.message });
  }
});

router.put('/candidate', authenticate, async (req: Request, res: Response) => {
  try {
    let candidate = await Candidate.findOne();
    if (!candidate) {
      candidate = new Candidate(req.body);
    } else {
      Object.assign(candidate, req.body);
    }
    await candidate.save();
    const obj = candidate.toObject();
    delete (obj as any).__v;
    delete (obj as any)._id;
    res.json(obj);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update candidate', message: err.message });
  }
});

router.get('/enrollments/me', authenticate, requireRoles('STUDENT'), async (req: Request, res: Response) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user!.id }).sort({ enrolledAt: -1 });
    res.json(toClientList(enrollments));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list enrollments', message: err.message });
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'mongodb' });
});

export default router;
