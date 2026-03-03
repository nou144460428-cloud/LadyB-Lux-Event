export declare class EmailService {
    private transporter;
    constructor();
    sendOrderConfirmation(email: string, orderId: string, totalAmount: number): Promise<any>;
    sendPaymentSuccess(email: string, orderId: string, reference: string): Promise<any>;
    sendPaymentFailed(email: string, orderId: string): Promise<any>;
    sendOrderReady(email: string, orderId: string): Promise<any>;
    sendVendorApproved(email: string, businessName: string): Promise<any>;
    sendVendorNewOrder(email: string, businessName: string, orderId: string, eventTitle: string, totalAmount: number): Promise<any>;
    private sendMail;
}
