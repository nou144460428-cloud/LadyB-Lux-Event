export declare class VendorsService {
    private prisma;
    createVendor(userId: string, data: any): Promise<any>;
    findById(id: string): Promise<any>;
    list(): Promise<any>;
    verifyVendor(id: string): Promise<any>;
}
