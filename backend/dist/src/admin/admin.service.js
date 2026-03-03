"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
const payments_service_1 = require("../payments/payments.service");
const bcrypt = __importStar(require("bcrypt"));
const common_2 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    paymentsService;
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async stats() {
        const users = await this.prisma.user.count();
        const vendors = await this.prisma.vendor.count();
        const orders = await this.prisma.order.count();
        const payments = await this.prisma.payment.count();
        return { users, vendors, orders, payments };
    }
    async recentOrders(limit = 10) {
        return this.prisma.order.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                event: true,
                items: true,
                payment: true,
            },
        });
    }
    async pendingPayoutSummary() {
        if (!this.prisma.commissionLog) {
            return [];
        }
        const summary = await this.prisma.commissionLog.groupBy({
            by: ['vendorId'],
            where: { status: 'PENDING_PAYOUT' },
            _sum: {
                amount: true,
                commissionAmount: true,
                grossAmount: true,
            },
            _count: { _all: true },
        });
        const vendorIds = summary.map((row) => row.vendorId);
        const vendors = await this.prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, businessName: true },
        });
        const vendorNameMap = new Map(vendors.map((vendor) => [vendor.id, vendor.businessName]));
        return summary.map((row) => ({
            vendorId: row.vendorId,
            businessName: vendorNameMap.get(row.vendorId) || 'Unknown Vendor',
            pendingOrders: row._count._all,
            grossTotal: row._sum.grossAmount || 0,
            commissionTotal: row._sum.commissionAmount || 0,
            payoutAmount: row._sum.amount || 0,
        }));
    }
    async markVendorPayoutAsPaid(vendorId) {
        if (!this.prisma.commissionLog) {
            return {
                vendorId,
                paidLogCount: 0,
                paidAt: null,
            };
        }
        const now = new Date();
        const result = await this.prisma.commissionLog.updateMany({
            where: {
                vendorId,
                status: 'PENDING_PAYOUT',
            },
            data: {
                status: 'PAID_OUT',
                paidAt: now,
            },
        });
        return {
            vendorId,
            paidLogCount: result.count,
            paidAt: now,
        };
    }
    async listMaterials() {
        return this.prisma.material.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                    },
                },
            },
        });
    }
    async createMaterial(data) {
        return this.prisma.material.create({
            data: {
                vendorId: data.vendorId,
                name: data.name,
                description: data.description || null,
                imageUrl: data.imageUrl || null,
                size: data.size || null,
                colour: data.colour || null,
                options: data.options || null,
                quantity: Number(data.quantity),
                unit: data.unit,
                price: Number(data.price),
                category: data.category,
            },
        });
    }
    async reconcilePayments() {
        return this.paymentsService.reconcileInitiatedPayments();
    }
    async createEventForUser(data) {
        return this.prisma.event.create({
            data: {
                userId: data.userId,
                title: data.title,
                eventDate: new Date(data.eventDate),
                location: data.location,
            },
        });
    }
    async createStaffAccount(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_2.ConflictException('Email already registered');
        }
        const hashed = await bcrypt.hash(data.password, 10);
        const role = data.accountType === 'STOCK_KEEPER_ADMIN' ? client_1.Role.ADMIN : client_1.Role.STAFF;
        const accountType = data.accountType === 'STOCK_KEEPER_ADMIN'
            ? client_1.AccountType.ADMIN
            : client_1.AccountType.STAFF;
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashed,
                role,
                accountType,
            },
        });
        return {
            ...user,
            accountType: data.accountType,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map