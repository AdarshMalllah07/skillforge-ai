'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/src/lib/appDataContext';
import { useAuth } from '@/src/lib/authContext';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

const SubmissionsDashboard = dynamic(() => import('@/src/components/SubmissionsDashboard'), {
  loading: () => <PageSkeleton />,
});

export default function SubmissionsPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { submissions, courses } = useAppData();

  return (
    <SubmissionsDashboard
      submissions={submissions}
      courses={courses}
      onReviewSubmission={(sub) => {
        if (currentUser?.role === 'EVALUATOR') {
          router.push('/evaluator');
          return;
        }
        const matchedCourse = courses.find((c) => c.id === sub.courseId);
        if (matchedCourse) {
          router.push(`/courses/${matchedCourse.id}`);
        }
      }}
    />
  );
}
