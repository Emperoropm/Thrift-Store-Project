export declare class RatingService {
    rateSeller(reviewerId: number, sellerId: number, score: number, comment?: string, orderId?: number): Promise<{
        id: number;
        createdAt: Date;
        sellerId: number;
        orderId: number | null;
        score: number;
        comment: string | null;
        reviewerId: number;
    }>;
    getSellerRatings(sellerId: number): Promise<({
        reviewer: {
            id: number;
            name: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        sellerId: number;
        orderId: number | null;
        score: number;
        comment: string | null;
        reviewerId: number;
    })[]>;
    getSellerRatingSummary(sellerId: number): Promise<{
        averageRating: number;
        totalReviews: number;
    }>;
}
//# sourceMappingURL=rating.service.d.ts.map