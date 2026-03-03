import { ReceiptsService } from './receipts.service';
export declare class ReceiptsController {
    private receiptsService;
    constructor(receiptsService: ReceiptsService);
    getReceipt(id: string): Promise<any>;
    getOrderReceipt(orderId: string): Promise<any>;
    getUserReceipts(req: any): Promise<any>;
}
