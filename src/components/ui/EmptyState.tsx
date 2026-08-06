'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 sm:py-16 rounded-2xl border border-dashed border-sf bg-sf-surface/60">
      <div className="w-16 h-16 rounded-2xl bg-sf-accent-soft text-sf-accent flex items-center justify-center mb-4 shadow-sf-xs">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-black text-sf">{title}</h3>
      {description ? <p className="text-sm text-sf-muted mt-2 max-w-md leading-relaxed">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
