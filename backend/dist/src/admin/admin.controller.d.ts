import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    stats(): Promise<{
        users: any;
        vendors: any;
        orders: any;
        payments: any;
    }>;
    recentOrders(limit?: string): Promise<any>;
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
    createMaterial(body: {
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
    createEventForUser(body: {
        userId: string;
        title: string;
        eventDate: string;
        location: string;
    }): Promise<any>;
    createStaffAccount(body: {
        name: string;
        email: string;
        password: string;
        accountType: 'STOCK_KEEPER_ADMIN' | 'STAFF';
    }): Promise<any>;
}
