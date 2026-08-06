'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/src/lib/appDataContext';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

const SubmissionsDashboard = dynamic(() => import('@/src/components/SubmissionsDashboard'), {
  loading: () => <PageSkeleton />,
});

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
