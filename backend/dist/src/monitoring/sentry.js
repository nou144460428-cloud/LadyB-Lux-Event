"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSentryBackend = initSentryBackend;
function initSentryBackend() {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) {
        return;
    }
    try {
        const Sentry = require('@sentry/node');
        Sentry.init({
            dsn,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: 1.0,
        });
        process.on('unhandledRejection', (reason) => {
            Sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
        });
        process.on('uncaughtException', (error) => {
            Sentry.captureException(error);
        });
    }
    catch {
    }
}
//# sourceMappingURL=sentry.js.map