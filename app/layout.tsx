import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AuthProvider } from '@/src/lib/authContext';
import { AppDataProvider } from '@/src/lib/appDataContext';
import { UiProvider } from '@/src/components/ui/UiProvider';
import { PreferencesProvider } from '@/src/lib/preferencesContext';
import AppShell from '@/src/components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SkillForge AI',
    template: '%s · SkillForge AI',
  },
  description: 'AI Assessment Platform by SkillForge AI',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-sf-bg text-sf antialiased font-sans" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sf-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&d))document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <AuthProvider>
          <PreferencesProvider>
            <UiProvider>
              <AppDataProvider>
                <AppShell>{children}</AppShell>
              </AppDataProvider>
            </UiProvider>
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
