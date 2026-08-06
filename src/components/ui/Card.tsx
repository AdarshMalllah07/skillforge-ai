'use client';

import React from 'react';

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`bg-sf-surface border border-sf rounded-2xl shadow-sf-sm ${
        hover ? 'transition-all hover:shadow-sf-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = 'indigo',
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
  accent?: 'indigo' | 'emerald' | 'amber' | 'slate' | 'violet';
}) {
  const accentMap = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
  };

  return (
    <Card hover className="p-4 sm:p-5 overflow-visible">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-sf-muted leading-snug break-words">
            {label}
          </p>
          <p className="text-2xl font-black tracking-tight text-sf leading-none">{value}</p>
          {hint ? <p className="text-[11px] text-sf-muted leading-snug">{hint}</p> : null}
        </div>
        {icon ? (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentMap[accent]}`}>
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
