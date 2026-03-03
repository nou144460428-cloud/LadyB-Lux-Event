export declare class CreateOrderItemDto {
    productId: string;
    quantity: number;
    price: number;
    startDate?: string;
    endDate?: string;
    deliveryDate?: string;
}
export declare class CreateOrderDto {
    eventId?: string;
    idempotencyKey?: string;
    items: CreateOrderItemDto[];
}
