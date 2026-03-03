import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(req: any, body: any): Promise<any>;
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
    deleteReview(id: string): Promise<any>;
}
