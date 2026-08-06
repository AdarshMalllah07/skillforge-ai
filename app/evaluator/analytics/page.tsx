'use client';

import dynamic from 'next/dynamic';
import { useAppData } from '@/src/lib/appDataContext';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

const AnalyticsDashboard = dynamic(() => import('@/src/components/AnalyticsDashboard'), {
  loading: () => <PageSkeleton />,
});

export default function EvaluatorAnalyticsPage() {
  const { submissions, courses } = useAppData();
  return <AnalyticsDashboard submissions={submissions} courses={courses} />;
}
