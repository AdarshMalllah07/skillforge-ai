import { Router, Request, Response } from 'express';
import { Submission } from '../models/Submission';
import { Course } from '../models/Course';
import { authenticate, requireRoles } from '../middleware/auth';
import { toClient, toClientList, newId } from '../utils';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    const role = req.user!.role;

    if (role === 'STUDENT') {
      filter.studentId = req.user!.id;
    } else if (role === 'INSTRUCTOR') {
      // Instructors see submissions for their courses
      const myCourses = await Course.find({ instructorId: req.user!.id }).select('_id');
      const ids = myCourses.map((c) => c._id);
      filter.courseId = { $in: ids };
    }
    // ADMIN and EVALUATOR see all

    if (req.query.status && typeof req.query.status === 'string') {
      filter.status = req.query.status;
    }
    if (req.query.courseId && typeof req.query.courseId === 'string') {
      filter.courseId = req.query.courseId;
    }

    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
    res.json(
      toClientList(submissions).map((s) => ({
        ...s,
        submittedAt: s.submittedAt?.toISOString?.() || s.submittedAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch submissions', message: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const role = req.user!.role;
    if (role === 'STUDENT' && submission.studentId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const client = toClient(submission)!;
    res.json({
      ...client,
      submittedAt: client.submittedAt?.toISOString?.() || client.submittedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch submission', message: err.message });
  }
});

router.post('/', requireRoles('STUDENT'), async (req: Request, res: Response) => {
  try {
    const {
      assignmentId,
      assignmentTitle,
      courseId,
      courseTitle,
      codeContent,
      essayContent,
      repositoryUrl,
      maxScore,
    } = req.body;

    if (!assignmentId || (!codeContent && !essayContent && !repositoryUrl)) {
      return res.status(400).json({ error: 'Assignment ID and submission content are required' });
    }

    const course = courseId ? await Course.findById(courseId) : null;
    const assignment = course?.assignments?.find((a: any) => a.id === assignmentId);

    const submission = await Submission.create({
      _id: newId('sub'),
      assignmentId,
      assignmentTitle: assignmentTitle || assignment?.title || 'Course Assignment',
      courseId: courseId || course?._id || '',
      courseTitle: courseTitle || course?.title || 'Course Title',
      studentId: req.user!.id,
      studentName: req.user!.name,
      studentEmail: req.user!.email,
      submittedAt: new Date(),
      codeContent,
      essayContent,
      repositoryUrl,
      status: 'PENDING',
      maxScore: maxScore || assignment?.maxScore || 100,
    });

    const client = toClient(submission)!;
    res.status(201).json({
      ...client,
      submittedAt: client.submittedAt?.toISOString?.() || client.submittedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create submission', message: err.message });
  }
});

router.put('/:id', requireRoles('INSTRUCTOR', 'EVALUATOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (req.user!.role === 'INSTRUCTOR') {
      const course = await Course.findById(submission.courseId);
      if (!course || course.instructorId !== req.user!.id) {
        return res.status(403).json({ error: 'You can only grade submissions for your courses' });
      }
    }

    const {
      finalScore,
      instructorFeedback,
      status,
      aiEvaluation,
    } = req.body;

    if (finalScore !== undefined) submission.finalScore = Number(finalScore);
    if (instructorFeedback !== undefined) submission.instructorFeedback = instructorFeedback;
    if (aiEvaluation !== undefined) submission.aiEvaluation = aiEvaluation;
    if (status !== undefined) {
      submission.status = status;
    } else if (finalScore !== undefined || instructorFeedback !== undefined) {
      submission.status = 'GRADED';
    }

    await submission.save();
    const client = toClient(submission)!;
    res.json({
      ...client,
      submittedAt: client.submittedAt?.toISOString?.() || client.submittedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update submission', message: err.message });
  }
});

export default router;
