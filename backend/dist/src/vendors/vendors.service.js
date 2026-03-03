"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let VendorsService = class VendorsService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async createVendor(userId, data) {
        return this.prisma.vendor.create({
            data: {
                userId,
                category: data.category,
                businessName: data.businessName,
                location: data.location,
            },
        });
    }
    async findById(id) {
        const vendor = await this.prisma.vendor.findUnique({ where: { id } });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async list() {
        return this.prisma.vendor.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async verifyVendor(id) {
        return this.prisma.vendor.update({
            where: { id },
            data: { verified: true },
        });
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)()
], VendorsService);
//# sourceMappingURL=vendors.service.js.map