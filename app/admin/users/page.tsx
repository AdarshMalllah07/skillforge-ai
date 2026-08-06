'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

const AdminUserManagement = dynamic(() => import('@/src/components/AdminUserManagement'), {
  loading: () => <PageSkeleton />,
});

export default function AdminUsersPage() {
  const router = useRouter();

  return (
    <AdminUserManagement
      onViewUserCurriculums={() => router.push('/admin/courses')}
      onViewUserSubmissions={() => router.push('/admin/submissions')}
    />
  );
}
