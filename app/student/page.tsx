'use client';

import StudentDashboard from '@/src/components/StudentDashboard';
import { useAppData } from '@/src/lib/appDataContext';

export default function StudentPage() {
  const { enrolledCourses, submissions, openCourse, openSubmission } = useAppData();

  return (
    <StudentDashboard
      courses={enrolledCourses}
      submissions={submissions}
      onSelectCourse={openCourse}
      onSubmitAssignment={openSubmission}
    />
  );
}
