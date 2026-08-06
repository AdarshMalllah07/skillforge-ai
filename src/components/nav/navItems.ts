'use client';

import {
  BookOpen,
  FileCheck2,
  Sparkles,
  BarChart3,
  GraduationCap,
  Users,
  ShieldCheck,
  LayoutDashboard,
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
  if (role === 'STUDENT') {
    return [
      { tab: 'student_dashboard', label: 'Student Portal', icon: GraduationCap, section: 'role' },
      { tab: 'courses', label: 'My Courses', icon: BookOpen, section: 'main' },
      { tab: 'student_submissions', label: 'My Submissions', icon: FileCheck2, section: 'main' },
      { tab: 'student_analytics', label: 'My Progress', icon: BarChart3, section: 'main' },
    ];
  }

  if (role === 'INSTRUCTOR') {
    return [
      { tab: 'instructor_dashboard', label: 'Faculty Console', icon: BookOpen, section: 'role' },
      { tab: 'courses', label: 'My Courses', icon: BookOpen, section: 'main' },
      { tab: 'instructor_submissions', label: 'Grading', icon: FileCheck2, section: 'main' },
      { tab: 'instructor_analytics', label: 'Analytics', icon: BarChart3, section: 'main' },
      { tab: 'generator', label: 'AI Architect', icon: Sparkles, section: 'main' },
    ];
  }

  if (role === 'EVALUATOR') {
    return [
      { tab: 'evaluator_dashboard', label: 'Assessor Console', icon: ShieldCheck, section: 'role' },
      { tab: 'evaluator_submissions', label: 'Review Queue', icon: FileCheck2, section: 'main' },
      { tab: 'courses', label: 'Courses', icon: BookOpen, section: 'main' },
      { tab: 'evaluator_analytics', label: 'Analytics', icon: BarChart3, section: 'main' },
    ];
  }

  if (role === 'ADMIN') {
    return [
      { tab: 'admin_overview', label: 'Overview', icon: LayoutDashboard, section: 'role' },
      { tab: 'admin_users', label: 'Users & Roles', icon: Users, section: 'main' },
      { tab: 'admin_courses', label: 'Courses', icon: BookOpen, section: 'main' },
      { tab: 'admin_submissions', label: 'Submissions', icon: FileCheck2, section: 'main' },
      { tab: 'admin_analytics', label: 'Analytics', icon: BarChart3, section: 'main' },
      { tab: 'generator', label: 'AI Architect', icon: Sparkles, section: 'main' },
      { tab: 'student_dashboard', label: 'Student Portal', icon: GraduationCap, section: 'main' },
      { tab: 'instructor_dashboard', label: 'Faculty Console', icon: BookOpen, section: 'main' },
      { tab: 'evaluator_dashboard', label: 'Assessor Console', icon: ShieldCheck, section: 'main' },
    ];
  }

  return [];
}

export function activeNavClass(active: boolean, accent?: string) {
  if (active) {
    return accent || 'bg-slate-900 text-white dark:bg-indigo-600 shadow-sf-sm';
  }
  return 'text-sf-muted hover:text-sf hover:bg-sf-surface-2';
}
