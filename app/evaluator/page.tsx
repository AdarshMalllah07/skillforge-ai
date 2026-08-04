'use client';

import EvaluatorDashboard from '@/src/components/EvaluatorDashboard';
import { useAppData } from '@/src/lib/appDataContext';

export default function EvaluatorPage() {
  const { submissions, handleUpdateSubmissionGrade } = useAppData();

  return (
    <EvaluatorDashboard
      submissions={submissions}
      onUpdateSubmissionGrade={handleUpdateSubmissionGrade}
    />
  );
}
