import { Injectable } from '@nestjs/common';
import { createPrismaClient } from '../prisma/prisma-client-options';

@Injectable()
export class InventoryService {
  private prisma: any = createPrismaClient() as any;

  async addMaterial(vendorId: string, data: any) {
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

  async getVendorMaterials(vendorId: string) {
    return this.prisma.material.findMany({ where: { vendorId } });
  }

  async updateMaterial(id: string, data: any) {
    return this.prisma.material.update({ where: { id }, data });
  }

  async deleteMaterial(id: string) {
    return this.prisma.material.delete({ where: { id } });
  }
}
