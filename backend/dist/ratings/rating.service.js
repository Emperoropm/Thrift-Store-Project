"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingService = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../error/app.error");
const prisma = new client_1.PrismaClient();
class RatingService {
    // Rate a seller
    async rateSeller(reviewerId, sellerId, score, comment, orderId) {
        if (score < 1 || score > 5) {
            throw new app_error_1.AppError("Rating must be between 1 and 5", 400, {});
        }
        if (reviewerId === sellerId) {
            throw new app_error_1.AppError("You cannot rate yourself", 400, {});
        }
        const seller = await prisma.user.findUnique({
            where: { id: sellerId }
        });
        if (!seller) {
            throw new app_error_1.AppError("Seller not found", 404, {});
        }
        const rating = await prisma.userRating.create({
            data: {
                reviewerId,
                sellerId,
                score,
                comment: comment ?? null,
                orderId: orderId
            }
        });
        return rating;
    }
    // Get all ratings of a seller
    async getSellerRatings(sellerId) {
        return prisma.userRating.findMany({
            where: { sellerId },
            include: {
                reviewer: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }
    // Get seller average rating
    async getSellerRatingSummary(sellerId) {
        const result = await prisma.userRating.aggregate({
            where: { sellerId },
            _avg: { score: true },
            _count: true
        });
        return {
            averageRating: result._avg.score ?? 0,
            totalReviews: result._count
        };
    }
}
exports.RatingService = RatingService;
//# sourceMappingURL=rating.service.js.map