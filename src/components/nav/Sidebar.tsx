'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/src/lib/authContext';
import { usePreferences } from '@/src/lib/preferencesContext';
import { TAB_PATH, pathToTab } from '@/src/lib/routes';
import { activeNavClass, getNavItems } from './navItems';

export function Sidebar() {
  const { currentUser, isAuthenticated } = useAuth();
  const { preferences } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = preferences.sidebarCollapsed;
  const activeTab = pathToTab(pathname);
  const items = getNavItems(currentUser?.role);

  if (!isAuthenticated) return null;

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 border-r border-sf bg-sf-surface sticky top-0 h-screen transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className={`h-16 flex items-center border-b border-sf ${collapsed ? 'justify-center px-2' : 'px-4 gap-2.5'}`}>
        <button
          type="button"
          onClick={() => router.push(TAB_PATH.courses)}
          className="flex items-center gap-2.5 group min-w-0"
        >
          <img
            src="/logo.svg"
            alt="SkillForge AI"
            className="w-9 h-9 rounded-xl shadow-sf-sm group-hover:scale-105 transition-transform shrink-0"
          />
          {!collapsed ? (
            <div className="min-w-0 text-left">
              <p className="text-sm font-extrabold tracking-tight text-sf truncate">SkillForge AI</p>
              <p className="text-[10px] text-sf-muted font-medium truncate">AI Assessment</p>
            </div>
          ) : null}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              title={item.label}
              onClick={() => router.push(TAB_PATH[item.tab])}
              className={`w-full flex items-center gap-3 rounded-xl text-xs font-bold transition-all min-h-11 ${
                collapsed ? 'justify-center px-2' : 'px-3'
              } ${activeNavClass(
                active,
                item.tab === 'generator' && active
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sf-sm'
                  : undefined
              )}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${item.tab === 'generator' && !active ? 'text-amber-500' : ''}`}
              />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </button>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="p-3 border-t border-sf">
          <div className="px-3 py-2 rounded-xl bg-sf-surface-2 text-[10px] text-sf-muted flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5" />
            SkillForge AI
          </div>
        </div>
      ) : null}
    </aside>
  );
}
