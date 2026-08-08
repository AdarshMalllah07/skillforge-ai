'use client';

import { useRouter } from 'next/navigation';
import { useAppData } from '@/src/lib/appDataContext';
import SubmissionsDashboard from '@/src/components/SubmissionsDashboard';

export default function StudentSubmissionsPage() {
  const router = useRouter();
  const { submissions, enrolledCourses } = useAppData();

  return (
    <SubmissionsDashboard
      submissions={submissions}
      courses={enrolledCourses}
      onReviewSubmission={(sub) => {
        const matchedCourse = enrolledCourses.find((c) => c.id === sub.courseId);
        if (matchedCourse) {
          router.push(`/courses/${matchedCourse.id}`);
        }
      }}
    />
  );
}
