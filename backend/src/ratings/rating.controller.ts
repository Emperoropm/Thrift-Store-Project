import { Request, Response, NextFunction } from "express";
import { RatingService } from "./rating.service";
import { AppError } from "../error/app.error";

export class RatingController {

  ratingService = new RatingService();

  rateSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const reviewerId = (req as any).user.id;
      const { sellerId, score, comment, orderId } = req.body;

      if (!sellerId || !score) {
        throw new AppError("sellerId and score are required", 400, {});
      }

      const rating = await this.ratingService.rateSeller(
        reviewerId,
        sellerId,
        score,
        comment,
        orderId
      );

      res.status(201).json({
        message: "Seller rated successfully",
        data: rating
      });

    } catch (error) {
      next(error);
    }
  };

  getSellerRatings = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const sellerId = Number(req.params.sellerId);

      const ratings = await this.ratingService.getSellerRatings(sellerId);
      const summary = await this.ratingService.getSellerRatingSummary(sellerId);

      res.status(200).json({
        message: "Seller ratings fetched successfully",
        data: {
          ratings,
          summary
        }
      });

    } catch (error) {
      next(error);
    }
  };

}