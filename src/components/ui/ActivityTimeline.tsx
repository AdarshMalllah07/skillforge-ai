'use client';

import React from 'react';

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  time?: string;
  tone?: 'indigo' | 'emerald' | 'amber' | 'slate';
  icon?: React.ReactNode;
};

const toneDot = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-400',
};

export function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) return null;
  return (
    <ol className="relative space-y-0">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 ? (
            <span className="absolute left-[11px] top-6 bottom-0 w-px bg-sf-border" />
          ) : null}
          <div
            className={`relative z-10 w-6 h-6 rounded-full border-2 border-sf-surface shadow-sf-xs flex items-center justify-center shrink-0 ${
              toneDot[item.tone || 'indigo']
            }`}
          >
            {item.icon ? <span className="text-white scale-75">{item.icon}</span> : null}
          </div>
          <div className="min-w-0 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-sf">{item.title}</p>
              {item.time ? <time className="text-[11px] text-sf-muted font-medium">{item.time}</time> : null}
            </div>
            {item.description ? (
              <p className="text-xs text-sf-muted mt-1 leading-relaxed">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
