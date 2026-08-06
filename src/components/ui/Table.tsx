'use client';

import React from 'react';

export function Table({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-sf bg-sf-surface shadow-sf-sm ${className}`}>
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-sf-surface-2/95 backdrop-blur border-b border-sf text-left text-[11px] uppercase tracking-wider text-sf-muted">
      {children}
    </thead>
  );
}

export function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-bold whitespace-nowrap ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sf align-middle ${className}`}>{children}</td>;
}

export function Tr({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`group border-b border-sf last:border-0 hover:bg-sf-surface-2/70 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
}
