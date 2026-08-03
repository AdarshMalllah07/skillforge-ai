import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authenticate, signToken } from '../middleware/auth';
import { toClient, newId } from '../utils';
import {
  DEFAULT_AVATAR,
  PROFILE_UPLOADS_URL_PREFIX,
  deleteLocalProfileAvatar,
  isLocalProfileAvatar,
  profileUpload,
} from '../uploads';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      _id: newId('user_student'),
      name,
      email: String(email).toLowerCase(),
      password: hashed,
      role: 'STUDENT',
      avatar: DEFAULT_AVATAR,
      title: 'Student / Candidate',
      bio: 'Enrolled student exploring courses and submitting assignments on House of EdTech.',
      skills: [],
    });

    const client = toClient(user)!;
    const token = signToken({ id: client.id, email: client.email, role: client.role });
    res.status(201).json({ token, user: client });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const client = toClient(user)!;
    const token = signToken({ id: client.id, email: client.email, role: client.role });
    res.json({ token, user: client });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  res.json({ user: req.user });
});

router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const allowed = ['name', 'title', 'bio', 'skills', 'avatar', 'githubUrl', 'linkedInUrl'] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const existing = await User.findById(req.user!.id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (
      typeof updates.avatar === 'string' &&
      updates.avatar !== existing.avatar &&
      isLocalProfileAvatar(existing.avatar)
    ) {
      deleteLocalProfileAvatar(existing.avatar);
    }

    const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true });
    res.json({ user: toClient(user) });
  } catch (err: any) {
    res.status(500).json({ error: 'Profile update failed', message: err.message });
  }
});

router.post(
  '/me/avatar',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    profileUpload.single('avatar')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const user = await User.findById(req.user!.id);
      if (!user) {
        deleteLocalProfileAvatar(`${PROFILE_UPLOADS_URL_PREFIX}${req.file.filename}`);
        return res.status(404).json({ error: 'User not found' });
      }

      deleteLocalProfileAvatar(user.avatar);
      user.avatar = `${PROFILE_UPLOADS_URL_PREFIX}${req.file.filename}`;
      await user.save();

      res.json({ user: toClient(user) });
    } catch (err: any) {
      if (req.file) {
        deleteLocalProfileAvatar(`${PROFILE_UPLOADS_URL_PREFIX}${req.file.filename}`);
      }
      res.status(500).json({ error: 'Avatar upload failed', message: err.message });
    }
  }
);

router.delete('/me/avatar', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    deleteLocalProfileAvatar(user.avatar);
    user.avatar = DEFAULT_AVATAR;
    await user.save();

    res.json({ user: toClient(user) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove avatar', message: err.message });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  res.json({
    message: 'If an account exists for that email, password reset instructions have been sent.',
  });
});

export default router;
