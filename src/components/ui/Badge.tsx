'use client';

import React from 'react';

type Tone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'student'
  | 'instructor'
  | 'evaluator'
  | 'admin';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  info: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  student: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  instructor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  evaluator: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  admin: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function roleBadgeTone(role: string): Tone {
  switch (role) {
    case 'STUDENT':
      return 'student';
    case 'INSTRUCTOR':
      return 'instructor';
    case 'EVALUATOR':
      return 'evaluator';
    case 'ADMIN':
      return 'admin';
    default:
      return 'neutral';
  }
}

export function statusBadgeTone(status: string): Tone {
  switch (status) {
    case 'GRADED':
    case 'PUBLISHED':
    case 'PASS':
      return 'success';
    case 'AI_EVALUATED':
    case 'PENDING':
    case 'DRAFT':
      return 'warning';
    case 'REJECTED':
    case 'FAIL':
    case 'ARCHIVED':
      return 'danger';
    case 'NEEDS_REVISION':
      return 'info';
    default:
      return 'neutral';
  }
}
