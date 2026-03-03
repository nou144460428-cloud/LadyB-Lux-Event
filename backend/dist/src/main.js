"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cron_1 = require("cron");
const app_module_1 = require("./app.module");
const orders_service_1 = require("./orders/orders.service");
const payments_service_1 = require("./payments/payments.service");
const sentry_1 = require("./monitoring/sentry");
async function bootstrap() {
    (0, sentry_1.initSentryBackend)();
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const rawAllowedOrigins = process.env.FRONTEND_URL;
    const allowedOrigins = rawAllowedOrigins
        ? rawAllowedOrigins.split(',').map((origin) => origin.trim())
        : ['http://localhost:3000'];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => new common_1.BadRequestException(errors.map((error) => ({
            field: error.property,
            constraints: error.constraints,
        }))),
    }));
    const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
    const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 120);
    const buckets = new Map();
    app.use((req, res, next) => {
        const requestId = req.headers['x-request-id'] ||
            `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        req.headers['x-request-id'] = requestId;
        res.setHeader('x-request-id', requestId);
        const shouldRateLimit = req.path.startsWith('/auth') || req.path.startsWith('/payments');
        if (shouldRateLimit) {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const key = `${ip}:${req.path}`;
            const now = Date.now();
            const bucket = buckets.get(key);
            if (!bucket || now >= bucket.resetAt) {
                buckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
            }
            else {
                bucket.count += 1;
                if (bucket.count > rateLimitMax) {
                    res.status(429).json({ message: 'Too many requests' });
                    return;
                }
            }
        }
        logger.log(`${req.method} ${req.path} [${requestId}]`);
        next();
    });
    const ordersService = app.get(orders_service_1.OrdersService);
    const paymentsService = app.get(payments_service_1.PaymentsService);
    const job = new cron_1.CronJob('59 23 * * *', async () => {
        await ordersService.markCompletedAfterEventDate();
        logger.log('Orders marked as completed');
    });
    job.start();
    const paymentReconciliationJob = new cron_1.CronJob('*/10 * * * *', async () => {
        const result = await paymentsService.reconcileInitiatedPayments();
        logger.log(`Payment reconciliation completed: checked=${result.checked}, confirmed=${result.confirmed}, failed=${result.failed}`);
    });
    paymentReconciliationJob.start();
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map