'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/src/lib/authContext';
import { AppDataProvider } from '@/src/lib/appDataContext';
import { UiProvider } from '@/src/components/ui/UiProvider';
import { PreferencesProvider } from '@/src/lib/preferencesContext';
import AppShell from '@/src/components/AppShell';
import { ServiceWorkerRegister } from '@/src/components/ServiceWorkerRegister';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <UiProvider>
          <AppDataProvider>
            <ServiceWorkerRegister />
            <AppShell>{children}</AppShell>
          </AppDataProvider>
        </UiProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
