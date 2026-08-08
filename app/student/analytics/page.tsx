'use client';

import { useAppData } from '@/src/lib/appDataContext';
import AnalyticsDashboard from '@/src/components/AnalyticsDashboard';

export default function StudentAnalyticsPage() {
  const { submissions, enrolledCourses } = useAppData();
  return <AnalyticsDashboard submissions={submissions} courses={enrolledCourses} />;
}
