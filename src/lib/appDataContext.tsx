'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { useAuth } from './authContext';
import { getUi } from '../components/ui/UiProvider';
import { Course, Submission, Assignment, Enrollment } from '../types';
import { TAB_PATH, ROLE_HOME } from './routes';
import { getNavItems } from '../components/nav/navItems';
import { canEnrollInCourses } from './permissions';

interface AppDataContextType {
  courses: Course[];
  submissions: Submission[];
  enrollments: Enrollment[];
  enrolledCourseIds: string[];
  enrolledCourses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  refreshData: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<boolean>;
  isEnrolledIn: (courseId: string) => boolean;
  handleCreateCourse: (courseData: Partial<Course>) => Promise<void>;
  handleUpdateCourse: (id: string, updatedFields: Partial<Course>) => Promise<void>;
  handleDeleteCourse: (id: string) => Promise<void>;
  handleCreateAssignment: (courseId: string, assignmentData: Partial<Assignment>) => Promise<void>;
  handleUpdateAssignment: (
    courseId: string,
    assignmentId: string,
    assignmentData: Partial<Assignment>
  ) => Promise<void>;
  handleDeleteAssignment: (courseId: string, assignmentId: string) => Promise<void>;
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
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setCourses([]);
      setSubmissions([]);
      setEnrollments([]);
      return;
    }

    try {
      const requests: Promise<unknown>[] = [
        api<Course[]>('/api/courses'),
        api<Submission[]>('/api/submissions'),
      ];
      const loadEnrollments = canEnrollInCourses(currentUser?.role);
      if (loadEnrollments) {
        requests.push(api<Enrollment[]>('/api/enrollments/me'));
      }

      const [courseData, submissionData, enrollmentData] = await Promise.all(requests);
      if (Array.isArray(courseData)) setCourses(courseData);
      if (Array.isArray(submissionData)) setSubmissions(submissionData);
      if (loadEnrollments && Array.isArray(enrollmentData)) {
        setEnrollments(enrollmentData);
      } else {
        setEnrollments([]);
      }
    } catch (e) {
      console.log('Failed to load app data', e);
    }
  }, [isAuthenticated, currentUser?.role]);

  useEffect(() => {
    refreshData();
  }, [refreshData, currentUser?.id]);

  // Warm route chunks so sidebar clicks feel instant
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const paths = new Set([
      ...getNavItems(currentUser.role).map((item) => TAB_PATH[item.tab]),
      '/courses',
      ROLE_HOME[currentUser.role],
    ]);
    // Stagger slightly so first paint isn't blocked
    let i = 0;
    const ids: ReturnType<typeof setTimeout>[] = [];
    paths.forEach((path) => {
      ids.push(
        setTimeout(() => {
          try {
            router.prefetch(path);
          } catch {
            // ignore
          }
        }, i * 40)
      );
      i += 1;
    });
    return () => ids.forEach(clearTimeout);
  }, [isAuthenticated, currentUser?.role, router]);

  const enrolledCourseIds = useMemo(
    () => enrollments.map((e) => e.courseId),
    [enrollments]
  );

  const enrolledCourses = useMemo(
    () => courses.filter((c) => enrolledCourseIds.includes(c.id)),
    [courses, enrolledCourseIds]
  );

  const isEnrolledIn = useCallback(
    (courseId: string) => enrolledCourseIds.includes(courseId),
    [enrolledCourseIds]
  );

  const enrollInCourse = useCallback(
    async (courseId: string) => {
      try {
        const result = await api<{
          message: string;
          enrollment?: Enrollment;
        }>(`/api/courses/${courseId}/enroll`, { method: 'POST' });

        const alreadyTracked = enrollments.some((e) => e.courseId === courseId);
        const isNewEnrollment =
          result.message === 'Enrolled successfully' && Boolean(result.enrollment);

        if (result.enrollment) {
          setEnrollments((prev) => {
            if (prev.some((e) => e.courseId === courseId)) return prev;
            return [result.enrollment!, ...prev];
          });
        } else if (!alreadyTracked) {
          setEnrollments((prev) => [
            {
              id: `local_${courseId}`,
              courseId,
              studentId: currentUser?.id || '',
              enrolledAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }

        if (isNewEnrollment && !alreadyTracked) {
          setCourses((prev) =>
            prev.map((c) =>
              c.id === courseId
                ? { ...c, enrolledStudentsCount: (c.enrolledStudentsCount || 0) + 1 }
                : c
            )
          );
        }

        getUi().toast({
          message: result.message || 'Enrolled successfully',
          variant: 'success',
        });
        return true;
      } catch (err) {
        getUi().toast({
          message: err instanceof Error ? err.message : 'Enrollment failed',
          variant: 'error',
        });
        return false;
      }
    },
    [currentUser?.id, enrollments]
  );

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
        getUi().toast({
          message: err instanceof Error ? err.message : 'Failed to create assignment',
          variant: 'error',
        });
      }
    },
    []
  );

  const handleUpdateAssignment = useCallback(
    async (courseId: string, assignmentId: string, assignmentData: Partial<Assignment>) => {
      try {
        const updated = await api<Assignment>(
          `/api/courses/${courseId}/assignments/${assignmentId}`,
          {
            method: 'PUT',
            body: JSON.stringify(assignmentData),
          }
        );
        setCourses((prev) =>
          prev.map((c) => {
            if (c.id !== courseId) return c;
            return {
              ...c,
              assignments: c.assignments.map((a) => (a.id === assignmentId ? { ...a, ...updated } : a)),
            };
          })
        );
      } catch (err) {
        console.error('Update assignment error', err);
        getUi().toast({
          message: err instanceof Error ? err.message : 'Failed to update assignment',
          variant: 'error',
        });
      }
    },
    []
  );

  const handleDeleteAssignment = useCallback(async (courseId: string, assignmentId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return { ...c, assignments: c.assignments.filter((a) => a.id !== assignmentId) };
      })
    );
    try {
      await api(`/api/courses/${courseId}/assignments/${assignmentId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete assignment error', err);
      getUi().toast({
        message: err instanceof Error ? err.message : 'Failed to delete assignment',
        variant: 'error',
      });
    }
  }, []);

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
  const openSubmissions = useCallback(() => {
    const role = currentUser?.role;
    if (role === 'ADMIN') router.push('/admin/submissions');
    else if (role === 'INSTRUCTOR') router.push('/instructor/submissions');
    else if (role === 'EVALUATOR') router.push('/evaluator/submissions');
    else if (role === 'STUDENT') router.push('/student/submissions');
    else router.push('/submissions');
  }, [router, currentUser?.role]);
  const openCourses = useCallback(() => {
    if (currentUser?.role === 'ADMIN') router.push('/admin/courses');
    else router.push('/courses');
  }, [router, currentUser?.role]);

  const value = useMemo(
    () => ({
      courses,
      submissions,
      enrollments,
      enrolledCourseIds,
      enrolledCourses,
      setCourses,
      setSubmissions,
      refreshData,
      enrollInCourse,
      isEnrolledIn,
      handleCreateCourse,
      handleUpdateCourse,
      handleDeleteCourse,
      handleCreateAssignment,
      handleUpdateAssignment,
      handleDeleteAssignment,
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
      enrollments,
      enrolledCourseIds,
      enrolledCourses,
      refreshData,
      enrollInCourse,
      isEnrolledIn,
      handleCreateCourse,
      handleUpdateCourse,
      handleDeleteCourse,
      handleCreateAssignment,
      handleUpdateAssignment,
      handleDeleteAssignment,
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
