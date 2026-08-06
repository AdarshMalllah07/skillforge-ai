'use client';

import React from 'react';

const toneGradient = {
  emerald: 'from-emerald-900 via-teal-900 to-slate-900',
  indigo: 'from-indigo-950 via-slate-900 to-slate-950',
  amber: 'from-amber-900 via-orange-950 to-slate-900',
  violet: 'from-violet-950 via-slate-900 to-slate-950',
  slate: 'from-slate-900 via-slate-800 to-indigo-950',
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  icon,
  tone = 'slate',
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: keyof typeof toneGradient;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-8 text-white shadow-sf-lg bg-gradient-to-r ${toneGradient[tone]}`}
    >
      {icon ? (
        <div className="absolute top-0 right-0 translate-x-6 -translate-y-6 opacity-10 pointer-events-none">
          {icon}
        </div>
      ) : null}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-3 min-w-0">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-indigo-100">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h1>
          {description ? (
            <p className="text-sm text-white/75 max-w-2xl leading-relaxed">{description}</p>
          ) : null}
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 pt-1 [&_button]:whitespace-nowrap">
              {actions}
            </div>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </div>
  );
}
