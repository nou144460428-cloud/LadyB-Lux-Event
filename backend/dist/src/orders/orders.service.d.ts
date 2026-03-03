import { OrderStatus } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './create-order.dto';
import { EmailService } from '../email/email.service';
export declare class OrdersService {
    private productsService;
    private emailService;
    private prisma;
    private readonly logger;
    private static readonly PLATFORM_COMMISSION_RATE;
    constructor(productsService: ProductsService, emailService: EmailService);
    createOrder(userId: string, dto: CreateOrderDto): Promise<any>;
    private findRecentEquivalentOrder;
    private buildOrderItemsSignature;
    private ensureEventForOrder;
    confirmOrder(orderId: string): Promise<any>;
    getOrder(orderId: string): Promise<any>;
    getUserOrders(userId: string): Promise<any>;
    updateOrderStatus(orderId: string, status: OrderStatus, userId: string, userRole: string): Promise<any>;
    private isValidStatusTransition;
    markCompletedAfterEventDate(): Promise<any>;
    getVendorOrders(vendorId: string): Promise<any>;
    notifyVendor(orderId: string): Promise<void>;
}
