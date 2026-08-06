'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './authContext';
import {
  DEFAULT_USER_PREFERENCES,
  ThemePreference,
  UserPreferences,
} from '../types';

type PreferencesContextValue = {
  preferences: UserPreferences;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function resolveTheme(theme: ThemePreference): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyDomTheme(theme: ThemePreference) {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  try {
    localStorage.setItem('sf-theme', theme);
  } catch {
    // ignore
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated, updateUserProfile } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedFromUser = useRef<string | null>(null);

  const persist = useCallback(
    (next: UserPreferences) => {
      if (!isAuthenticated) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateUserProfile({ preferences: next }).catch(() => {
          // keep optimistic UI
        });
      }, 350);
    },
    [isAuthenticated, updateUserProfile]
  );

  useEffect(() => {
    if (currentUser?.preferences) {
      const next = {
        theme: currentUser.preferences.theme || 'system',
        sidebarCollapsed: Boolean(currentUser.preferences.sidebarCollapsed),
      } satisfies UserPreferences;
      setPreferences(next);
      applyDomTheme(next.theme);
      setResolvedTheme(resolveTheme(next.theme));
      hydratedFromUser.current = currentUser.id;
      return;
    }

    if (!isAuthenticated) {
      let stored: ThemePreference = 'system';
      try {
        const raw = localStorage.getItem('sf-theme');
        if (raw === 'light' || raw === 'dark' || raw === 'system') stored = raw;
      } catch {
        // ignore
      }
      const next = { ...DEFAULT_USER_PREFERENCES, theme: stored };
      setPreferences(next);
      applyDomTheme(next.theme);
      setResolvedTheme(resolveTheme(next.theme));
      hydratedFromUser.current = null;
    }
  }, [currentUser?.id, currentUser?.preferences, isAuthenticated]);

  useEffect(() => {
    if (preferences.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyDomTheme('system');
      setResolvedTheme(resolveTheme('system'));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preferences.theme]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      setPreferences((prev) => {
        const next = { ...prev, theme };
        applyDomTheme(theme);
        setResolvedTheme(resolveTheme(theme));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setSidebarCollapsed = useCallback(
    (sidebarCollapsed: boolean) => {
      setPreferences((prev) => {
        const next = { ...prev, sidebarCollapsed };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleSidebarCollapsed = useCallback(() => {
    setPreferences((prev) => {
      const next = { ...prev, sidebarCollapsed: !prev.sidebarCollapsed };
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo(
    () => ({
      preferences,
      resolvedTheme,
      setTheme,
      setSidebarCollapsed,
      toggleSidebarCollapsed,
    }),
    [preferences, resolvedTheme, setTheme, setSidebarCollapsed, toggleSidebarCollapsed]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
