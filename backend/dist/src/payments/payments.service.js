"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
const client_1 = require("@prisma/client");
const orders_service_1 = require("../orders/orders.service");
const axios_1 = __importDefault(require("axios"));
let PaymentsService = class PaymentsService {
    ordersService;
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    paystackBaseUrl = 'https://api.paystack.co';
    paystackSecret = process.env.PAYSTACK_SECRET;
    monnifyBaseUrl = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';
    monnifyApiKey = process.env.MONNIFY_API_KEY;
    monnifySecretKey = process.env.MONNIFY_SECRET_KEY;
    monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;
    monnifyWebhookSecret = process.env.MONNIFY_WEBHOOK_SECRET || process.env.MONNIFY_SECRET_KEY;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async createPayment(orderId, provider = 'paystack') {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return this.prisma.payment.upsert({
            where: { orderId },
            create: {
                orderId,
                provider,
                status: client_1.PaymentStatus.INITIATED,
            },
            update: {
                provider,
                status: client_1.PaymentStatus.INITIATED,
            },
        });
    }
    async initiatePayment(orderId, requesterUserId, provider = 'paystack') {
        const normalizedProvider = provider.toLowerCase();
        if (!['paystack', 'monnify', 'cash_pickup'].includes(normalizedProvider)) {
            throw new common_1.BadRequestException('Unsupported payment provider. Use paystack, monnify, or cash_pickup');
        }
        if (normalizedProvider === 'cash_pickup') {
            return this.initiateCashPickupPayment(orderId, requesterUserId);
        }
        if (normalizedProvider === 'monnify') {
            return this.initiateMonnifyPayment(orderId, requesterUserId);
        }
        return this.initiatePaystackPayment(orderId, requesterUserId);
    }
    async initiateCashPickupPayment(orderId, requesterUserId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== requesterUserId) {
            throw new common_1.ForbiddenException('You are not allowed to pay for this order');
        }
        const reference = `CASH-${orderId}-${Date.now()}`;
        await this.prisma.payment.upsert({
            where: { orderId },
            create: {
                orderId,
                provider: 'cash_pickup',
                status: client_1.PaymentStatus.INITIATED,
                reference,
            },
            update: {
                provider: 'cash_pickup',
                status: client_1.PaymentStatus.INITIATED,
                reference,
            },
        });
        return {
            status: true,
            message: 'Cash payment selected. Payment must be made at material pickup before release.',
            data: {
                provider: 'cash_pickup',
                reference,
                authorization_url: null,
            },
        };
    }
    async verifyPayment(reference, requesterUserId, provider) {
        const normalizedProvider = provider?.toLowerCase() ?? '';
        if (provider && !['paystack', 'monnify'].includes(normalizedProvider)) {
            throw new common_1.BadRequestException('Unsupported payment provider. Use paystack or monnify');
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
    async initiatePaystackPayment(orderId, requesterUserId) {
        if (!this.paystackSecret) {
            throw new common_1.InternalServerErrorException('PAYSTACK_SECRET not configured');
        }
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== requesterUserId) {
            throw new common_1.ForbiddenException('You are not allowed to pay for this order');
        }
        await this.createPayment(orderId, 'paystack');
        try {
            const response = await axios_1.default.post(`${this.paystackBaseUrl}/transaction/initialize`, {
                email: order.user.email,
                amount: Math.round(order.totalAmount * 100),
                callback_url: `${process.env.FRONTEND_URL}/checkout/success`,
                metadata: {
                    orderId: orderId,
                    userId: order.userId,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecret}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            throw new common_1.BadRequestException(error.response?.data?.message || 'Failed to initialize payment');
        }
    }
    async getMonnifyAccessToken() {
        if (!this.monnifyApiKey ||
            !this.monnifySecretKey ||
            !this.monnifyContractCode) {
            throw new common_1.InternalServerErrorException('Monnify config missing: MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE');
        }
        const auth = Buffer.from(`${this.monnifyApiKey}:${this.monnifySecretKey}`, 'utf8').toString('base64');
        try {
            const response = await axios_1.default.post(`${this.monnifyBaseUrl}/api/v1/auth/login`, {}, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            return response.data?.responseBody?.accessToken;
        }
        catch (error) {
            throw new common_1.BadRequestException(error.response?.data?.responseMessage ||
                error.response?.data?.message ||
                'Failed to authenticate with Monnify');
        }
    }
    async initiateMonnifyPayment(orderId, requesterUserId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== requesterUserId) {
            throw new common_1.ForbiddenException('You are not allowed to pay for this order');
        }
        const accessToken = await this.getMonnifyAccessToken();
        const paymentReference = `MNFY-${orderId}-${Date.now()}`;
        const redirectUrl = `${process.env.FRONTEND_URL}/checkout/success?reference=${encodeURIComponent(paymentReference)}&provider=monnify`;
        try {
            const response = await axios_1.default.post(`${this.monnifyBaseUrl}/api/v1/merchant/transactions/init-transaction`, {
                amount: Number(order.totalAmount),
                customerName: order.user.name || order.user.email,
                customerEmail: order.user.email,
                paymentReference,
                paymentDescription: `Payment for order ${order.id}`,
                currencyCode: 'NGN',
                contractCode: this.monnifyContractCode,
                redirectUrl,
                paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            await this.prisma.payment.upsert({
                where: { orderId },
                create: {
                    orderId,
                    provider: 'monnify',
                    status: client_1.PaymentStatus.INITIATED,
                    reference: paymentReference,
                },
                update: {
                    provider: 'monnify',
                    status: client_1.PaymentStatus.INITIATED,
                    reference: paymentReference,
                },
            });
            const checkoutUrl = response.data?.responseBody?.checkoutUrl;
            if (!checkoutUrl) {
                throw new common_1.BadRequestException('Monnify checkout URL not returned');
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.response?.data?.responseMessage ||
                error.response?.data?.message ||
                'Failed to initialize Monnify payment');
        }
    }
    async confirmPayment(orderId, reference) {
        const payment = await this.prisma.payment.findUnique({
            where: { orderId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === client_1.PaymentStatus.SUCCESS && payment.reference === reference) {
            return payment;
        }
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status === client_1.OrderStatus.PAID) {
            return this.prisma.payment.update({
                where: { orderId },
                data: {
                    status: client_1.PaymentStatus.SUCCESS,
                    reference,
                },
            });
        }
        const updatedPayment = await this.prisma.payment.update({
            where: { orderId },
            data: {
                status: client_1.PaymentStatus.SUCCESS,
                reference,
            },
        });
        await this.ordersService.confirmOrder(orderId);
        return updatedPayment;
    }
    async handlePaystackWebhook(payload) {
        const event = payload.event;
        if (event === 'charge.success') {
            const { metadata, reference } = payload.data || {};
            const { orderId } = metadata || {};
            if (!orderId || !reference) {
                throw new common_1.BadRequestException('Invalid Paystack webhook payload');
            }
            await this.confirmPayment(orderId, reference);
            return {
                success: true,
                message: 'Payment confirmed and order locked',
            };
        }
        return { success: false, message: 'Event not handled' };
    }
    async verifyPaystackPayment(reference, requesterUserId) {
        if (!this.paystackSecret) {
            throw new common_1.InternalServerErrorException('PAYSTACK_SECRET not configured');
        }
        const response = await this.queryPaystackByReference(reference);
        if (response.data.data.status === 'success') {
            const { orderId, userId } = response.data.data.metadata || {};
            if (!orderId) {
                throw new common_1.BadRequestException('Missing order metadata in payment');
            }
            if (userId && userId !== requesterUserId) {
                throw new common_1.ForbiddenException('Payment does not belong to this user');
            }
            await this.confirmPayment(orderId, reference);
            return { success: true, data: response.data.data };
        }
        return { success: false, message: 'Payment verification failed' };
    }
    async verifyMonnifyPayment(reference, requesterUserId) {
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
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.order.userId !== requesterUserId) {
            throw new common_1.ForbiddenException('Payment does not belong to this user');
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
    async handleMonnifyWebhook(payload) {
        const paymentReference = payload?.eventData?.paymentReference ||
            payload?.paymentReference ||
            payload?.responseBody?.paymentReference;
        const paymentStatus = payload?.eventData?.paymentStatus ||
            payload?.paymentStatus ||
            payload?.responseBody?.paymentStatus;
        if (!paymentReference) {
            throw new common_1.BadRequestException('Invalid Monnify webhook payload');
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
            where: { status: client_1.PaymentStatus.INITIATED },
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
                    const response = await this.queryMonnifyByReference(payment.reference, accessToken);
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
            }
            catch {
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
    async queryPaystackByReference(reference) {
        try {
            return await axios_1.default.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecret}`,
                },
            });
        }
        catch {
            throw new common_1.BadRequestException('Failed to verify payment');
        }
    }
    async queryMonnifyByReference(reference, accessToken) {
        try {
            return await axios_1.default.get(`${this.monnifyBaseUrl}/api/v2/transactions/query`, {
                params: { paymentReference: reference },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        }
        catch {
            throw new common_1.BadRequestException('Failed to verify Monnify payment');
        }
    }
    async failPayment(orderId, reference) {
        const payment = await this.prisma.payment.findUnique({
            where: { orderId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return this.prisma.payment.update({
            where: { orderId },
            data: {
                status: client_1.PaymentStatus.FAILED,
                reference,
            },
        });
    }
    async getPayment(orderId) {
        return this.prisma.payment.findUnique({
            where: { orderId },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map