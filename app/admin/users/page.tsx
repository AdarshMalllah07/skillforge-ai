'use client';

import { useRouter } from 'next/navigation';
import AdminUserManagement from '@/src/components/AdminUserManagement';

export default function AdminUsersPage() {
  const router = useRouter();

  return (
    <AdminUserManagement
      onViewUserCurriculums={() => router.push('/courses')}
      onViewUserSubmissions={() => router.push('/submissions')}
    />
  );
}
