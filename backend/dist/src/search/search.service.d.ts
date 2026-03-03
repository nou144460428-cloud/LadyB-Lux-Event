import { ProductType, VendorCategory } from '@prisma/client';
export declare class SearchService {
    private prisma;
    searchProducts(query?: string, type?: ProductType, minPrice?: number, maxPrice?: number, category?: VendorCategory, vendorId?: string): Promise<any>;
    searchVendors(query?: string, category?: VendorCategory, verifiedOnly?: boolean): Promise<any>;
    searchEvents(query?: string, userId?: string): Promise<any>;
    advancedSearch(type: 'products' | 'vendors' | 'events', filters: any): Promise<any>;
}
