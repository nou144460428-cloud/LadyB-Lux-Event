export function initSentryBackend(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  try {
    // Optional runtime dependency: app still works if Sentry package is not installed.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/node') as {
      init: (options: Record<string, unknown>) => void;
      captureException: (error: unknown) => void;
    };

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });

    process.on('unhandledRejection', (reason: unknown) => {
      Sentry.captureException(
        reason instanceof Error ? reason : new Error(String(reason)),
      );
    });

    process.on('uncaughtException', (error: Error) => {
      Sentry.captureException(error);
    });
  } catch {
    // Sentry package not installed; skip monitoring without crashing startup.
  }
}
