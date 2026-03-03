export declare class ProductsService {
    private prisma;
    checkAvailability(productId: string, startDate: string | Date, endDate: string | Date, qty: number): Promise<boolean>;
    getProduct(id: string): Promise<any>;
    getProductsByVendor(vendorId: string): Promise<any>;
    bookAvailability(productId: string, startDate: string | Date, endDate: string | Date, qty: number): Promise<any>;
}
