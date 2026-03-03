"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let InventoryService = class InventoryService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async addMaterial(vendorId, data) {
        return this.prisma.material.create({
            data: {
                vendorId,
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl || null,
                size: data.size || null,
                colour: data.colour || null,
                options: data.options || null,
                quantity: data.quantity,
                unit: data.unit,
                price: data.price,
                category: data.category,
            },
        });
    }
    async getVendorMaterials(vendorId) {
        return this.prisma.material.findMany({ where: { vendorId } });
    }
    async updateMaterial(id, data) {
        return this.prisma.material.update({ where: { id }, data });
    }
    async deleteMaterial(id) {
        return this.prisma.material.delete({ where: { id } });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)()
], InventoryService);
//# sourceMappingURL=inventory.service.js.map