'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/authContext';
import { AUTH_PATHS, ROLE_HOME, canAccessPath } from '@/src/lib/routes';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import AuthModal from '@/src/components/AuthModal';
import UserProfileModal from '@/src/components/UserProfileModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

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

    if (!canAccessPath(pathname, currentUser?.role, true)) {
      router.replace(ROLE_HOME[currentUser!.role]);
    }
  }, [isLoading, isAuthenticated, currentUser, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm font-medium">
        Loading SkillForge AI…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      <Navbar />
      <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">{children}</main>
      <AuthModal />
      <UserProfileModal />
      <Footer />
    </div>
  );
}
