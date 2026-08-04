'use client';

import InstructorDashboard from '@/src/components/InstructorDashboard';
import { useAppData } from '@/src/lib/appDataContext';

export default function InstructorPage() {
  const { courses, submissions, openCourse, openGenerator, openSubmissions } = useAppData();

  return (
    <InstructorDashboard
      courses={courses}
      submissions={submissions}
      onSelectCourse={openCourse}
      onOpenAIGenerator={openGenerator}
      onOpenSubmissions={openSubmissions}
    />
  );
}
