import { VendorsService } from './vendors.service';
export declare class VendorsController {
    private vendorsService;
    constructor(vendorsService: VendorsService);
    createVendor(req: any, body: any): Promise<any>;
    listVendors(): Promise<any>;
    getVendor(id: string): Promise<any>;
    verify(id: string): Promise<any>;
}
