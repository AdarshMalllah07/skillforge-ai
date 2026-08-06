'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/src/lib/authContext';
import { usePreferences } from '@/src/lib/preferencesContext';
import { TAB_PATH, pathToTab, AppTab } from '@/src/lib/routes';
import { Badge, roleBadgeTone } from '@/src/components/ui/Badge';
import { activeNavClass, getNavItems } from './navItems';
import { ThemePreference } from '@/src/types';

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, isAuthenticated, openProfileModal, logout } = useAuth();
  const { preferences, setTheme } = usePreferences();
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = pathToTab(pathname);
  const items = getNavItems(currentUser?.role);

  const navigate = (tab: AppTab) => {
    router.push(TAB_PATH[tab]);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[9999] flex justify-end lg:hidden">
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-sm h-screen bg-sf-surface shadow-sf-lg flex flex-col border-l border-sf"
          >
            <div className="p-4 border-b border-sf flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="" className="w-10 h-10 rounded-xl" />
                <div>
                  <h2 className="text-base font-black leading-none">SkillForge AI</h2>
                  <p className="text-[11px] text-indigo-300 font-semibold mt-0.5">Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 min-h-11 min-w-11 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {isAuthenticated && currentUser ? (
                <div className="bg-sf-surface-2 p-4 rounded-2xl border border-sf flex items-center gap-3">
                  <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-sf truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-sf-muted truncate">{currentUser.email}</p>
                    <div className="mt-1">
                      <Badge tone={roleBadgeTone(currentUser.role)}>{currentUser.role}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-sf-surface-2 p-4 rounded-2xl border border-sf text-xs text-sf-muted">
                  Sign in to access your role-based dashboard.
                </div>
              )}

              {isAuthenticated ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-sf-muted uppercase tracking-widest px-1">Modules</p>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        type="button"
                        onClick={() => navigate(item.tab)}
                        className={`w-full text-left p-3 rounded-2xl border border-sf transition-all flex items-center gap-3 min-h-12 ${activeNavClass(
                          active,
                          item.tab === 'generator' && active
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent'
                            : active
                              ? 'bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600'
                              : 'bg-sf-surface'
                        )}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-[10px] font-black text-sf-muted uppercase tracking-widest px-1">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as ThemePreference[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`min-h-11 rounded-xl text-xs font-bold capitalize border border-sf ${
                        preferences.theme === t
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-sf-surface text-sf-muted'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-sf bg-sf-surface-2 shrink-0 space-y-2">
              {isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openProfileModal();
                    }}
                    className="min-h-11 p-2.5 bg-sf-surface border border-sf text-sf rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      logout();
                      navigate('login');
                    }}
                    className="min-h-11 p-2.5 bg-red-50 border border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('login')}
                    className="min-h-11 p-2.5 bg-sf-surface border border-sf rounded-xl text-xs font-bold"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('signup')}
                    className="min-h-11 p-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
