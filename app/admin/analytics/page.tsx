'use client';

import { useAppData } from '@/src/lib/appDataContext';
import AnalyticsDashboard from '@/src/components/AnalyticsDashboard';

export default function AdminAnalyticsPage() {
  const { submissions, courses } = useAppData();
  return <AnalyticsDashboard submissions={submissions} courses={courses} />;
}
