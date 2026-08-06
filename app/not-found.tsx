import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center shadow-sf-glow">
          <GraduationCap className="w-8 h-8 text-indigo-300" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sf-accent">404</p>
          <h1 className="text-3xl font-black text-sf tracking-tight">Page not found</h1>
          <p className="text-sm text-sf-muted leading-relaxed">
            This route does not exist in SkillForge AI. Head back to your dashboard or the course catalog.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold dark:bg-indigo-600"
          >
            Go home
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-sf bg-sf-surface text-sf text-sm font-bold"
          >
            Course catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
