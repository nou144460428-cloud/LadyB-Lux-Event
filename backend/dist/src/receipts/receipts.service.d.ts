export declare class ReceiptsService {
    private prisma;
    generateReceipt(orderId: string): Promise<any>;
    getReceipt(receiptId: string): Promise<any>;
    getOrderReceipt(orderId: string): Promise<any>;
    getUserReceipts(userId: string): Promise<any>;
}
