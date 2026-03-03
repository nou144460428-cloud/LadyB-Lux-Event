import { ProductsService } from './products.service';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    getProduct(id: string): Promise<any>;
    getProductsByVendor(vendorId: string): Promise<any>;
    checkAvailability(productId: string, startDate: string, endDate: string, qty: string): Promise<{
        available: boolean;
    }>;
    bookAvailability(productId: string, startDate: string, endDate: string, qty: string): Promise<any>;
}
