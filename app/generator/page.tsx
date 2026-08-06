'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/src/lib/appDataContext';
import { api } from '@/src/lib/api';
import { Course } from '@/src/types';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

const AICurriculumGenerator = dynamic(() => import('@/src/components/AICurriculumGenerator'), {
  loading: () => <PageSkeleton />,
});

export default function GeneratorPage() {
  const router = useRouter();
  const { setCourses } = useAppData();

  return (
    <AICurriculumGenerator
      onCourseGeneratedAndSaved={async (newCourse) => {
        try {
          const saved = await api<Course>('/api/courses', {
            method: 'POST',
            body: JSON.stringify(newCourse),
          });
          setCourses((prev) => [saved, ...prev]);
          router.push(`/courses/${saved.id}`);
        } catch (err) {
          console.error(err);
          setCourses((prev) => [newCourse, ...prev]);
          router.push('/courses');
        }
      }}
      onCancel={() => router.push('/courses')}
    />
  );
}
