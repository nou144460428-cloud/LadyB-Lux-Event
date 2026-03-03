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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    async sendOrderConfirmation(email, orderId, totalAmount) {
        const html = `
      <h2>Order Confirmed!</h2>
      <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
      <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
      <p>You will receive updates on your order status soon.</p>
      <p><a href="${process.env.FRONTEND_URL}/orders/${orderId}">View Order</a></p>
    `;
        return this.sendMail(email, 'Order Confirmation', html);
    }
    async sendPaymentSuccess(email, orderId, reference) {
        const html = `
      <h2>Payment Successful! 🎉</h2>
      <p>Your payment for order <strong>#${orderId}</strong> has been processed successfully.</p>
      <p><strong>Reference:</strong> ${reference}</p>
      <p>Vendors will start preparing your order.</p>
      <p><a href="${process.env.FRONTEND_URL}/orders/${orderId}">Track Order</a></p>
    `;
        return this.sendMail(email, 'Payment Successful', html);
    }
    async sendPaymentFailed(email, orderId) {
        const html = `
      <h2>Payment Failed</h2>
      <p>Unfortunately, your payment for order <strong>#${orderId}</strong> could not be processed.</p>
      <p>Please try again or contact support.</p>
      <p><a href="${process.env.FRONTEND_URL}/checkout">Retry Payment</a></p>
    `;
        return this.sendMail(email, 'Payment Failed', html);
    }
    async sendOrderReady(email, orderId) {
        const html = `
      <h2>Your Order is Ready!</h2>
      <p>Order <strong>#${orderId}</strong> is now ready for pickup or delivery.</p>
      <p>Please check your dashboard for details.</p>
      <p><a href="${process.env.FRONTEND_URL}/orders/${orderId}">View Order</a></p>
    `;
        return this.sendMail(email, 'Order Ready', html);
    }
    async sendVendorApproved(email, businessName) {
        const html = `
      <h2>Vendor Account Approved! 🎉</h2>
      <p>Congratulations <strong>${businessName}</strong>!</p>
      <p>Your vendor account has been approved and is now active.</p>
      <p>You can now add products and start receiving orders.</p>
      <p><a href="${process.env.FRONTEND_URL}/dashboard/vendor">Go to Dashboard</a></p>
    `;
        return this.sendMail(email, 'Vendor Account Approved', html);
    }
    async sendVendorNewOrder(email, businessName, orderId, eventTitle, totalAmount) {
        const html = `
      <h2>New Order Received</h2>
      <p>Hello <strong>${businessName}</strong>,</p>
      <p>You have a new order to fulfill.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Event:</strong> ${eventTitle}</p>
      <p><strong>Order Value:</strong> ₦${totalAmount.toLocaleString()}</p>
      <p><a href="${process.env.FRONTEND_URL}/dashboard/vendor">View in Vendor Dashboard</a></p>
    `;
        return this.sendMail(email, 'New Order Received', html);
    }
    async sendMail(to, subject, html) {
        try {
            return await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject,
                html,
            });
        }
        catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map