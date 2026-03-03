"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let SearchService = class SearchService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async searchProducts(query, type, minPrice, maxPrice, category, vendorId) {
        return this.prisma.product.findMany({
            where: {
                AND: [
                    query
                        ? {
                            OR: [
                                { name: { contains: query, mode: 'insensitive' } },
                                { description: { contains: query, mode: 'insensitive' } },
                            ],
                        }
                        : {},
                    type ? { type } : {},
                    minPrice !== undefined ? { price: { gte: minPrice } } : {},
                    maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
                    category ? { vendor: { category } } : {},
                    vendorId ? { vendorId } : {},
                ],
            },
            include: { vendor: true },
            take: 50,
        });
    }
    async searchVendors(query, category, verifiedOnly = false) {
        return this.prisma.vendor.findMany({
            where: {
                AND: [
                    query
                        ? {
                            OR: [
                                { businessName: { contains: query, mode: 'insensitive' } },
                                { location: { contains: query, mode: 'insensitive' } },
                            ],
                        }
                        : {},
                    category ? { category } : {},
                    verifiedOnly ? { verified: true } : {},
                ],
            },
            include: {
                products: true,
                _count: { select: { products: true, reviews: true } },
            },
            take: 50,
        });
    }
    async searchEvents(query, userId) {
        return this.prisma.event.findMany({
            where: {
                AND: [
                    query ? { title: { contains: query, mode: 'insensitive' } } : {},
                    userId ? { userId } : {},
                ],
            },
            include: { user: { select: { name: true } }, orders: true },
            take: 50,
        });
    }
    async advancedSearch(type, filters) {
        if (type === 'products') {
            return this.searchProducts(filters.query, filters.type, filters.minPrice, filters.maxPrice, filters.category, filters.vendorId);
        }
        else if (type === 'vendors') {
            return this.searchVendors(filters.query, filters.category, filters.verifiedOnly);
        }
        else {
            return this.searchEvents(filters.query, filters.userId);
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)()
], SearchService);
//# sourceMappingURL=search.service.js.map