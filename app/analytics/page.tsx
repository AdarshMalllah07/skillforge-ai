'use client';

import AnalyticsDashboard from '@/src/components/AnalyticsDashboard';
import { useAppData } from '@/src/lib/appDataContext';

export default function AnalyticsPage() {
  const { submissions, courses } = useAppData();

  return <AnalyticsDashboard submissions={submissions} courses={courses} />;
}
