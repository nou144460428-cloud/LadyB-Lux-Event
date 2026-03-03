"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = exports.ConfirmPaymentDto = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const crypto = __importStar(require("crypto"));
class ConfirmPaymentDto {
    reference;
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async initiatePayment(body, req) {
        return this.paymentsService.initiatePayment(body.orderId, req.user.id, body.provider ?? 'paystack');
    }
    async verifyPayment(body, req) {
        return this.paymentsService.verifyPayment(body.reference, req.user.id, body.provider);
    }
    async handlePaystackWebhook(payload, req) {
        const secret = process.env.PAYSTACK_SECRET;
        if (!secret) {
            throw new common_1.BadRequestException('PAYSTACK_SECRET not configured');
        }
        const rawBody = req.rawBody;
        const contentForHash = rawBody && Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(payload));
        const hash = crypto
            .createHmac('sha512', secret)
            .update(contentForHash)
            .digest('hex');
        const signature = Array.isArray(req.headers['x-paystack-signature'])
            ? req.headers['x-paystack-signature'][0]
            : req.headers['x-paystack-signature'];
        if (!signature) {
            throw new common_1.BadRequestException('Missing webhook signature');
        }
        const signatureBuffer = Buffer.from(signature, 'utf8');
        const hashBuffer = Buffer.from(hash, 'utf8');
        const isValid = signatureBuffer.length === hashBuffer.length &&
            crypto.timingSafeEqual(hashBuffer, signatureBuffer);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        return this.paymentsService.handlePaystackWebhook(payload);
    }
    async handleMonnifyWebhook(payload, req) {
        const secret = this.paymentsService.getMonnifyWebhookSecret();
        if (!secret) {
            throw new common_1.BadRequestException('MONNIFY_WEBHOOK_SECRET or MONNIFY_SECRET_KEY not configured');
        }
        const rawBody = req.rawBody;
        const contentForHash = rawBody && Buffer.isBuffer(rawBody)
            ? rawBody
            : Buffer.from(JSON.stringify(payload));
        const hash = crypto
            .createHmac('sha512', secret)
            .update(contentForHash)
            .digest('hex');
        const signature = Array.isArray(req.headers['monnify-signature'])
            ? req.headers['monnify-signature'][0]
            : req.headers['monnify-signature'];
        if (!signature) {
            throw new common_1.BadRequestException('Missing monnify-signature');
        }
        const signatureBuffer = Buffer.from(signature, 'utf8');
        const hashBuffer = Buffer.from(hash, 'utf8');
        const isValid = signatureBuffer.length === hashBuffer.length &&
            crypto.timingSafeEqual(hashBuffer, signatureBuffer);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid Monnify webhook signature');
        }
        return this.paymentsService.handleMonnifyWebhook(payload);
    }
    async initiatePaymentLegacy(orderId, body) {
        throw new common_1.GoneException('Legacy payment endpoint disabled. Use POST /payments/initiate.');
    }
    async confirmPayment(orderId, dto) {
        throw new common_1.GoneException('Legacy payment endpoint disabled. Use webhook or POST /payments/verify.');
    }
    async failPayment(orderId, body) {
        throw new common_1.GoneException('Legacy payment endpoint disabled.');
    }
    async getPayment(orderId) {
        return this.paymentsService.getPayment(orderId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('webhook/paystack'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handlePaystackWebhook", null);
__decorate([
    (0, common_1.Post)('webhook/monnify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleMonnifyWebhook", null);
__decorate([
    (0, common_1.Post)(':orderId/initiate'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiatePaymentLegacy", null);
__decorate([
    (0, common_1.Post)(':orderId/confirm'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConfirmPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Post)(':orderId/fail'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "failPayment", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map