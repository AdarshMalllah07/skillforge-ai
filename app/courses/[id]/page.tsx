'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseDetailView from '@/src/components/CourseDetailView';
import { useAppData } from '@/src/lib/appDataContext';
import { api } from '@/src/lib/api';
import { Course } from '@/src/types';

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { courses, handleCreateAssignment, handleUpdateAssignment, handleDeleteAssignment, openSubmission, setCourses } = useAppData();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fromList = courses.find((c) => c.id === params.id);
    if (fromList) {
      setCourse(fromList);
      setLoading(false);
      return;
    }

    api<Course>(`/api/courses/${params.id}`)
      .then((data) => {
        setCourse(data);
        setCourses((prev) => {
          if (prev.some((c) => c.id === data.id)) return prev;
          return [data, ...prev];
        });
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [params.id, courses, setCourses]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
        Loading course…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
        <p>Course not found</p>
        <button
          onClick={() => router.push('/courses')}
          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <CourseDetailView
      course={course}
      onBack={() => router.push('/courses')}
      onOpenSubmissionPortal={openSubmission}
      onCreateAssignment={async (courseId, assignmentData) => {
        await handleCreateAssignment(courseId, assignmentData);
        const refreshed = await api<Course>(`/api/courses/${courseId}`);
        setCourse(refreshed);
      }}
      onUpdateAssignment={async (courseId, assignmentId, assignmentData) => {
        await handleUpdateAssignment(courseId, assignmentId, assignmentData);
        const refreshed = await api<Course>(`/api/courses/${courseId}`);
        setCourse(refreshed);
      }}
      onDeleteAssignment={async (courseId, assignmentId) => {
        await handleDeleteAssignment(courseId, assignmentId);
        const refreshed = await api<Course>(`/api/courses/${courseId}`);
        setCourse(refreshed);
      }}
    />
  );
}
