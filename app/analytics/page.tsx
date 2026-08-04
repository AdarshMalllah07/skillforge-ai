'use client';

import { useRouter } from 'next/navigation';
import AnalyticsDashboard from '@/src/components/AnalyticsDashboard';
import { useAppData } from '@/src/lib/appDataContext';

export default function AnalyticsPage() {
  const router = useRouter();
  const { submissions, courses } = useAppData();

  return (
    <AnalyticsDashboard
      submissions={submissions}
      courses={courses}
      onReviewSubmission={(sub) => {
        const matchedCourse = courses.find((c) => c.id === sub.courseId) || courses[0];
        if (!matchedCourse) return;
        const matchedAssign =
          matchedCourse.assignments.find((a) => a.id === sub.assignmentId) ||
          matchedCourse.assignments[0];
        if (matchedAssign) {
          router.push(`/courses/${matchedCourse.id}/submit/${matchedAssign.id}`);
        }
      }}
    />
  );
}
