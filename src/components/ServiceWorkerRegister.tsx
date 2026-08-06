'use client';

import { useEffect } from 'react';

/**
 * Registers SW with a build-specific query so each rebuild installs a new worker.
 * CACHE_VERSION inside sw.js is also rewritten at build time.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) {
      console.warn('[sf] Service workers are not supported in this browser');
      return;
    }

    const build = process.env.NEXT_PUBLIC_SF_BUILD || 'dev';
    const version = process.env.NEXT_PUBLIC_SF_SW_VERSION || `sf-${build}`;
    const swUrl = `/sw.js?v=${encodeURIComponent(build)}`;

    let cancelled = false;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register(swUrl, {
          scope: '/',
          updateViaCache: 'none',
        });

        if (cancelled) return;

        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        await reg.update().catch(() => undefined);

        console.info(`[sf] SW ${version} registered`, reg.scope);
      } catch (err) {
        console.warn('[sf] Service worker registration failed', err);
      }
    };

    if (document.readyState === 'complete') {
      void register();
    } else {
      window.addEventListener('load', () => void register(), { once: true });
      void register();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
