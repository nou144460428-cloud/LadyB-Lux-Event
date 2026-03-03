'use client';

import { useEffect } from 'react';

export default function MonitoringInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) {
      return;
    }

    (async () => {
      try {
        // Optional runtime dependency: app still works if package is not installed.
        const sentryModuleName = '@sentry/nextjs';
        const sentry = (await import(sentryModuleName)) as {
          init?: (options: Record<string, unknown>) => void;
        };

        sentry.init?.({
          dsn,
          tracesSampleRate: 0.1,
        });
      } catch {
        // Sentry package not installed; skip browser monitoring.
      }
    })();
  }, []);

  return null;
}
