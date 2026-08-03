import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authenticate, requireRoles } from '../middleware/auth';
import { toClient, toClientList, newId } from '../utils';
import { UserRole } from '../types';
import { DEFAULT_AVATAR, deleteLocalProfileAvatar, isLocalProfileAvatar } from '../uploads';

const router = Router();

router.use(authenticate, requireRoles('ADMIN'));

router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(toClientList(users));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list users', message: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, role, title, bio, skills, avatar, password } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const validRoles: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'EVALUATOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password || 'password123', 10);
    const user = await User.create({
      _id: newId(`user_${String(role).toLowerCase()}`),
      name,
      email: String(email).toLowerCase(),
      password: hashed,
      role,
      title: title || `${role} Member`,
      bio: bio || '',
      skills: skills || [],
      avatar: avatar || DEFAULT_AVATAR,
    });

    res.status(201).json(toClient(user));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user', message: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const allowed = ['name', 'email', 'role', 'title', 'bio', 'skills', 'avatar', 'githubUrl', 'linkedInUrl'] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const existing = await User.findById(req.params.id);
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

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(toClient(user));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user', message: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    deleteLocalProfileAvatar(user.avatar);
    res.json({ message: 'User deleted', user: toClient(user) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete user', message: err.message });
  }
});

export default router;
