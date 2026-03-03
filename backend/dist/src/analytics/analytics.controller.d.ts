import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(req: any, startDate?: string, endDate?: string): Promise<{
        totalOrders: any;
        totalRevenue: any;
        totalCustomers: any;
        conversionRate: string | number;
        paidOrders: any;
        pendingOrders: number;
    }>;
    getTopVendors(limit?: string): Promise<any>;
    getOrderTrends(days?: string): Promise<{
        date: string;
        orders: unknown;
    }[]>;
    getProductPopularity(limit?: string): Promise<any>;
    getCategoryMetrics(): Promise<{
        category: string;
        vendorCount: unknown;
    }[]>;
}
