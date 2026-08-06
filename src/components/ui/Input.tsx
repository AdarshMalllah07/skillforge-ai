'use client';

import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-xs font-bold text-sf-muted uppercase tracking-wide">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={`w-full h-10 px-3 rounded-xl border border-sf bg-sf-surface text-sf text-sm placeholder:text-sf-muted/70 shadow-sf-xs outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-shadow ${className}`}
        {...props}
      />
      {hint ? <span className="text-[11px] text-sf-muted">{hint}</span> : null}
    </label>
  );
}
