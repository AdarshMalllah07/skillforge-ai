'use client';

import { useRouter } from 'next/navigation';
import { useAppData } from '@/src/lib/appDataContext';
import SubmissionsDashboard from '@/src/components/SubmissionsDashboard';

export default function StudentSubmissionsPage() {
  const router = useRouter();
  const { submissions, courses } = useAppData();

  return (
    <SubmissionsDashboard
      submissions={submissions}
      courses={courses}
      onReviewSubmission={(sub) => {
        const matchedCourse = courses.find((c) => c.id === sub.courseId);
        if (matchedCourse) {
          router.push(`/courses/${matchedCourse.id}`);
        }
      }}
    />
  );
}
