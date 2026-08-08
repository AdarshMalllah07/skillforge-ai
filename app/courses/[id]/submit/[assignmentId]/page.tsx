'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SubmissionPortal from '@/src/components/SubmissionPortal';
import { useAppData } from '@/src/lib/appDataContext';
import { useAuth } from '@/src/lib/authContext';
import { api } from '@/src/lib/api';
import { Assignment, Course } from '@/src/types';
import { Button } from '@/src/components/ui/Button';

export default function SubmitAssignmentPage() {
  const params = useParams<{ id: string; assignmentId: string }>();
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    courses,
    handleSubmissionSuccess,
    isEnrolledIn,
    enrollInCourse,
  } = useAppData();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

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

  const role = currentUser?.role;
  const requiresEnrollment = role === 'STUDENT' || role === 'ADMIN';
  const enrolled = isEnrolledIn(course.id);

  if (requiresEnrollment && !enrolled) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-slate-600 text-sm px-4">
        <p className="text-center max-w-md">
          You must enroll in <strong>{course.title}</strong> before submitting this assignment.
        </p>
        <div className="flex gap-2">
          <Button
            disabled={enrolling}
            onClick={async () => {
              setEnrolling(true);
              await enrollInCourse(course.id);
              setEnrolling(false);
            }}
          >
            {enrolling ? 'Enrolling…' : 'Enroll & Continue'}
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/courses/${course.id}`)}>
            Back to Course
          </Button>
        </div>
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
