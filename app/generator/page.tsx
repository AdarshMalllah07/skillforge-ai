'use client';

import { useRouter } from 'next/navigation';
import AICurriculumGenerator from '@/src/components/AICurriculumGenerator';
import { useAppData } from '@/src/lib/appDataContext';
import { api } from '@/src/lib/api';
import { Course } from '@/src/types';

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
