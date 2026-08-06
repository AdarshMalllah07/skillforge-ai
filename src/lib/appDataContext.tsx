'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { useAuth } from './authContext';
import { getUi } from '../components/ui/UiProvider';
import { Course, Submission, Assignment } from '../types';
import { TAB_PATH } from './routes';
import { getNavItems } from '../components/nav/navItems';

interface AppDataContextType {
  courses: Course[];
  submissions: Submission[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  refreshData: () => Promise<void>;
  handleCreateCourse: (courseData: Partial<Course>) => Promise<void>;
  handleUpdateCourse: (id: string, updatedFields: Partial<Course>) => Promise<void>;
  handleDeleteCourse: (id: string) => Promise<void>;
  handleCreateAssignment: (courseId: string, assignmentData: Partial<Assignment>) => Promise<void>;
  handleSubmissionSuccess: (newSubmission: Submission) => void;
  handleUpdateSubmissionGrade: (
    submissionId: string,
    grade: number,
    feedback: string
  ) => Promise<void>;
  openCourse: (course: Course) => void;
  openSubmission: (assignment: Assignment, course: Course) => void;
  openGenerator: () => void;
  openSubmissions: () => void;
  openCourses: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, currentUser } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCourses([]);
      setSubmissions([]);
      return;
    }

    try {
      const [courseData, submissionData] = await Promise.all([
        api<Course[]>('/api/courses'),
        api<Submission[]>('/api/submissions'),
      ]);
      if (Array.isArray(courseData)) setCourses(courseData);
      if (Array.isArray(submissionData)) setSubmissions(submissionData);
    } catch (e) {
      console.log('Failed to load app data', e);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshData();
  }, [refreshData, currentUser?.id]);

  // Warm route chunks so sidebar clicks feel instant
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const paths = getNavItems(currentUser.role).map((item) => TAB_PATH[item.tab]);
    paths.forEach((path) => {
      try {
        router.prefetch(path);
      } catch {
        // ignore
      }
    });
  }, [isAuthenticated, currentUser?.role, router]);

  const handleCreateCourse = useCallback(async (courseData: Partial<Course>) => {
    try {
      const newCourse = await api<Course>('/api/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
      setCourses((prev) => [newCourse, ...prev]);
    } catch (err) {
      console.error('Create course error', err);
      getUi().toast({
        message: err instanceof Error ? err.message : 'Failed to create course',
        variant: 'error',
      });
    }
  }, []);

  const handleUpdateCourse = useCallback(async (id: string, updatedFields: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
    try {
      await api(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });
    } catch (err) {
      console.error('Update course error', err);
    }
  }, []);

  const handleDeleteCourse = useCallback(async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await api(`/api/courses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete course error', err);
    }
  }, []);

  const handleCreateAssignment = useCallback(
    async (courseId: string, assignmentData: Partial<Assignment>) => {
      try {
        const newAssign = await api<Assignment>(`/api/courses/${courseId}/assignments`, {
          method: 'POST',
          body: JSON.stringify(assignmentData),
        });

        setCourses((prev) =>
          prev.map((c) => {
            if (c.id === courseId) {
              return { ...c, assignments: [...c.assignments, newAssign] };
            }
            return c;
          })
        );
      } catch (err) {
        console.error('Create assignment error', err);
      }
    },
    []
  );

  const handleSubmissionSuccess = useCallback((newSubmission: Submission) => {
    setSubmissions((prev) => [newSubmission, ...prev.filter((s) => s.id !== newSubmission.id)]);
  }, []);

  const handleUpdateSubmissionGrade = useCallback(
    async (submissionId: string, grade: number, feedback: string) => {
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s.id === submissionId) {
            return {
              ...s,
              finalScore: grade,
              instructorFeedback: feedback,
              status: 'GRADED',
            };
          }
          return s;
        })
      );

      try {
        await api(`/api/submissions/${submissionId}`, {
          method: 'PUT',
          body: JSON.stringify({
            finalScore: grade,
            instructorFeedback: feedback,
            status: 'GRADED',
          }),
        });
      } catch (err) {
        console.error('Grade update error', err);
      }
    },
    []
  );

  const openCourse = useCallback((course: Course) => router.push(`/courses/${course.id}`), [router]);
  const openSubmission = useCallback(
    (assignment: Assignment, course: Course) =>
      router.push(`/courses/${course.id}/submit/${assignment.id}`),
    [router]
  );
  const openGenerator = useCallback(() => router.push('/generator'), [router]);
  const openSubmissions = useCallback(() => router.push('/submissions'), [router]);
  const openCourses = useCallback(() => router.push('/courses'), [router]);

  const value = useMemo(
    () => ({
      courses,
      submissions,
      setCourses,
      setSubmissions,
      refreshData,
      handleCreateCourse,
      handleUpdateCourse,
      handleDeleteCourse,
      handleCreateAssignment,
      handleSubmissionSuccess,
      handleUpdateSubmissionGrade,
      openCourse,
      openSubmission,
      openGenerator,
      openSubmissions,
      openCourses,
    }),
    [
      courses,
      submissions,
      refreshData,
      handleCreateCourse,
      handleUpdateCourse,
      handleDeleteCourse,
      handleCreateAssignment,
      handleSubmissionSuccess,
      handleUpdateSubmissionGrade,
      openCourse,
      openSubmission,
      openGenerator,
      openSubmissions,
      openCourses,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
