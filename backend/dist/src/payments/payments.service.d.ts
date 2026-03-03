import { OrdersService } from '../orders/orders.service';
export declare class PaymentsService {
    private ordersService;
    private prisma;
    private paystackBaseUrl;
    private paystackSecret;
    private monnifyBaseUrl;
    private monnifyApiKey;
    private monnifySecretKey;
    private monnifyContractCode;
    private monnifyWebhookSecret;
    constructor(ordersService: OrdersService);
    createPayment(orderId: string, provider?: string): Promise<any>;
    initiatePayment(orderId: string, requesterUserId: string, provider?: string): Promise<any>;
    private initiateCashPickupPayment;
    verifyPayment(reference: string, requesterUserId: string, provider?: string): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    initiatePaystackPayment(orderId: string, requesterUserId: string): Promise<any>;
    private getMonnifyAccessToken;
    initiateMonnifyPayment(orderId: string, requesterUserId: string): Promise<{
        status: boolean;
        message: string;
        data: {
            authorization_url: any;
            reference: string;
            provider: string;
        };
    }>;
    confirmPayment(orderId: string, reference: string): Promise<any>;
    handlePaystackWebhook(payload: any): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyPaystackPayment(reference: string, requesterUserId: string): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    verifyMonnifyPayment(reference: string, requesterUserId: string): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    handleMonnifyWebhook(payload: any): Promise<{
        success: boolean;
        message: string;
    }>;
    reconcileInitiatedPayments(): Promise<{
        checked: number;
        confirmed: number;
        failed: number;
    }>;
    getMonnifyWebhookSecret(): string | undefined;
    private queryPaystackByReference;
    private queryMonnifyByReference;
    failPayment(orderId: string, reference?: string): Promise<any>;
    getPayment(orderId: string): Promise<any>;
}
