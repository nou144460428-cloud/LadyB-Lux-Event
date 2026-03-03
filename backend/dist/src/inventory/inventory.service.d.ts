export declare class InventoryService {
    private prisma;
    addMaterial(vendorId: string, data: any): Promise<any>;
    getVendorMaterials(vendorId: string): Promise<any>;
    updateMaterial(id: string, data: any): Promise<any>;
    deleteMaterial(id: string): Promise<any>;
}
