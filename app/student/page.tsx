'use client';

import StudentDashboard from '@/src/components/StudentDashboard';
import { useAppData } from '@/src/lib/appDataContext';

export default function StudentPage() {
  const { courses, submissions, openCourse, openSubmission } = useAppData();

  return (
    <StudentDashboard
      courses={courses}
      submissions={submissions}
      onSelectCourse={openCourse}
      onSubmitAssignment={openSubmission}
    />
  );
}
