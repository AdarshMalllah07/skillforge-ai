'use client';

import { useAppData } from '@/src/lib/appDataContext';
import CourseCatalog from '@/src/components/CourseCatalog';

export default function AdminCoursesPage() {
  const {
    courses,
    openCourse,
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    openGenerator,
  } = useAppData();

  return (
    <CourseCatalog
      courses={courses}
      onSelectCourse={openCourse}
      onCreateCourse={handleCreateCourse}
      onUpdateCourse={handleUpdateCourse}
      onDeleteCourse={handleDeleteCourse}
      onOpenAIGenerator={openGenerator}
    />
  );
}
