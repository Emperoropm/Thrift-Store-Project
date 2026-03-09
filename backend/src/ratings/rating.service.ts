import { PrismaClient } from "@prisma/client";
import { AppError } from "../error/app.error";

const prisma = new PrismaClient();

export class RatingService {

  // Rate a seller
  async rateSeller(
    reviewerId: number,
    sellerId: number,
    score: number,
    comment?: string,
    orderId?: number
  ) {

    if (score < 1 || score > 5) {
      throw new AppError("Rating must be between 1 and 5", 400, {});
    }

    if (reviewerId === sellerId) {
      throw new AppError("You cannot rate yourself", 400, {});
    }

    const seller = await prisma.user.findUnique({
      where: { id: sellerId }
    });

    if (!seller) {
      throw new AppError("Seller not found", 404, {});
    }

    const rating = await prisma.userRating.create({
      data: {
        reviewerId,
        sellerId,
        score,
        comment: comment ?? null,
        orderId
      }
    });

    return rating;
  }

  // Get all ratings of a seller
  async getSellerRatings(sellerId: number) {
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
  async getSellerRatingSummary(sellerId: number) {
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