"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let ProductsService = class ProductsService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async checkAvailability(productId, startDate, endDate, qty) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const bookings = await this.prisma.availability.findMany({
            where: {
                productId,
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start },
                    },
                ],
            },
        });
        const bookedQty = bookings.reduce((sum, b) => sum + b.quantity, 0);
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return false;
        }
        return product.quantity - bookedQty >= qty;
    }
    async getProduct(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                vendor: true,
                orderItems: true,
                availabilities: true,
            },
        });
    }
    async getProductsByVendor(vendorId) {
        return this.prisma.product.findMany({
            where: { vendorId },
            include: { availabilities: true },
        });
    }
    async bookAvailability(productId, startDate, endDate, qty) {
        const isAvailable = await this.checkAvailability(productId, startDate, endDate, qty);
        if (!isAvailable) {
            throw new Error('Product not available for the requested dates and quantity');
        }
        return this.prisma.availability.create({
            data: {
                productId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                quantity: qty,
            },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)()
], ProductsService);
//# sourceMappingURL=products.service.js.map