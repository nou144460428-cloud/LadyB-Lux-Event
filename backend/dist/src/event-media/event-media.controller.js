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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventMediaController = void 0;
const common_1 = require("@nestjs/common");
const event_media_service_1 = require("./event-media.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/guards/roles.decorator");
const client_1 = require("@prisma/client");
let EventMediaController = class EventMediaController {
    eventMediaService;
    constructor(eventMediaService) {
        this.eventMediaService = eventMediaService;
    }
    async list(type) {
        return this.eventMediaService.list(type);
    }
    async create(body) {
        return this.eventMediaService.create(body);
    }
    async update(id, body) {
        const updated = await this.eventMediaService.update(id, body);
        if (!updated) {
            throw new common_1.NotFoundException('Event media item not found');
        }
        return updated;
    }
    async remove(id) {
        return this.eventMediaService.remove(id);
    }
};
exports.EventMediaController = EventMediaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventMediaController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventMediaController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventMediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventMediaController.prototype, "remove", null);
exports.EventMediaController = EventMediaController = __decorate([
    (0, common_1.Controller)('event-media'),
    __metadata("design:paramtypes", [event_media_service_1.EventMediaService])
], EventMediaController);
//# sourceMappingURL=event-media.controller.js.map