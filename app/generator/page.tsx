'use client';

import { useRouter } from 'next/navigation';
import { useAppData } from '@/src/lib/appDataContext';
import { api } from '@/src/lib/api';
import { Course } from '@/src/types';
import AICurriculumGenerator from '@/src/components/AICurriculumGenerator';

export default function GeneratorPage() {
  const router = useRouter();
  const { setCourses } = useAppData();

  return (
    <AICurriculumGenerator
      onCourseGeneratedAndSaved={async (newCourse) => {
        try {
          const {
            title,
            description,
            category,
            level,
            thumbnail,
            status,
            modules,
            assignments,
          } = newCourse;

          const saved = await api<Course>('/api/courses', {
            method: 'POST',
            body: JSON.stringify({
              title,
              description,
              category,
              level,
              thumbnail,
              status,
              modules,
              assignments,
            }),
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
