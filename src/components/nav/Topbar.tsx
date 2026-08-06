'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/src/lib/authContext';
import { usePreferences } from '@/src/lib/preferencesContext';
import { TAB_PATH, pathToTab, ROLE_HOME } from '@/src/lib/routes';
import { AvatarDropdown } from '@/src/components/ui/AvatarDropdown';
import { Breadcrumbs, Crumb } from '@/src/components/ui/Breadcrumbs';
import { MobileDrawer } from './MobileDrawer';

function crumbsForPath(pathname: string): Crumb[] {
  if (pathname.startsWith('/courses/') && pathname.includes('/submit/')) {
    return [
      { label: 'Catalog', href: '/courses' },
      { label: 'Course', href: pathname.split('/submit/')[0] },
      { label: 'Submit' },
    ];
  }
  if (pathname.startsWith('/courses/') && pathname !== '/courses') {
    return [{ label: 'Catalog', href: '/courses' }, { label: 'Course detail' }];
  }
  if (pathname === '/admin' || pathname === '/admin/') {
    return [{ label: 'Admin' }, { label: 'Overview' }];
  }
  if (pathname.startsWith('/admin/users')) return [{ label: 'Admin', href: '/admin' }, { label: 'Users & Roles' }];
  if (pathname.startsWith('/admin/courses')) return [{ label: 'Admin', href: '/admin' }, { label: 'Courses' }];
  if (pathname.startsWith('/admin/submissions')) return [{ label: 'Admin', href: '/admin' }, { label: 'Submissions' }];
  if (pathname.startsWith('/admin/analytics')) return [{ label: 'Admin', href: '/admin' }, { label: 'Analytics' }];
  if (pathname.startsWith('/admin')) return [{ label: 'Admin' }];
  if (pathname.startsWith('/student/submissions')) return [{ label: 'Student Portal', href: '/student' }, { label: 'My Submissions' }];
  if (pathname.startsWith('/student/analytics')) return [{ label: 'Student Portal', href: '/student' }, { label: 'My Progress' }];
  if (pathname.startsWith('/student')) return [{ label: 'Student Portal' }];
  if (pathname.startsWith('/instructor/submissions')) return [{ label: 'Faculty Console', href: '/instructor' }, { label: 'Grading' }];
  if (pathname.startsWith('/instructor/analytics')) return [{ label: 'Faculty Console', href: '/instructor' }, { label: 'Analytics' }];
  if (pathname.startsWith('/instructor')) return [{ label: 'Faculty Console' }];
  if (pathname.startsWith('/evaluator/submissions')) return [{ label: 'Assessor Console', href: '/evaluator' }, { label: 'Review Queue' }];
  if (pathname.startsWith('/evaluator/analytics')) return [{ label: 'Assessor Console', href: '/evaluator' }, { label: 'Analytics' }];
  if (pathname.startsWith('/evaluator')) return [{ label: 'Assessor Console' }];
  if (pathname.startsWith('/generator')) return [{ label: 'AI Architect' }];
  if (pathname.startsWith('/analytics')) return [{ label: 'Analytics' }];
  if (pathname.startsWith('/submissions')) return [{ label: 'Submissions' }];
  if (pathname.startsWith('/courses')) return [{ label: 'Course Catalog' }];
  return [];
}

export function Topbar() {
  const { isAuthenticated, currentUser } = useAuth();
  const { preferences, toggleSidebarCollapsed } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const crumbs = crumbsForPath(pathname);
  const tab = pathToTab(pathname);
  const collapsed = preferences.sidebarCollapsed;
  const homeHref =
    isAuthenticated && currentUser ? ROLE_HOME[currentUser.role] : TAB_PATH.login;

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-sf bg-sf-surface/90 backdrop-blur-md shadow-sf-xs">
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 shadow-sf-sm"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="hidden lg:inline-flex items-center justify-center h-9 w-9 rounded-lg border border-sf bg-sf-surface text-sf-muted hover:text-sf hover:bg-sf-surface-2 shadow-sf-xs transition-colors shrink-0"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.75} />
                ) : (
                  <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.75} />
                )}
              </button>
            ) : null}

            <Link
              href={homeHref}
              prefetch
              className="lg:hidden flex items-center gap-2 shrink-0"
            >
              <img src="/logo.svg" alt="" className="w-8 h-8 rounded-lg" />
              <span className="text-sm font-extrabold text-sf hidden sm:inline">SkillForge AI</span>
            </Link>

            <div className="hidden sm:block min-w-0">
              <Breadcrumbs
                items={crumbs.length ? crumbs : tab ? [{ label: String(tab).replace(/_/g, ' ') }] : []}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <AvatarDropdown />
            ) : (
              <button
                type="button"
                onClick={() => router.push(TAB_PATH.login)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-sf hover:bg-sf-surface-2 min-h-11"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
