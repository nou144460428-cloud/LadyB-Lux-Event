import 'dotenv/config';
import {
  Logger,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CronJob } from 'cron';
import { AppModule } from './app.module';
import { OrdersService } from './orders/orders.service';
import { PaymentsService } from './payments/payments.service';
import { initSentryBackend } from './monitoring/sentry';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  initSentryBackend();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, { rawBody: true });
  const rawAllowedOrigins = process.env.FRONTEND_URL;
  const allowedOrigins = rawAllowedOrigins
    ? rawAllowedOrigins.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors.map((error) => ({
            field: error.property,
            constraints: error.constraints,
          })),
        ),
    }),
  );

  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 120);
  const buckets = new Map<string, { count: number; resetAt: number }>();

  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    const shouldRateLimit =
      req.path.startsWith('/auth') || req.path.startsWith('/payments');

    if (shouldRateLimit) {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${ip}:${req.path}`;
      const now = Date.now();
      const bucket = buckets.get(key);

      if (!bucket || now >= bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
      } else {
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

  const ordersService = app.get(OrdersService);
  const paymentsService = app.get(PaymentsService);
  const job = new CronJob('59 23 * * *', async () => {
    await ordersService.markCompletedAfterEventDate();
    logger.log('Orders marked as completed');
  });
  job.start();

  const paymentReconciliationJob = new CronJob('*/10 * * * *', async () => {
    const result = await paymentsService.reconcileInitiatedPayments();
    logger.log(
      `Payment reconciliation completed: checked=${result.checked}, confirmed=${result.confirmed}, failed=${result.failed}`,
    );
  });
  paymentReconciliationJob.start();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
