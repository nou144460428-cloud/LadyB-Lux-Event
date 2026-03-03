import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import * as crypto from 'crypto';

export class ConfirmPaymentDto {
  reference: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // E1: Initiate payment (Paystack/Monnify)
  @Post('initiate')
  @UseGuards(JwtGuard)
  async initiatePayment(
    @Body()
    body: { orderId: string; provider?: 'paystack' | 'monnify' | 'cash_pickup' },
    @Req() req: any,
  ) {
    return this.paymentsService.initiatePayment(
      body.orderId,
      req.user.id,
      body.provider ?? 'paystack',
    );
  }

  // E1: Verify payment from frontend
  @Post('verify')
  @UseGuards(JwtGuard)
  async verifyPayment(
    @Body() body: { reference: string; provider?: 'paystack' | 'monnify' },
    @Req() req: any,
  ) {
    return this.paymentsService.verifyPayment(
      body.reference,
      req.user.id,
      body.provider,
    );
  }

  // E1: Webhook from Paystack
  @Post('webhook/paystack')
  async handlePaystackWebhook(
    @Body() payload: any,
    @Req() req: RawBodyRequest<any>,
  ) {
    // Verify webhook signature - CRITICAL for security
    const secret = process.env.PAYSTACK_SECRET;
    if (!secret) {
      throw new BadRequestException('PAYSTACK_SECRET not configured');
    }

    const rawBody = req.rawBody;
    const contentForHash =
      rawBody && Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(payload));

    const hash = crypto
      .createHmac('sha512', secret)
      .update(contentForHash)
      .digest('hex');

    const signature = Array.isArray(req.headers['x-paystack-signature'])
      ? req.headers['x-paystack-signature'][0]
      : req.headers['x-paystack-signature'];

    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const hashBuffer = Buffer.from(hash, 'utf8');
    const isValid =
      signatureBuffer.length === hashBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, signatureBuffer);

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process the webhook
    return this.paymentsService.handlePaystackWebhook(payload);
  }

  @Post('webhook/monnify')
  async handleMonnifyWebhook(
    @Body() payload: any,
    @Req() req: RawBodyRequest<any>,
  ) {
    const secret = this.paymentsService.getMonnifyWebhookSecret();
    if (!secret) {
      throw new BadRequestException(
        'MONNIFY_WEBHOOK_SECRET or MONNIFY_SECRET_KEY not configured',
      );
    }

    const rawBody = req.rawBody;
    const contentForHash =
      rawBody && Buffer.isBuffer(rawBody)
        ? rawBody
        : Buffer.from(JSON.stringify(payload));

    const hash = crypto
      .createHmac('sha512', secret)
      .update(contentForHash)
      .digest('hex');

    const signature = Array.isArray(req.headers['monnify-signature'])
      ? req.headers['monnify-signature'][0]
      : req.headers['monnify-signature'];

    if (!signature) {
      throw new BadRequestException('Missing monnify-signature');
    }

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const hashBuffer = Buffer.from(hash, 'utf8');
    const isValid =
      signatureBuffer.length === hashBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, signatureBuffer);

    if (!isValid) {
      throw new BadRequestException('Invalid Monnify webhook signature');
    }

    return this.paymentsService.handleMonnifyWebhook(payload);
  }

  // Legacy endpoints
  @Post(':orderId/initiate')
  @UseGuards(JwtGuard)
  async initiatePaymentLegacy(
    @Param('orderId') orderId: string,
    @Body() body: { provider?: string },
  ) {
    throw new GoneException(
      'Legacy payment endpoint disabled. Use POST /payments/initiate.',
    );
  }

  @Post(':orderId/confirm')
  async confirmPayment(
    @Param('orderId') orderId: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    throw new GoneException(
      'Legacy payment endpoint disabled. Use webhook or POST /payments/verify.',
    );
  }

  @Post(':orderId/fail')
  async failPayment(
    @Param('orderId') orderId: string,
    @Body() body?: { reference?: string },
  ) {
    throw new GoneException('Legacy payment endpoint disabled.');
  }

  @Get(':orderId')
  @UseGuards(JwtGuard)
  async getPayment(@Param('orderId') orderId: string) {
    return this.paymentsService.getPayment(orderId);
  }
}
