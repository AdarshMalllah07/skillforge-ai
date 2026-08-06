'use client';

import {
  BookOpen,
  FileCheck2,
  Sparkles,
  BarChart3,
  GraduationCap,
  Users,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { UserRole } from '@/src/types';
import { AppTab } from '@/src/lib/routes';

export type NavItem = {
  tab: AppTab;
  label: string;
  icon: LucideIcon;
  section?: 'role' | 'main';
};

export function getNavItems(role?: UserRole): NavItem[] {
  const items: NavItem[] = [];

  if (role === 'STUDENT') {
    items.push({ tab: 'student_dashboard', label: 'Student Portal', icon: GraduationCap, section: 'role' });
  }
  if (role === 'INSTRUCTOR') {
    items.push({ tab: 'instructor_dashboard', label: 'Faculty Console', icon: BookOpen, section: 'role' });
  }
  if (role === 'EVALUATOR') {
    items.push({ tab: 'evaluator_dashboard', label: 'Assessor Console', icon: ShieldCheck, section: 'role' });
  }
  if (role === 'ADMIN') {
    items.push({ tab: 'admin_users', label: 'Users & Roles', icon: Users, section: 'role' });
  }

  if (role) {
    items.push(
      { tab: 'courses', label: 'Course Catalog', icon: BookOpen, section: 'main' },
      { tab: 'submissions', label: 'Submissions', icon: FileCheck2, section: 'main' },
      { tab: 'analytics', label: 'Analytics', icon: BarChart3, section: 'main' }
    );
  }

  if (role === 'ADMIN' || role === 'INSTRUCTOR' || role === 'EVALUATOR') {
    items.push({ tab: 'generator', label: 'AI Architect', icon: Sparkles, section: 'main' });
  }

  return items;
}

export function activeNavClass(active: boolean, accent?: string) {
  if (active) {
    return accent || 'bg-slate-900 text-white dark:bg-indigo-600 shadow-sf-sm';
  }
  return 'text-sf-muted hover:text-sf hover:bg-sf-surface-2';
}
