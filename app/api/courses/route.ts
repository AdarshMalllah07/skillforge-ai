import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/server/api';
import { getAuthUser, requireRoles } from '@/server/middleware/auth';
import { Course } from '@/server/models/Course';
import { toClient, toClientList, newId, slugify } from '@/server/utils';
import { courseCreateSchema, parseBody } from '@/server/validation';

export async function GET(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const user = await getAuthUser(req);
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search');
      const category = searchParams.get('category');
      const level = searchParams.get('level');
      const status = searchParams.get('status');

      const filter: Record<string, unknown> = {};

      if (!user || user.role === 'STUDENT' || user.role === 'EVALUATOR') {
        filter.status = 'PUBLISHED';
      } else if (user.role === 'INSTRUCTOR') {
        if (status && status !== 'ALL' && status !== 'PUBLISHED') {
          filter.status = status;
          filter.instructorId = user.id;
        } else if (status === 'PUBLISHED') {
          filter.status = 'PUBLISHED';
        } else {
          filter.$or = [{ instructorId: user.id }, { status: 'PUBLISHED' }];
        }
      } else if (status && status !== 'ALL') {
        filter.status = status;
      }

      if (category && category !== 'ALL') {
        filter.category = category;
      }
      if (level && level !== 'ALL') {
        filter.level = level;
      }
      if (search && search.trim()) {
        filter.$text = { $search: search.trim() };
      }

      let courses = await Course.find(filter).sort({ createdAt: -1 });

      if (search && search.trim() && courses.length === 0) {
        const q = search.trim();
        const { $text: _text, $or: visibilityOr, ...rest } = filter;
        const textOr = [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ];
        const regexFilter: Record<string, unknown> = {
          ...rest,
          ...(visibilityOr
            ? { $and: [{ $or: visibilityOr as unknown[] }, { $or: textOr }] }
            : { $or: textOr }),
        };
        courses = await Course.find(regexFilter).sort({ createdAt: -1 });
      }

      return NextResponse.json(
        toClientList(courses).map((c) => ({
          ...c,
          createdAt: c.createdAt?.toISOString?.() || c.createdAt,
          updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
        }))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to fetch courses', message }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withApi(req, async () => {
    try {
      const auth = await requireRoles(req, 'INSTRUCTOR', 'ADMIN');
      if ('error' in auth) return auth.error;

      const parsed = parseBody(courseCreateSchema, await req.json());
      if ('error' in parsed) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const { title, description, category, level, thumbnail, modules, assignments, status } =
        parsed.data;

      const courseId = newId('course');
      const assignList = (assignments || []).map((a: Record<string, unknown>) => ({
        ...a,
        id: a.id || newId('assign'),
        courseId,
        dueDate: a.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        rubrics: ((a.rubrics as Record<string, unknown>[]) || []).map((r) => ({
          ...r,
          id: r.id || newId('rub'),
        })),
      }));

      const moduleList = (modules || []).map((m: Record<string, unknown>) => ({
        ...m,
        id: m.id || newId('mod'),
        lessons: ((m.lessons as Record<string, unknown>[]) || []).map((l) => ({
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
        instructorId: auth.user.id,
        instructorName: auth.user.name,
        thumbnail:
          thumbnail ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        status: status || 'PUBLISHED',
        modules: moduleList,
        assignments: assignList,
        enrolledStudentsCount: 0,
        rating: 5,
      });

      return NextResponse.json(toClient(course), { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: 'Failed to create course', message }, { status: 500 });
    }
  });
}
