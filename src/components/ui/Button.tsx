'use client';

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sf-sm',
  secondary:
    'bg-sf-surface text-sf border border-sf hover:bg-sf-surface-2 shadow-sf-xs',
  ghost: 'bg-transparent text-sf-muted hover:bg-sf-surface-2 hover:text-sf',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sf-sm',
  accent:
    'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sf-sm dark:bg-indigo-500 dark:hover:bg-indigo-400',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-5 text-sm gap-2 rounded-2xl',
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:pointer-events-none min-w-0 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
