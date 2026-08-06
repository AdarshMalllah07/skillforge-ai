'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/authContext';
import { AUTH_PATHS, ROLE_HOME, canAccessPath, legacyRedirectPath } from '@/src/lib/routes';
import { Sidebar } from '@/src/components/nav/Sidebar';
import { Topbar } from '@/src/components/nav/Topbar';
import Footer from '@/src/components/Footer';
import AuthModal from '@/src/components/AuthModal';
import UserProfileModal from '@/src/components/UserProfileModal';
import { PageSkeleton } from '@/src/components/ui/Skeleton';
import { NavigationProgress } from '@/src/components/NavigationProgress';
import { ServiceWorkerRegister } from '@/src/components/ServiceWorkerRegister';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (!isAuthPage) {
        router.replace('/login');
      }
      return;
    }

    if (isAuthPage || pathname === '/') {
      router.replace(ROLE_HOME[currentUser!.role]);
      return;
    }

    const legacy = legacyRedirectPath(pathname, currentUser!.role);
    if (legacy) {
      router.replace(legacy);
      return;
    }

    if (!canAccessPath(pathname, currentUser?.role, true)) {
      router.replace(ROLE_HOME[currentUser!.role]);
    }
  }, [isLoading, isAuthenticated, currentUser?.role, pathname, router, isAuthPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sf-bg p-6">
        <PageSkeleton />
        <ServiceWorkerRegister />
      </div>
    );
  }

  if (isAuthPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-sf-bg flex flex-col text-sf font-sans antialiased">
        <NavigationProgress />
        <main className="flex-1 w-full">{children}</main>
        <AuthModal />
        <ServiceWorkerRegister />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sf-bg flex text-sf font-sans antialiased">
      <NavigationProgress />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 max-w-7xl">{children}</main>
        <AuthModal />
        <UserProfileModal />
        <Footer />
      </div>
      <ServiceWorkerRegister />
    </div>
  );
}
