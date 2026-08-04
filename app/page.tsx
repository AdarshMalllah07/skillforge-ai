'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/authContext';
import { ROLE_HOME } from '@/src/lib/routes';

export default function HomePage() {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && currentUser) {
      router.replace(ROLE_HOME[currentUser.role]);
    } else {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, currentUser, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm font-medium">
      Loading SkillForge AI…
    </div>
  );
}
