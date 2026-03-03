export declare class ReviewsService {
    private prisma;
    createReview(userId: string, vendorId: string, data: any): Promise<any>;
    getVendorReviews(vendorId: string): Promise<any>;
    getVendorRating(vendorId: string): Promise<{
        averageRating: number;
        totalReviews: any;
        ratingBreakdown: {
            '5': any;
            '4': any;
            '3': any;
            '2': any;
            '1': any;
        };
    } | null>;
    deleteReview(reviewId: string): Promise<any>;
}
