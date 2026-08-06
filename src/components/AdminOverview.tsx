'use client';

import Link from 'next/link';
import {
  Users,
  BookOpen,
  FileCheck2,
  BarChart3,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/src/lib/authContext';
import { useAppData } from '@/src/lib/appDataContext';
import { PageHero } from '@/src/components/ui/PageHero';
import { StatCard } from '@/src/components/ui/Card';

const shortcuts = [
  { href: '/admin/users', label: 'Users & Roles', icon: Users, desc: 'Create accounts and assign roles' },
  { href: '/admin/courses', label: 'All Courses', icon: BookOpen, desc: 'Create, edit, publish any course' },
  { href: '/admin/submissions', label: 'All Submissions', icon: FileCheck2, desc: 'Grade or audit any submission' },
  { href: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3, desc: 'Users, courses, grading health' },
  { href: '/generator', label: 'AI Architect', icon: Sparkles, desc: 'Generate curriculum with Gemini' },
  { href: '/student', label: 'Student Portal', icon: GraduationCap, desc: 'Preview the learner experience' },
  { href: '/instructor', label: 'Faculty Console', icon: BookOpen, desc: 'Preview instructor workflows' },
  { href: '/evaluator', label: 'Assessor Console', icon: ShieldCheck, desc: 'Preview evaluator workflows' },
];

export default function AdminOverview() {
  const { currentUser } = useAuth();
  const { courses, submissions } = useAppData();

  if (!currentUser) return null;

  const pendingGrades = submissions.filter(
    (s) => s.status === 'PENDING' || s.status === 'AI_EVALUATED'
  ).length;
  const published = courses.filter((c) => c.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      <PageHero
        tone="slate"
        eyebrow={
          <>
            <LayoutDashboard className="w-3.5 h-3.5" />
            Platform Administration
          </>
        }
        title={`Admin Overview · ${currentUser.name}`}
        description="Full access to users, courses, submissions, analytics, and every role portal."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Courses" value={courses.length} accent="indigo" icon={<BookOpen className="w-5 h-5" />} />
        <StatCard label="Published" value={published} accent="emerald" icon={<BookOpen className="w-5 h-5" />} />
        <StatCard
          label="Submissions"
          value={submissions.length}
          accent="amber"
          icon={<FileCheck2 className="w-5 h-5" />}
        />
        <StatCard
          label="Pending grades"
          value={pendingGrades}
          accent="amber"
          icon={<FileCheck2 className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-sf-surface border border-sf rounded-2xl p-4 shadow-sf-sm hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-sf-surface-2 flex items-center justify-center text-sf-muted group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-sf-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="mt-3 text-sm font-bold text-sf">{item.label}</p>
              <p className="text-[11px] text-sf-muted mt-1 leading-relaxed">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
