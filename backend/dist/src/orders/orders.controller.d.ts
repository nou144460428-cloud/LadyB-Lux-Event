import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';
export declare class OrdersController {
    private ordersService;
    private prisma;
    constructor(ordersService: OrdersService);
    createOrder(dto: CreateOrderDto, req: any): Promise<any>;
    getVendorOrders(req: any): Promise<any>;
    getOrder(orderId: string): Promise<any>;
    getUserOrders(req: any): Promise<any>;
    updateOrderStatus(orderId: string, status: string, req: any): Promise<any>;
    markInProgress(orderId: string, req: any): Promise<any>;
}
