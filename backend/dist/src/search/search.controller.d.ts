import { SearchService } from './search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    searchProducts(query?: string, type?: string, minPrice?: string, maxPrice?: string, category?: string, vendorId?: string): Promise<any>;
    searchVendors(query?: string, category?: string, verified?: string): Promise<any>;
    searchEvents(query?: string, userId?: string): Promise<any>;
}
