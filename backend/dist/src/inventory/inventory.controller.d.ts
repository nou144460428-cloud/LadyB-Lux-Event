import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    addMaterial(req: any, body: any): Promise<any>;
    getVendorMaterials(vendorId: string): Promise<any>;
    updateMaterial(id: string, body: any): Promise<any>;
    deleteMaterial(id: string): Promise<any>;
}
