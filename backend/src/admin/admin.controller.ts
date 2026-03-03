import {
  Controller,
  Get,
  UseGuards,
  Query,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  async stats() {
    return this.adminService.stats();
  }

  @Get('orders')
  @Roles(Role.ADMIN, Role.STAFF)
  async recentOrders(@Query('limit') limit?: string) {
    return this.adminService.recentOrders(limit ? parseInt(limit, 10) : 10);
  }

  @Get('commissions/pending-summary')
  @Roles(Role.ADMIN)
  async pendingPayoutSummary() {
    return this.adminService.pendingPayoutSummary();
  }

  @Post('commissions/payout/:vendorId')
  @Roles(Role.ADMIN)
  async markVendorPayoutAsPaid(@Param('vendorId') vendorId: string) {
    return this.adminService.markVendorPayoutAsPaid(vendorId);
  }

  @Get('materials')
  @Roles(Role.ADMIN, Role.STAFF)
  async listMaterials() {
    return this.adminService.listMaterials();
  }

  @Post('materials')
  @Roles(Role.ADMIN, Role.STAFF)
  async createMaterial(
    @Body()
    body: {
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
    },
  ) {
    return this.adminService.createMaterial(body);
  }

  @Post('payments/reconcile')
  @Roles(Role.ADMIN)
  async reconcilePayments() {
    return this.adminService.reconcilePayments();
  }

  @Post('events')
  @Roles(Role.ADMIN)
  async createEventForUser(
    @Body()
    body: {
      userId: string;
      title: string;
      eventDate: string;
      location: string;
    },
  ) {
    return this.adminService.createEventForUser(body);
  }

  @Post('staff-accounts')
  @Roles(Role.ADMIN)
  async createStaffAccount(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      accountType: 'STOCK_KEEPER_ADMIN' | 'STAFF';
    },
  ) {
    return this.adminService.createStaffAccount(body);
  }
}
