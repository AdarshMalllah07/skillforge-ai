import type { Metadata } from 'next';
import { AuthProvider } from '@/src/lib/authContext';
import { AppDataProvider } from '@/src/lib/appDataContext';
import { UiProvider } from '@/src/components/ui/UiProvider';
import AppShell from '@/src/components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillForge AI',
  description: 'AI Assessment Platform for House of EdTech',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <AuthProvider>
          <UiProvider>
            <AppDataProvider>
              <AppShell>{children}</AppShell>
            </AppDataProvider>
          </UiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
