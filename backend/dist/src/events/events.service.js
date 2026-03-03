"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let EventsService = class EventsService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async createEvent(userId, dto) {
        const parsedEventDate = new Date(dto.eventDate);
        if (Number.isNaN(parsedEventDate.getTime())) {
            throw new common_1.BadRequestException('Invalid eventDate format. Use ISO date format, e.g. 2026-03-15');
        }
        return this.prisma.event.create({
            data: {
                userId,
                title: dto.title,
                eventDate: parsedEventDate,
                location: dto.location,
            },
        });
    }
    async getEvents(userId) {
        return this.prisma.event.findMany({
            where: { userId },
        });
    }
    async getEvent(id) {
        return this.prisma.event.findUnique({
            where: { id },
            include: { orders: true },
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)()
], EventsService);
//# sourceMappingURL=events.service.js.map