'use client';

import CourseCatalog from '@/src/components/CourseCatalog';
import { useAppData } from '@/src/lib/appDataContext';

export default function CoursesPage() {
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
