'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmissionPortal from '@/src/components/SubmissionPortal';
import { useAppData } from '@/src/lib/appDataContext';
import { api } from '@/src/lib/api';
import { Assignment, Course } from '@/src/types';

export default function SubmitAssignmentPage() {
  const params = useParams<{ id: string; assignmentId: string }>();
  const router = useRouter();
  const { courses, handleSubmissionSuccess } = useAppData();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolve = async () => {
      let found = courses.find((c) => c.id === params.id) || null;
      if (!found) {
        try {
          found = await api<Course>(`/api/courses/${params.id}`);
        } catch {
          found = null;
        }
      }
      setCourse(found);
      setAssignment(found?.assignments.find((a) => a.id === params.assignmentId) || null);
      setLoading(false);
    };
    resolve();
  }, [params.id, params.assignmentId, courses]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
        Loading assignment…
      </div>
    );
  }

  if (!course || !assignment) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
        <p>Assignment not found</p>
        <button
          onClick={() => router.push(`/courses/${params.id}`)}
          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <SubmissionPortal
      assignment={assignment}
      course={course}
      onBack={() => router.push(`/courses/${course.id}`)}
      onSubmissionSuccess={(sub) => {
        handleSubmissionSuccess(sub);
      }}
    />
  );
}
