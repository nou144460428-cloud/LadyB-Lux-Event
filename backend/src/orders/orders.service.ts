import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { createPrismaClient } from '../prisma/prisma-client-options';
import { ProductType, OrderStatus } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './create-order.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  private prisma: any = createPrismaClient() as any;
  private readonly logger = new Logger(OrdersService.name);
  private static readonly PLATFORM_COMMISSION_RATE = 0.15;

  constructor(
    private productsService: ProductsService,
    private emailService: EmailService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const effectiveEventId = await this.ensureEventForOrder(userId, dto.eventId);
    const requestedSignature = this.buildOrderItemsSignature(dto.items);

    // Idempotency guard: if an equivalent pending/paid order was just created, reuse it.
    const existingOrder = await this.findRecentEquivalentOrder(
      userId,
      effectiveEventId,
      requestedSignature,
    );
    if (existingOrder) {
      return existingOrder;
    }

    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: effectiveEventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    let total = 0;

    // Validate all items and calculate total
    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      // C7: FOOD ORDER LOGIC - Only requires deliveryDate, no date range
      if (product.type === ProductType.FOOD) {
        if (!item.deliveryDate) {
          throw new BadRequestException(
            `${product.name} requires deliveryDate`,
          );
        }

        // Optional daily capacity check for food items
        if (product.dailyCapacity) {
          const deliveryDate = new Date(item.deliveryDate);
          const startOfDay = new Date(deliveryDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(deliveryDate.setHours(23, 59, 59, 999));

          // Count existing orders for this food item on the same day
          const existingOrders = await this.prisma.orderItem.aggregate({
            where: {
              productId: item.productId,
              deliveryDate: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _sum: {
              quantity: true,
            },
          });

          const currentQuantity = existingOrders._sum.quantity || 0;
          if (currentQuantity + item.quantity > product.dailyCapacity) {
            throw new BadRequestException(
              `${product.name} exceeds daily capacity of ${product.dailyCapacity} on ${item.deliveryDate}`,
            );
          }
        }
      } else if (product.type === ProductType.SERVICE) {
        // Services still require a schedule window at order time.
        if (!item.startDate || !item.endDate) {
          throw new BadRequestException(
            `${product.name} requires startDate and endDate`,
          );
        }

        const available = await this.productsService.checkAvailability(
          product.id,
          item.startDate,
          item.endDate,
          item.quantity,
        );

        if (!available) {
          throw new BadRequestException(
            `${product.name} not available for the requested dates`,
          );
        }
      } else if (
        product.type === ProductType.RENTAL &&
        item.startDate &&
        item.endDate
      ) {
        // Rental windows can be assigned later by stock keeper admin.
        const available = await this.productsService.checkAvailability(
          product.id,
          item.startDate,
          item.endDate,
          item.quantity,
        );

        if (!available) {
          throw new BadRequestException(
            `${product.name} not available for the requested dates`,
          );
        }
      }

      total += product.price * item.quantity;
    }

    // Create the order with items (provisional, not confirmed yet)
    return this.prisma.order.create({
      data: {
        userId,
        eventId: effectiveEventId,
        totalAmount: total,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            startDate: item.startDate ? new Date(item.startDate) : null,
            endDate: item.endDate ? new Date(item.endDate) : null,
            deliveryDate: item.deliveryDate
              ? new Date(item.deliveryDate)
              : null,
          })),
        },
      },
      include: {
        items: true,
        user: true,
        event: true,
      },
    });
  }

  private async findRecentEquivalentOrder(
    userId: string,
    eventId: string,
    signature: string,
  ) {
    const windowStart = new Date(Date.now() - 30 * 60 * 1000);
    const recentOrders = await this.prisma.order.findMany({
      where: {
        userId,
        eventId,
        status: { in: [OrderStatus.PENDING, OrderStatus.PAID] },
        createdAt: { gte: windowStart },
      },
      include: {
        items: true,
        user: true,
        event: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return (
      recentOrders.find(
        (order: any) => this.buildOrderItemsSignature(order.items) === signature,
      ) || null
    );
  }

  private buildOrderItemsSignature(items: any[]) {
    return items
      .map((item: any) =>
        [
          item.productId,
          Number(item.quantity || 0),
          Number(item.price || 0),
          item.startDate ? new Date(item.startDate).toISOString() : '',
          item.endDate ? new Date(item.endDate).toISOString() : '',
          item.deliveryDate ? new Date(item.deliveryDate).toISOString() : '',
        ].join('|'),
      )
      .sort()
      .join('::');
  }

  private async ensureEventForOrder(userId: string, eventId?: string) {
    if (eventId) {
      return eventId;
    }

    const now = new Date();
    const event = await this.prisma.event.create({
      data: {
        userId,
        title: `Rental Request - ${now.toISOString().slice(0, 10)}`,
        eventDate: now,
        location: 'To be assigned by stock keeper admin',
      },
    });

    return event.id;
  }

  async confirmOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Lock in availability for rentals/services
    for (const item of order.items) {
      if (item.startDate && item.endDate) {
        await this.prisma.availability.create({
          data: {
            productId: item.productId,
            startDate: item.startDate,
            endDate: item.endDate,
            quantity: item.quantity,
          },
        });
      }
    }

    // Record commission and vendor earnings per order item (C8)
    const commissionLogs = order.items.map((item) => {
      const grossAmount = item.price * item.quantity;
      const commissionAmount = Number(
        (grossAmount * OrdersService.PLATFORM_COMMISSION_RATE).toFixed(2),
      );
      const vendorEarnings = Number((grossAmount - commissionAmount).toFixed(2));

      return {
        orderId: order.id,
        orderItemId: item.id,
        vendorId: item.product.vendorId,
        grossAmount,
        commissionAmount,
        amount: vendorEarnings,
        status: 'PENDING_PAYOUT',
      };
    });

    if (commissionLogs.length > 0) {
      await this.prisma.commissionLog.createMany({
        data: commissionLogs,
        skipDuplicates: true,
      });
    }

    // Update order status to PAID
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
      include: { items: true, payment: true },
    });

    // C8: notify involved vendors about the new paid order
    await this.notifyVendor(orderId);

    return updatedOrder;
  }

  async getOrder(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        event: true,
        payment: true,
      },
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        event: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // C8: ORDER STATUS LIFECYCLE with role-based authorization
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string,
    userRole: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, event: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    const validTransition = this.isValidStatusTransition(order.status, status);
    if (!validTransition) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${status}`,
      );
    }

    // Check authorization based on role and target status
    if (status === OrderStatus.CANCELLED) {
      // C8: Only admin can cancel after payment
      if (order.status !== OrderStatus.PENDING && userRole !== 'ADMIN') {
        throw new ForbiddenException('Only admins can cancel paid orders');
      }
      if (userRole !== 'ADMIN') {
        throw new ForbiddenException('Only admins can cancel orders');
      }
    } else if (status === OrderStatus.IN_PROGRESS) {
      // C8: Vendor can mark IN_PROGRESS
      const vendorIds = order.items.map((item) => item.product.vendorId);
      const isVendor = userRole === 'VENDOR' && vendorIds.includes(userId);
      if (!isVendor && userRole !== 'ADMIN') {
        throw new ForbiddenException(
          'Only vendors for this order can mark it as IN_PROGRESS',
        );
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: { include: { product: true } }, payment: true },
    });
  }

  private isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  // C8: System marks COMPLETED after event date (call this from a cron job or scheduler)
  async markCompletedAfterEventDate() {
    const now = new Date();
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.IN_PROGRESS,
        event: {
          eventDate: { lte: now },
        },
      },
      include: { event: true },
    });

    for (const order of orders) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED },
      });
    }

    return orders;
  }

  // C9: VENDOR VIEW - Get orders for a specific vendor's products
  async getVendorOrders(vendorId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              vendorId: vendorId,
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: true,
              },
            },
          },
        },
        user: true,
        event: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // C8: Notify all vendors attached to an order
  async notifyVendor(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const uniqueVendors = new Map<string, { email: string; businessName: string }>();
    for (const item of order.items) {
      const vendor = item.product?.vendor;
      const vendorUser = vendor?.user;
      if (!vendor?.id || !vendorUser?.email) {
        continue;
      }

      uniqueVendors.set(vendor.id, {
        email: vendorUser.email,
        businessName: vendor.businessName,
      });
    }

    const emailJobs = Array.from(uniqueVendors.values()).map((vendor) =>
      this.emailService.sendVendorNewOrder(
        vendor.email,
        vendor.businessName,
        order.id,
        order.event.title,
        order.totalAmount,
      ),
    );

    const results = await Promise.allSettled(emailJobs);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to send vendor order email (${index + 1}/${results.length}) for order ${orderId}`,
        );
      }
    });
  }
}
