'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Moon, Sun, Monitor, User, Check } from 'lucide-react';
import { useAuth } from '@/src/lib/authContext';
import { usePreferences } from '@/src/lib/preferencesContext';
import { ThemePreference } from '@/src/types';
import { Badge, roleBadgeTone } from './Badge';

export function AvatarDropdown() {
  const { currentUser, openProfileModal, logout, isAuthenticated } = useAuth();
  const { preferences, setTheme, resolvedTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      const menu = document.getElementById('sf-avatar-menu');
      if (menu?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!isAuthenticated || !currentUser) return null;

  const themes: { id: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded-xl hover:bg-sf-surface-2 transition-colors min-h-11 min-w-11 flex items-center justify-center"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Account menu"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
        />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id="sf-avatar-menu"
            role="menu"
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-[10000] w-72 rounded-2xl border border-sf bg-sf-surface shadow-sf-lg overflow-hidden"
          >
            <div className="p-4 border-b border-sf flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="min-w-0">
                <p className="text-sm font-black text-sf truncate">{currentUser.name}</p>
                <p className="text-[11px] text-sf-muted truncate">{currentUser.email}</p>
                <div className="mt-1">
                  <Badge tone={roleBadgeTone(currentUser.role)}>{currentUser.role}</Badge>
                </div>
              </div>
            </div>

            <div className="p-2 border-b border-sf">
              <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-sf-muted">
                Theme · {resolvedTheme}
              </p>
              <div className="grid grid-cols-3 gap-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-bold transition-colors min-h-11 ${
                      preferences.theme === t.id
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'text-sf-muted hover:bg-sf-surface-2 hover:text-sf'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                    {preferences.theme === t.id ? <Check className="w-3 h-3" /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2 space-y-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  openProfileModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-sf hover:bg-sf-surface-2 min-h-11"
              >
                <User className="w-4 h-4 text-indigo-500" />
                Profile settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 min-h-11"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
