"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let WhatsappService = class WhatsappService {
    apiBase = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com';
    apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    listChannels() {
        return [
            {
                id: 'WHATSAPP_BUSINESS',
                name: 'WhatsApp Business API',
                enabled: Boolean(this.phoneNumberId && this.accessToken),
            },
        ];
    }
    async sendChatMessage(input) {
        this.ensureConfigured();
        if (!input.to?.trim()) {
            throw new common_1.BadRequestException('Recipient phone is required');
        }
        if (!input.message?.trim()) {
            throw new common_1.BadRequestException('Message is required');
        }
        const response = await axios_1.default.post(this.messagesUrl(), {
            messaging_product: 'whatsapp',
            to: input.to.trim(),
            type: 'text',
            text: {
                body: input.message.trim(),
            },
        }, {
            headers: this.headers(),
        });
        return {
            success: true,
            channel: input.channel || 'WHATSAPP_BUSINESS',
            data: response.data,
        };
    }
    async sendBroadcast(input) {
        this.ensureConfigured();
        if (!Array.isArray(input.recipients) || input.recipients.length === 0) {
            throw new common_1.BadRequestException('At least one recipient is required');
        }
        if (!input.message?.trim()) {
            throw new common_1.BadRequestException('Broadcast message is required');
        }
        const results = await Promise.all(input.recipients.map(async (recipient) => {
            try {
                const res = await this.sendChatMessage({
                    to: recipient,
                    message: input.message,
                    channel: input.channel,
                });
                return {
                    recipient,
                    success: true,
                    data: res.data,
                };
            }
            catch (error) {
                return {
                    recipient,
                    success: false,
                    error: error?.response?.data || error?.message || 'Failed to send',
                };
            }
        }));
        const successCount = results.filter((r) => r.success).length;
        return {
            channel: input.channel || 'WHATSAPP_BUSINESS',
            total: input.recipients.length,
            successCount,
            failedCount: input.recipients.length - successCount,
            results,
        };
    }
    ensureConfigured() {
        if (!this.phoneNumberId || !this.accessToken) {
            throw new common_1.InternalServerErrorException('WhatsApp Business API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN');
        }
    }
    messagesUrl() {
        return `${this.apiBase}/${this.apiVersion}/${this.phoneNumberId}/messages`;
    }
    headers() {
        return {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        };
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)()
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map