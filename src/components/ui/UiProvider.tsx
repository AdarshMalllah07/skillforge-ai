'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
};

export type AlertOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: 'success' | 'error' | 'info';
};

export type ToastOptions = {
  message: string;
  variant?: 'success' | 'error' | 'info';
  durationMs?: number;
};

type ToastItem = ToastOptions & { id: string };

type UiContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
  toast: (options: ToastOptions | string) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

let imperativeUi: UiContextValue | null = null;

/** Imperative access for non-React call sites (prefer useUi in components). */
export function getUi(): UiContextValue {
  if (!imperativeUi) {
    throw new Error('UiProvider is not mounted');
  }
  return imperativeUi;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}

function variantButtonClass(variant: ConfirmOptions['variant']): string {
  switch (variant) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 text-white';
    default:
      return 'bg-indigo-600 hover:bg-indigo-700 text-white';
  }
}

function AlertIcon({ variant }: { variant?: AlertOptions['variant'] }) {
  if (variant === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
  if (variant === 'error') return <AlertCircle className="w-5 h-5 text-red-600" />;
  return <Info className="w-5 h-5 text-indigo-600" />;
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const [alertState, setAlertState] = useState<{
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string) => {
    const normalized: AlertOptions =
      typeof options === 'string' ? { message: options, variant: 'info' } : options;
    return new Promise<void>((resolve) => {
      setAlertState({ options: normalized, resolve });
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions | string) => {
      const normalized: ToastOptions =
        typeof options === 'string' ? { message: options, variant: 'info' } : options;
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { ...normalized, id }]);
      const duration = normalized.durationMs ?? 3500;
      window.setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ confirm, alert, toast }), [confirm, alert, toast]);

  useEffect(() => {
    imperativeUi = value;
    return () => {
      if (imperativeUi === value) imperativeUi = null;
    };
  }, [value]);

  const closeConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  const closeAlert = () => {
    alertState?.resolve();
    setAlertState(null);
  };

  return (
    <UiContext.Provider value={value}>
      {children}

      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="Dismiss"
            onClick={() => closeConfirm(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ui-confirm-title"
            className="relative z-10 w-full max-w-md bg-sf-surface rounded-2xl border border-sf shadow-sf-lg p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="ui-confirm-title" className="text-sm font-extrabold text-slate-900">
                  {confirmState.options.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {confirmState.options.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {confirmState.options.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl ${variantButtonClass(
                  confirmState.options.variant
                )}`}
              >
                {confirmState.options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert dialog */}
      {alertState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="Dismiss"
            onClick={closeAlert}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ui-alert-title"
            className="relative z-10 w-full max-w-md bg-sf-surface rounded-2xl border border-sf shadow-sf-lg p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <AlertIcon variant={alertState.options.variant} />
              <div className="flex-1 min-w-0">
                {alertState.options.title && (
                  <h3 id="ui-alert-title" className="text-sm font-extrabold text-slate-900">
                    {alertState.options.title}
                  </h3>
                )}
                <p
                  className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line ${
                    alertState.options.title ? 'mt-1.5' : ''
                  }`}
                >
                  {alertState.options.message}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAlert}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeAlert}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {alertState.options.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[110] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3.5 py-3 shadow-sf-md bg-sf-surface text-xs ${
              t.variant === 'error'
                ? 'border-red-200 dark:border-red-900'
                : t.variant === 'success'
                  ? 'border-emerald-200 dark:border-emerald-900'
                  : 'border-sf'
            }`}
          >
            <AlertIcon variant={t.variant} />
            <p className="flex-1 text-sf font-medium leading-relaxed">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </UiContext.Provider>
  );
}
