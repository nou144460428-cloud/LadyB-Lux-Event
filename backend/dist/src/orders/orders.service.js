"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
const client_1 = require("@prisma/client");
const products_service_1 = require("../products/products.service");
const email_service_1 = require("../email/email.service");
let OrdersService = class OrdersService {
    static { OrdersService_1 = this; }
    productsService;
    emailService;
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    logger = new common_1.Logger(OrdersService_1.name);
    static PLATFORM_COMMISSION_RATE = 0.15;
    constructor(productsService, emailService) {
        this.productsService = productsService;
        this.emailService = emailService;
    }
    async createOrder(userId, dto) {
        const effectiveEventId = await this.ensureEventForOrder(userId, dto.eventId);
        const requestedSignature = this.buildOrderItemsSignature(dto.items);
        const existingOrder = await this.findRecentEquivalentOrder(userId, effectiveEventId, requestedSignature);
        if (existingOrder) {
            return existingOrder;
        }
        const event = await this.prisma.event.findUnique({
            where: { id: effectiveEventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        let total = 0;
        for (const item of dto.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            }
            if (product.type === client_1.ProductType.FOOD) {
                if (!item.deliveryDate) {
                    throw new common_1.BadRequestException(`${product.name} requires deliveryDate`);
                }
                if (product.dailyCapacity) {
                    const deliveryDate = new Date(item.deliveryDate);
                    const startOfDay = new Date(deliveryDate.setHours(0, 0, 0, 0));
                    const endOfDay = new Date(deliveryDate.setHours(23, 59, 59, 999));
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
                        throw new common_1.BadRequestException(`${product.name} exceeds daily capacity of ${product.dailyCapacity} on ${item.deliveryDate}`);
                    }
                }
            }
            else if (product.type === client_1.ProductType.SERVICE) {
                if (!item.startDate || !item.endDate) {
                    throw new common_1.BadRequestException(`${product.name} requires startDate and endDate`);
                }
                const available = await this.productsService.checkAvailability(product.id, item.startDate, item.endDate, item.quantity);
                if (!available) {
                    throw new common_1.BadRequestException(`${product.name} not available for the requested dates`);
                }
            }
            else if (product.type === client_1.ProductType.RENTAL &&
                item.startDate &&
                item.endDate) {
                const available = await this.productsService.checkAvailability(product.id, item.startDate, item.endDate, item.quantity);
                if (!available) {
                    throw new common_1.BadRequestException(`${product.name} not available for the requested dates`);
                }
            }
            total += product.price * item.quantity;
        }
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
    async findRecentEquivalentOrder(userId, eventId, signature) {
        const windowStart = new Date(Date.now() - 30 * 60 * 1000);
        const recentOrders = await this.prisma.order.findMany({
            where: {
                userId,
                eventId,
                status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PAID] },
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
        return (recentOrders.find((order) => this.buildOrderItemsSignature(order.items) === signature) || null);
    }
    buildOrderItemsSignature(items) {
        return items
            .map((item) => [
            item.productId,
            Number(item.quantity || 0),
            Number(item.price || 0),
            item.startDate ? new Date(item.startDate).toISOString() : '',
            item.endDate ? new Date(item.endDate).toISOString() : '',
            item.deliveryDate ? new Date(item.deliveryDate).toISOString() : '',
        ].join('|'))
            .sort()
            .join('::');
    }
    async ensureEventForOrder(userId, eventId) {
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
    async confirmOrder(orderId) {
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
            throw new common_1.NotFoundException('Order not found');
        }
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
        const commissionLogs = order.items.map((item) => {
            const grossAmount = item.price * item.quantity;
            const commissionAmount = Number((grossAmount * OrdersService_1.PLATFORM_COMMISSION_RATE).toFixed(2));
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
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: client_1.OrderStatus.PAID },
            include: { items: true, payment: true },
        });
        await this.notifyVendor(orderId);
        return updatedOrder;
    }
    async getOrder(orderId) {
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
    async getUserOrders(userId) {
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
    async updateOrderStatus(orderId, status, userId, userRole) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } }, event: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const validTransition = this.isValidStatusTransition(order.status, status);
        if (!validTransition) {
            throw new common_1.BadRequestException(`Cannot transition from ${order.status} to ${status}`);
        }
        if (status === client_1.OrderStatus.CANCELLED) {
            if (order.status !== client_1.OrderStatus.PENDING && userRole !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only admins can cancel paid orders');
            }
            if (userRole !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only admins can cancel orders');
            }
        }
        else if (status === client_1.OrderStatus.IN_PROGRESS) {
            const vendorIds = order.items.map((item) => item.product.vendorId);
            const isVendor = userRole === 'VENDOR' && vendorIds.includes(userId);
            if (!isVendor && userRole !== 'ADMIN') {
                throw new common_1.ForbiddenException('Only vendors for this order can mark it as IN_PROGRESS');
            }
        }
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: { items: { include: { product: true } }, payment: true },
        });
    }
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.PAID, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.PAID]: [client_1.OrderStatus.IN_PROGRESS, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.IN_PROGRESS]: [client_1.OrderStatus.COMPLETED],
            [client_1.OrderStatus.COMPLETED]: [],
            [client_1.OrderStatus.CANCELLED]: [],
        };
        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }
    async markCompletedAfterEventDate() {
        const now = new Date();
        const orders = await this.prisma.order.findMany({
            where: {
                status: client_1.OrderStatus.IN_PROGRESS,
                event: {
                    eventDate: { lte: now },
                },
            },
            include: { event: true },
        });
        for (const order of orders) {
            await this.prisma.order.update({
                where: { id: order.id },
                data: { status: client_1.OrderStatus.COMPLETED },
            });
        }
        return orders;
    }
    async getVendorOrders(vendorId) {
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
    async notifyVendor(orderId) {
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
            throw new common_1.NotFoundException('Order not found');
        }
        const uniqueVendors = new Map();
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
        const emailJobs = Array.from(uniqueVendors.values()).map((vendor) => this.emailService.sendVendorNewOrder(vendor.email, vendor.businessName, order.id, order.event.title, order.totalAmount));
        const results = await Promise.allSettled(emailJobs);
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.logger.error(`Failed to send vendor order email (${index + 1}/${results.length}) for order ${orderId}`);
            }
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        email_service_1.EmailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map