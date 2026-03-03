import { Injectable } from '@nestjs/common';
import { createPrismaClient } from '../prisma/prisma-client-options';
import { PaymentsService } from '../payments/payments.service';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { Role, AccountType } from '@prisma/client';

@Injectable()
export class AdminService {
  private prisma: any = createPrismaClient() as any;

  constructor(private paymentsService: PaymentsService) {}

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

    const vendorIds = summary.map((row: any) => row.vendorId);
    const vendors = await this.prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, businessName: true },
    });

    const vendorNameMap = new Map(
      vendors.map((vendor: any) => [vendor.id, vendor.businessName]),
    );

    return summary.map((row: any) => ({
      vendorId: row.vendorId,
      businessName: vendorNameMap.get(row.vendorId) || 'Unknown Vendor',
      pendingOrders: row._count._all,
      grossTotal: row._sum.grossAmount || 0,
      commissionTotal: row._sum.commissionAmount || 0,
      payoutAmount: row._sum.amount || 0,
    }));
  }

  async markVendorPayoutAsPaid(vendorId: string) {
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

  async createMaterial(data: {
    vendorId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    size?: string;
    colour?: string;
    options?: string;
    quantity: number;
    unit: string;
    price: number;
    category: string;
  }) {
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

  async createEventForUser(data: {
    userId: string;
    title: string;
    eventDate: string;
    location: string;
  }) {
    return this.prisma.event.create({
      data: {
        userId: data.userId,
        title: data.title,
        eventDate: new Date(data.eventDate),
        location: data.location,
      },
    });
  }

  async createStaffAccount(data: {
    name: string;
    email: string;
    password: string;
    accountType: 'STOCK_KEEPER_ADMIN' | 'STAFF';
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const role =
      data.accountType === 'STOCK_KEEPER_ADMIN' ? Role.ADMIN : Role.STAFF;
    const accountType =
      data.accountType === 'STOCK_KEEPER_ADMIN'
        ? AccountType.ADMIN
        : AccountType.STAFF;

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
}
