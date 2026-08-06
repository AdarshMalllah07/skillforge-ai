'use client';

import { useRouter } from 'next/navigation';
import { useAppData } from '@/src/lib/appDataContext';
import SubmissionsDashboard from '@/src/components/SubmissionsDashboard';

export default function EvaluatorSubmissionsPage() {
  const router = useRouter();
  const { submissions, courses } = useAppData();

  return (
    <SubmissionsDashboard
      submissions={submissions}
      courses={courses}
      onReviewSubmission={() => {
        router.push('/evaluator');
      }}
    />
  );
}
