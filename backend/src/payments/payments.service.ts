import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createPrismaClient } from '../prisma/prisma-client-options';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrdersService } from '../orders/orders.service';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private prisma: any = createPrismaClient() as any;
  private paystackBaseUrl = 'https://api.paystack.co';
  private paystackSecret = process.env.PAYSTACK_SECRET;
  private monnifyBaseUrl =
    process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';
  private monnifyApiKey = process.env.MONNIFY_API_KEY;
  private monnifySecretKey = process.env.MONNIFY_SECRET_KEY;
  private monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;
  private monnifyWebhookSecret =
    process.env.MONNIFY_WEBHOOK_SECRET || process.env.MONNIFY_SECRET_KEY;

  constructor(private ordersService: OrdersService) {}

  async createPayment(orderId: string, provider: string = 'paystack') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        provider,
        status: PaymentStatus.INITIATED,
      },
      update: {
        provider,
        status: PaymentStatus.INITIATED,
      },
    });
  }

  async initiatePayment(
    orderId: string,
    requesterUserId: string,
    provider: string = 'paystack',
  ) {
    const normalizedProvider = provider.toLowerCase();
    if (!['paystack', 'monnify', 'cash_pickup'].includes(normalizedProvider)) {
      throw new BadRequestException(
        'Unsupported payment provider. Use paystack, monnify, or cash_pickup',
      );
    }

    if (normalizedProvider === 'cash_pickup') {
      return this.initiateCashPickupPayment(orderId, requesterUserId);
    }

    if (normalizedProvider === 'monnify') {
      return this.initiateMonnifyPayment(orderId, requesterUserId);
    }
    return this.initiatePaystackPayment(orderId, requesterUserId);
  }

  private async initiateCashPickupPayment(
    orderId: string,
    requesterUserId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== requesterUserId) {
      throw new ForbiddenException('You are not allowed to pay for this order');
    }

    const reference = `CASH-${orderId}-${Date.now()}`;

    await this.prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        provider: 'cash_pickup',
        status: PaymentStatus.INITIATED,
        reference,
      },
      update: {
        provider: 'cash_pickup',
        status: PaymentStatus.INITIATED,
        reference,
      },
    });

    return {
      status: true,
      message:
        'Cash payment selected. Payment must be made at material pickup before release.',
      data: {
        provider: 'cash_pickup',
        reference,
        authorization_url: null,
      },
    };
  }

  async verifyPayment(
    reference: string,
    requesterUserId: string,
    provider?: string,
  ) {
    const normalizedProvider = provider?.toLowerCase() ?? '';
    if (provider && !['paystack', 'monnify'].includes(normalizedProvider)) {
      throw new BadRequestException(
        'Unsupported payment provider. Use paystack or monnify',
      );
    }

    if (normalizedProvider === 'monnify') {
      return this.verifyMonnifyPayment(reference, requesterUserId);
    }
    if (normalizedProvider === 'paystack') {
      return this.verifyPaystackPayment(reference, requesterUserId);
    }

    const payment = await this.prisma.payment.findFirst({
      where: { reference },
    });
    if (payment?.provider === 'monnify') {
      return this.verifyMonnifyPayment(reference, requesterUserId);
    }

    return this.verifyPaystackPayment(reference, requesterUserId);
  }

  // E1: Initialize Paystack payment
  async initiatePaystackPayment(orderId: string, requesterUserId: string) {
    if (!this.paystackSecret) {
      throw new InternalServerErrorException('PAYSTACK_SECRET not configured');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== requesterUserId) {
      throw new ForbiddenException('You are not allowed to pay for this order');
    }

    // Create or update payment record
    await this.createPayment(orderId, 'paystack');

    // Initialize Paystack transaction
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email: order.user.email,
          amount: Math.round(order.totalAmount * 100), // Convert to kobo
          callback_url: `${process.env.FRONTEND_URL}/checkout/success`,
          metadata: {
            orderId: orderId,
            userId: order.userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecret}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to initialize payment',
      );
    }
  }

  private async getMonnifyAccessToken() {
    if (
      !this.monnifyApiKey ||
      !this.monnifySecretKey ||
      !this.monnifyContractCode
    ) {
      throw new InternalServerErrorException(
        'Monnify config missing: MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE',
      );
    }

    const auth = Buffer.from(
      `${this.monnifyApiKey}:${this.monnifySecretKey}`,
      'utf8',
    ).toString('base64');

    try {
      const response = await axios.post(
        `${this.monnifyBaseUrl}/api/v1/auth/login`,
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      return response.data?.responseBody?.accessToken as string;
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.responseMessage ||
          error.response?.data?.message ||
          'Failed to authenticate with Monnify',
      );
    }
  }

  async initiateMonnifyPayment(orderId: string, requesterUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== requesterUserId) {
      throw new ForbiddenException('You are not allowed to pay for this order');
    }

    const accessToken = await this.getMonnifyAccessToken();
    const paymentReference = `MNFY-${orderId}-${Date.now()}`;
    const redirectUrl = `${process.env.FRONTEND_URL}/checkout/success?reference=${encodeURIComponent(paymentReference)}&provider=monnify`;

    try {
      const response = await axios.post(
        `${this.monnifyBaseUrl}/api/v1/merchant/transactions/init-transaction`,
        {
          amount: Number(order.totalAmount),
          customerName: order.user.name || order.user.email,
          customerEmail: order.user.email,
          paymentReference,
          paymentDescription: `Payment for order ${order.id}`,
          currencyCode: 'NGN',
          contractCode: this.monnifyContractCode,
          redirectUrl,
          paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.prisma.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          provider: 'monnify',
          status: PaymentStatus.INITIATED,
          reference: paymentReference,
        },
        update: {
          provider: 'monnify',
          status: PaymentStatus.INITIATED,
          reference: paymentReference,
        },
      });

      const checkoutUrl = response.data?.responseBody?.checkoutUrl;
      if (!checkoutUrl) {
        throw new BadRequestException('Monnify checkout URL not returned');
      }

      return {
        status: true,
        message: 'Monnify transaction initialized',
        data: {
          authorization_url: checkoutUrl,
          reference: paymentReference,
          provider: 'monnify',
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.responseMessage ||
          error.response?.data?.message ||
          'Failed to initialize Monnify payment',
      );
    }
  }

  async confirmPayment(orderId: string, reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCESS && payment.reference === reference) {
      return payment;
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      return this.prisma.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.SUCCESS,
          reference,
        },
      });
    }

    // Update payment status to SUCCESS
    const updatedPayment = await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.SUCCESS,
        reference,
      },
    });

    // Confirm the order (lock availability)
    await this.ordersService.confirmOrder(orderId);

    return updatedPayment;
  }

  // E1: Webhook handler for Paystack
  async handlePaystackWebhook(payload: any) {
    const event = payload.event;

    if (event === 'charge.success') {
      const { metadata, reference } = payload.data || {};
      const { orderId } = metadata || {};

      if (!orderId || !reference) {
        throw new BadRequestException('Invalid Paystack webhook payload');
      }

      // Confirm payment
      await this.confirmPayment(orderId, reference);

      return {
        success: true,
        message: 'Payment confirmed and order locked',
      };
    }

    return { success: false, message: 'Event not handled' };
  }

  // Verify payment from frontend
  async verifyPaystackPayment(reference: string, requesterUserId: string) {
    if (!this.paystackSecret) {
      throw new InternalServerErrorException('PAYSTACK_SECRET not configured');
    }

    const response = await this.queryPaystackByReference(reference);

    if (response.data.data.status === 'success') {
      const { orderId, userId } = response.data.data.metadata || {};
      if (!orderId) {
        throw new BadRequestException('Missing order metadata in payment');
      }

      if (userId && userId !== requesterUserId) {
        throw new ForbiddenException('Payment does not belong to this user');
      }

      await this.confirmPayment(orderId, reference);
      return { success: true, data: response.data.data };
    }

    return { success: false, message: 'Payment verification failed' };
  }

  async verifyMonnifyPayment(reference: string, requesterUserId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        reference,
        provider: 'monnify',
      },
      include: {
        order: true,
      },
    });

    if (!payment || !payment.order) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.userId !== requesterUserId) {
      throw new ForbiddenException('Payment does not belong to this user');
    }

    const accessToken = await this.getMonnifyAccessToken();

    const response = await this.queryMonnifyByReference(reference, accessToken);

    const paymentStatus = response.data?.responseBody?.paymentStatus;
    if (paymentStatus === 'PAID' || paymentStatus === 'OVERPAID') {
      await this.confirmPayment(payment.orderId, reference);
      return { success: true, data: response.data.responseBody };
    }

    return { success: false, message: 'Payment verification failed' };
  }

  async handleMonnifyWebhook(payload: any) {
    const paymentReference =
      payload?.eventData?.paymentReference ||
      payload?.paymentReference ||
      payload?.responseBody?.paymentReference;
    const paymentStatus =
      payload?.eventData?.paymentStatus ||
      payload?.paymentStatus ||
      payload?.responseBody?.paymentStatus;

    if (!paymentReference) {
      throw new BadRequestException('Invalid Monnify webhook payload');
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        reference: paymentReference,
        provider: 'monnify',
      },
    });

    if (!payment) {
      return { success: false, message: 'Payment reference not found' };
    }

    if (paymentStatus === 'PAID' || paymentStatus === 'OVERPAID') {
      await this.confirmPayment(payment.orderId, paymentReference);
      return { success: true, message: 'Monnify payment confirmed' };
    }

    if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      await this.failPayment(payment.orderId, paymentReference);
      return { success: true, message: 'Monnify payment marked as failed' };
    }

    return { success: false, message: 'Event not handled' };
  }

  async reconcileInitiatedPayments() {
    const staleThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const pending = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.INITIATED },
      include: { order: true },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    let confirmed = 0;
    let failed = 0;
    let checked = 0;

    for (const payment of pending) {
      if (!payment.reference) {
        continue;
      }

      checked += 1;

      try {
        if (payment.provider === 'paystack') {
          const response = await this.queryPaystackByReference(payment.reference);
          if (response.data.data.status === 'success') {
            const orderId = response.data.data.metadata?.orderId || payment.orderId;
            await this.confirmPayment(orderId, payment.reference);
            confirmed += 1;
            continue;
          }
        }

        if (payment.provider === 'monnify') {
          const accessToken = await this.getMonnifyAccessToken();
          const response = await this.queryMonnifyByReference(
            payment.reference,
            accessToken,
          );
          const status = response.data?.responseBody?.paymentStatus;
          if (status === 'PAID' || status === 'OVERPAID') {
            await this.confirmPayment(payment.orderId, payment.reference);
            confirmed += 1;
            continue;
          }
        }

        if (payment.createdAt <= staleThreshold) {
          await this.failPayment(payment.orderId, payment.reference);
          failed += 1;
        }
      } catch {
        if (payment.createdAt <= staleThreshold) {
          await this.failPayment(payment.orderId, payment.reference);
          failed += 1;
        }
      }
    }

    return { checked, confirmed, failed };
  }

  getMonnifyWebhookSecret() {
    return this.monnifyWebhookSecret;
  }

  private async queryPaystackByReference(reference: string) {
    try {
      return await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecret}`,
          },
        },
      );
    } catch {
      throw new BadRequestException('Failed to verify payment');
    }
  }

  private async queryMonnifyByReference(reference: string, accessToken: string) {
    try {
      return await axios.get(`${this.monnifyBaseUrl}/api/v2/transactions/query`, {
        params: { paymentReference: reference },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      throw new BadRequestException('Failed to verify Monnify payment');
    }
  }

  async failPayment(orderId: string, reference?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.FAILED,
        reference,
      },
    });
  }

  async getPayment(orderId: string) {
    return this.prisma.payment.findUnique({
      where: { orderId },
    });
  }
}
