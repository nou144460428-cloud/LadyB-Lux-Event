export declare class AnalyticsService {
    private prisma;
    getDashboardMetrics(vendorId?: string, startDate?: Date, endDate?: Date): Promise<{
        totalOrders: any;
        totalRevenue: any;
        totalCustomers: any;
        conversionRate: string | number;
        paidOrders: any;
        pendingOrders: number;
    }>;
    getTopVendors(limit?: number): Promise<any>;
    getOrderTrends(days?: number): Promise<{
        date: string;
        orders: unknown;
    }[]>;
    getProductPopularity(limit?: number): Promise<any>;
    getCategoryMetrics(): Promise<{
        category: string;
        vendorCount: unknown;
    }[]>;
}
