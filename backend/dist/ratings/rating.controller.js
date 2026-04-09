"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingController = void 0;
const rating_service_1 = require("./rating.service");
const app_error_1 = require("../error/app.error");
class RatingController {
    ratingService = new rating_service_1.RatingService();
    rateSeller = async (req, res, next) => {
        try {
            const reviewerId = req.user.id;
            const { sellerId, score, comment, orderId } = req.body;
            if (!sellerId || !score) {
                throw new app_error_1.AppError("sellerId and score are required", 400, {});
            }
            const rating = await this.ratingService.rateSeller(reviewerId, sellerId, score, comment, orderId);
            res.status(201).json({
                message: "Seller rated successfully",
                data: rating
            });
        }
        catch (error) {
            next(error);
        }
    };
    getSellerRatings = async (req, res, next) => {
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
        }
        catch (error) {
            next(error);
        }
    };
}
exports.RatingController = RatingController;
//# sourceMappingURL=rating.controller.js.map