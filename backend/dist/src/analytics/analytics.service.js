"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let AnalyticsService = class AnalyticsService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async getDashboardMetrics(vendorId, startDate, endDate) {
        const dateFilter = startDate || endDate
            ? {
                createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                },
            }
            : {};
        const totalOrders = await this.prisma.order.count({
            where: vendorId
                ? { items: { some: { product: { vendorId } } }, ...dateFilter }
                : dateFilter,
        });
        const totalRevenue = await this.prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: vendorId
                ? { items: { some: { product: { vendorId } } }, ...dateFilter }
                : dateFilter,
        });
        const totalCustomers = await this.prisma.user.count({
            where: { orders: { some: dateFilter } },
        });
        const paidOrders = await this.prisma.order.count({
            where: {
                status: 'PAID',
                ...(vendorId && { items: { some: { product: { vendorId } } } }),
                ...dateFilter,
            },
        });
        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalCustomers,
            conversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(2) : 0,
            paidOrders,
            pendingOrders: totalOrders - paidOrders,
        };
    }
    async getTopVendors(limit = 10) {
        const vendors = await this.prisma.vendor.findMany({
            include: {
                products: {
                    include: {
                        orderItems: { include: { order: true } },
                    },
                },
            },
            take: limit,
        });
        return vendors.map((v) => {
            const totalRevenue = v.products.reduce((sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.price * oi.quantity, 0), 0);
            return { ...v, totalRevenue, productCount: v.products.length };
        });
    }
    async getOrderTrends(days = 30) {
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
            },
        });
        const grouped = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(grouped).map(([date, count]) => ({
            date,
            orders: count,
        }));
    }
    async getProductPopularity(limit = 10) {
        const products = await this.prisma.product.findMany({
            include: { orderItems: true, vendor: true },
            take: limit,
        });
        return products
            .map((p) => ({ ...p, orderCount: p.orderItems.length }))
            .sort((a, b) => b.orderCount - a.orderCount);
    }
    async getCategoryMetrics() {
        const categories = await this.prisma.vendor.findMany({
            select: { category: true },
        });
        const grouped = categories.reduce((acc, v) => {
            acc[v.category] = (acc[v.category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(grouped).map(([category, count]) => ({
            category,
            vendorCount: count,
        }));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)()
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map