import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
export declare class ConfirmPaymentDto {
    reference: string;
}
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePayment(body: {
        orderId: string;
        provider?: 'paystack' | 'monnify' | 'cash_pickup';
    }, req: any): Promise<any>;
    verifyPayment(body: {
        reference: string;
        provider?: 'paystack' | 'monnify';
    }, req: any): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    handlePaystackWebhook(payload: any, req: RawBodyRequest<any>): Promise<{
        success: boolean;
        message: string;
    }>;
    handleMonnifyWebhook(payload: any, req: RawBodyRequest<any>): Promise<{
        success: boolean;
        message: string;
    }>;
    initiatePaymentLegacy(orderId: string, body: {
        provider?: string;
    }): Promise<void>;
    confirmPayment(orderId: string, dto: ConfirmPaymentDto): Promise<void>;
    failPayment(orderId: string, body?: {
        reference?: string;
    }): Promise<void>;
    getPayment(orderId: string): Promise<any>;
}
