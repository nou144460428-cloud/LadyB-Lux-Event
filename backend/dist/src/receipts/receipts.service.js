"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let ReceiptsService = class ReceiptsService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async generateReceipt(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                user: true,
                event: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const items = order.items.map((item) => ({
            productName: item.product.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price,
        }));
        return this.prisma.receipt.create({
            data: {
                orderId,
                userId: order.userId,
                totalAmount: order.totalAmount,
                items,
            },
        });
    }
    async getReceipt(receiptId) {
        const receipt = await this.prisma.receipt.findUnique({
            where: { id: receiptId },
        });
        if (!receipt)
            throw new common_1.NotFoundException('Receipt not found');
        return receipt;
    }
    async getOrderReceipt(orderId) {
        return this.prisma.receipt.findUnique({ where: { orderId } });
    }
    async getUserReceipts(userId) {
        return this.prisma.receipt.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ReceiptsService = ReceiptsService;
exports.ReceiptsService = ReceiptsService = __decorate([
    (0, common_1.Injectable)()
], ReceiptsService);
//# sourceMappingURL=receipts.service.js.map