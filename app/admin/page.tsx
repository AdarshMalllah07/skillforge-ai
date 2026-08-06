'use client';

import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

const AdminOverview = dynamic(() => import('@/src/components/AdminOverview'), {
  loading: () => <PageSkeleton />,
});

export default function AdminPage() {
  return <AdminOverview />;
}
