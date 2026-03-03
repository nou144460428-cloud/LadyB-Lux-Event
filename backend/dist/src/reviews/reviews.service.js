"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_options_1 = require("../prisma/prisma-client-options");
let ReviewsService = class ReviewsService {
    prisma = (0, prisma_client_options_1.createPrismaClient)();
    async createReview(userId, vendorId, data) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id: vendorId },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return this.prisma.review.create({
            data: {
                userId,
                vendorId,
                rating: data.rating,
                comment: data.comment,
            },
        });
    }
    async getVendorReviews(vendorId) {
        return this.prisma.review.findMany({
            where: { vendorId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getVendorRating(vendorId) {
        const reviews = await this.prisma.review.findMany({ where: { vendorId } });
        if (reviews.length === 0)
            return null;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        return {
            averageRating: parseFloat(avgRating.toFixed(2)),
            totalReviews: reviews.length,
            ratingBreakdown: {
                '5': reviews.filter((r) => r.rating === 5).length,
                '4': reviews.filter((r) => r.rating === 4).length,
                '3': reviews.filter((r) => r.rating === 3).length,
                '2': reviews.filter((r) => r.rating === 2).length,
                '1': reviews.filter((r) => r.rating === 1).length,
            },
        };
    }
    async deleteReview(reviewId) {
        return this.prisma.review.delete({ where: { id: reviewId } });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)()
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map