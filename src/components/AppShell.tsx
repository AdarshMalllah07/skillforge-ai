'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/authContext';
import {
  ROLE_HOME,
  canAccessPath,
  isAuthPath,
  isGuestAllowedPath,
  isPublicPath,
  legacyRedirectPath,
} from '@/src/lib/routes';
import { Sidebar } from '@/src/components/nav/Sidebar';
import { Topbar } from '@/src/components/nav/Topbar';
import Footer from '@/src/components/Footer';
import AuthModal from '@/src/components/AuthModal';
import UserProfileModal from '@/src/components/UserProfileModal';
import { PageSkeleton } from '@/src/components/ui/Skeleton';
import { NavigationProgress } from '@/src/components/NavigationProgress';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const authPage = isAuthPath(pathname);
  const publicPage = isPublicPath(pathname);
  const guestAllowed = isGuestAllowedPath(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (!guestAllowed) {
        router.replace('/login');
      }
      return;
    }

    if (authPage || pathname === '/') {
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
  }, [isLoading, isAuthenticated, currentUser?.role, pathname, router, guestAllowed, authPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sf-bg p-6">
        <PageSkeleton />
      </div>
    );
  }

  if (authPage || publicPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-sf-bg flex flex-col text-sf font-sans antialiased">
        <NavigationProgress />
        <main className="flex-1 w-full">{children}</main>
        <AuthModal />
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
    </div>
  );
}
