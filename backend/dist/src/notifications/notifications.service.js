"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let NotificationsService = class NotificationsService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async sendNotification(userId, type, title, message, data) {
        return this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data,
            },
        });
    }
    async getNotifications(userId, unreadOnly = false) {
        return this.prisma.notification.findMany({
            where: { userId, ...(unreadOnly && { read: false }) },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(notificationId) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
    async deleteNotification(id) {
        return this.prisma.notification.delete({ where: { id } });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map