'use client';

import dynamic from 'next/dynamic';
import { useAppData } from '@/src/lib/appDataContext';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

const CourseCatalog = dynamic(() => import('@/src/components/CourseCatalog'), {
  loading: () => <PageSkeleton />,
});

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
