import { PaymentsService } from '../payments/payments.service';
export declare class AdminService {
    private paymentsService;
    private prisma;
    constructor(paymentsService: PaymentsService);
    stats(): Promise<{
        users: any;
        vendors: any;
        orders: any;
        payments: any;
    }>;
    recentOrders(limit?: number): Promise<any>;
    pendingPayoutSummary(): Promise<any>;
    markVendorPayoutAsPaid(vendorId: string): Promise<{
        vendorId: string;
        paidLogCount: number;
        paidAt: null;
    } | {
        vendorId: string;
        paidLogCount: any;
        paidAt: Date;
    }>;
    listMaterials(): Promise<any>;
    createMaterial(data: {
        vendorId: string;
        name: string;
        description?: string;
        imageUrl?: string;
        size?: string;
        colour?: string;
        options?: string;
        quantity: number;
        unit: string;
        price: number;
        category: string;
    }): Promise<any>;
    reconcilePayments(): Promise<{
        checked: number;
        confirmed: number;
        failed: number;
    }>;
    createEventForUser(data: {
        userId: string;
        title: string;
        eventDate: string;
        location: string;
    }): Promise<any>;
    createStaffAccount(data: {
        name: string;
        email: string;
        password: string;
        accountType: 'STOCK_KEEPER_ADMIN' | 'STAFF';
    }): Promise<any>;
}
