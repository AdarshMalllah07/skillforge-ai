'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap text-xs text-sf-muted">
      <Link
        href="/"
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sf-surface-2 hover:text-sf transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-sf font-semibold transition-colors truncate max-w-[10rem] sm:max-w-none">
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[12rem] sm:max-w-none ${last ? 'text-sf font-bold' : 'font-semibold'}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
