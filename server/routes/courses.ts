import { Router, Request, Response } from 'express';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { authenticate, optionalAuth, requireRoles } from '../middleware/auth';
import { toClient, toClientList, newId, slugify } from '../utils';

const router = Router();

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { search, category, level, status } = req.query;
    const filter: Record<string, unknown> = {};

    // Students only see published courses unless filtering their own enrollments later
    if (!req.user || req.user.role === 'STUDENT') {
      filter.status = 'PUBLISHED';
    } else if (status && typeof status === 'string' && status !== 'ALL') {
      filter.status = status;
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      filter.category = category;
    }
    if (level && typeof level === 'string' && level !== 'ALL') {
      filter.level = level;
    }
    if (search && typeof search === 'string' && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    let courses = await Course.find(filter).sort({ createdAt: -1 });

    // Text index may miss if empty — fallback to regex
    if (search && typeof search === 'string' && search.trim() && courses.length === 0) {
      const q = search.trim();
      const regexFilter: Record<string, unknown> = {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.category ? { category: filter.category } : {}),
        ...(filter.level ? { level: filter.level } : {}),
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ],
      };
      courses = await Course.find(regexFilter).sort({ createdAt: -1 });
    }

    res.json(
      toClientList(courses).map((c) => ({
        ...c,
        createdAt: c.createdAt?.toISOString?.() || c.createdAt,
        updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch courses', message: err.message });
  }
});

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (
      course.status !== 'PUBLISHED' &&
      (!req.user || req.user.role === 'STUDENT')
    ) {
      return res.status(403).json({ error: 'Course not available' });
    }
    const client = toClient(course)!;
    res.json({
      ...client,
      createdAt: client.createdAt?.toISOString?.() || client.createdAt,
      updatedAt: client.updatedAt?.toISOString?.() || client.updatedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch course', message: err.message });
  }
});

router.post('/', authenticate, requireRoles('INSTRUCTOR', 'ADMIN', 'EVALUATOR'), async (req: Request, res: Response) => {
  try {
    const { title, description, category, level, thumbnail, modules, assignments, status } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const courseId = newId('course');
    const assignList = (assignments || []).map((a: any) => ({
      ...a,
      id: a.id || newId('assign'),
      courseId,
      dueDate: a.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      rubrics: (a.rubrics || []).map((r: any) => ({
        ...r,
        id: r.id || newId('rub'),
      })),
    }));

    const moduleList = (modules || []).map((m: any) => ({
      ...m,
      id: m.id || newId('mod'),
      lessons: (m.lessons || []).map((l: any) => ({
        ...l,
        id: l.id || newId('les'),
      })),
    }));

    const course = await Course.create({
      _id: courseId,
      title,
      slug: slugify(title),
      description,
      category: category || 'General Tech',
      level: level || 'INTERMEDIATE',
      instructorId: req.user!.id,
      instructorName: req.user!.name,
      thumbnail:
        thumbnail ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      status: status || 'PUBLISHED',
      modules: moduleList,
      assignments: assignList,
      enrolledStudentsCount: 0,
      rating: 5,
    });

    res.status(201).json(toClient(course));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create course', message: err.message });
  }
});

router.put('/:id', authenticate, requireRoles('INSTRUCTOR', 'ADMIN', 'EVALUATOR'), async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Instructors can only edit their own courses; Admin/Evaluator can edit any
    if (
      req.user!.role === 'INSTRUCTOR' &&
      course.instructorId !== req.user!.id
    ) {
      return res.status(403).json({ error: 'You can only edit your own courses' });
    }

    const allowed = [
      'title',
      'description',
      'category',
      'level',
      'thumbnail',
      'status',
      'modules',
      'assignments',
      'rating',
    ] as const;

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (course as any)[key] = req.body[key];
      }
    }
    if (req.body.title) {
      course.slug = slugify(req.body.title);
    }

    await course.save();
    res.json(toClient(course));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update course', message: err.message });
  }
});

router.delete('/:id', authenticate, requireRoles('INSTRUCTOR', 'ADMIN', 'EVALUATOR'), async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (
      req.user!.role === 'INSTRUCTOR' &&
      course.instructorId !== req.user!.id
    ) {
      return res.status(403).json({ error: 'You can only delete your own courses' });
    }

    await course.deleteOne();
    await Enrollment.deleteMany({ courseId: req.params.id });
    res.json({ message: 'Course deleted', course: toClient(course) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete course', message: err.message });
  }
});

/** Add assignment to course */
router.post('/:id/assignments', authenticate, requireRoles('INSTRUCTOR', 'ADMIN', 'EVALUATOR'), async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const assignment = {
      id: newId('assign'),
      courseId: course._id,
      title: req.body.title || 'New Challenge',
      description: req.body.description || '',
      type: req.body.type || 'CODE',
      programmingLanguage: req.body.programmingLanguage || 'typescript',
      starterCode: req.body.starterCode || '// Write code here...',
      maxScore: req.body.maxScore || 100,
      dueDate: req.body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      rubrics: req.body.rubrics || [
        { id: newId('rub'), title: 'Functionality & Architecture', description: 'Execution quality', maxPoints: 50 },
        { id: newId('rub'), title: 'Security & Sanitization', description: 'Input safety', maxPoints: 50 },
      ],
    };

    course.assignments.push(assignment);
    await course.save();
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create assignment', message: err.message });
  }
});

/** Enroll current student in course */
router.post('/:id/enroll', authenticate, requireRoles('STUDENT'), async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Course is not open for enrollment' });
    }

    const existing = await Enrollment.findOne({
      courseId: course._id,
      studentId: req.user!.id,
    });
    if (existing) {
      return res.json({ message: 'Already enrolled', enrollment: toClient(existing) });
    }

    const enrollment = await Enrollment.create({
      _id: newId('enroll'),
      courseId: course._id,
      studentId: req.user!.id,
    });

    course.enrolledStudentsCount = (course.enrolledStudentsCount || 0) + 1;
    await course.save();

    res.status(201).json({ message: 'Enrolled successfully', enrollment: toClient(enrollment) });
  } catch (err: any) {
    res.status(500).json({ error: 'Enrollment failed', message: err.message });
  }
});

router.get('/:id/enrollments', authenticate, requireRoles('INSTRUCTOR', 'ADMIN', 'EVALUATOR'), async (req: Request, res: Response) => {
  try {
    const enrollments = await Enrollment.find({ courseId: req.params.id }).sort({ enrolledAt: -1 });
    res.json(toClientList(enrollments));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list enrollments', message: err.message });
  }
});

export default router;
