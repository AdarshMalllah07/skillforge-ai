'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/authContext';
import { ROLE_HOME } from '@/src/lib/routes';
import LandingPage from '@/src/components/LandingPage';
import { PageSkeleton } from '@/src/components/ui/Skeleton';

export default function HomePage() {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && currentUser) {
      router.replace(ROLE_HOME[currentUser.role]);
    }
  }, [isLoading, isAuthenticated, currentUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sf-bg p-6">
        <PageSkeleton />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sf-muted text-sm font-medium">
        Taking you to your dashboard…
      </div>
    );
  }

  return <LandingPage />;
}
