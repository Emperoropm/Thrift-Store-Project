"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const app_error_1 = require("../error/app.error");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const rating_service_1 = require("../ratings/rating.service");
const product_service_1 = require("../product/product.service");
class UserController {
    userService;
    productService; // Add product service
    ratingService;
    constructor() {
        this.userService = new user_service_1.UserService();
        this.productService = new product_service_1.ProductService(); // Initialize product service
        this.ratingService = new rating_service_1.RatingService();
    }
    getProfile = async (req, res, next) => {
        try {
            // Try to get userId from either id or sellerId
            const userId = req.user?.id || req.user?.sellerId;
            if (!userId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            const user = await this.userService.getUserById(userId);
            res.status(200).json({
                message: "User info fetched successfully",
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    };
    uploadPhoto = async (req, res, next) => {
        try {
            // Try to get userId from either id or sellerId
            const userId = req.user?.id || req.user?.sellerId;
            if (!userId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            if (!req.file) {
                throw new app_error_1.AppError("No photo uploaded", 400, {});
            }
            console.log('Uploading photo for user:', userId);
            console.log('File:', req.file);
            // Get the current user to delete old photo if exists
            const currentUser = await this.userService.getUserById(userId);
            // Delete old photo file if exists
            if (currentUser.photo) {
                const oldPhotoPath = path_1.default.join(__dirname, '../../public', currentUser.photo);
                if (fs_1.default.existsSync(oldPhotoPath)) {
                    fs_1.default.unlinkSync(oldPhotoPath);
                }
            }
            // Save new photo path
            const photoPath = `/uploads/users/${req.file.filename}`;
            const updatedUser = await this.userService.updateUserPhoto(userId, photoPath);
            res.status(200).json({
                message: "Photo uploaded successfully",
                data: updatedUser
            });
        }
        catch (error) {
            console.error('Upload photo error:', error);
            next(error);
        }
    };
    // 👇 ADD THIS: Remove user photo
    removePhoto = async (req, res, next) => {
        try {
            const userId = req.user?.sellerId;
            if (!userId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            // Get current user to delete photo file
            const currentUser = await this.userService.getUserById(userId);
            if (currentUser.photo) {
                const photoPath = path_1.default.join(__dirname, '../../public', currentUser.photo);
                if (fs_1.default.existsSync(photoPath)) {
                    fs_1.default.unlinkSync(photoPath);
                }
            }
            // Remove photo from database
            const updatedUser = await this.userService.removeUserPhoto(userId);
            res.status(200).json({
                message: "Photo removed successfully",
                data: updatedUser
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Add to UserController class
    getSellerPhoto = async (req, res, next) => {
        try {
            const sellerId = parseInt(req.params.sellerId);
            if (isNaN(sellerId)) {
                throw new app_error_1.AppError("Invalid seller ID", 400, {});
            }
            const user = await this.userService.getUserById(sellerId);
            res.status(200).json({
                message: "Seller photo fetched successfully",
                data: {
                    photo: user.photo
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Add to UserController class
    getSellerProfile = async (req, res, next) => {
        try {
            const sellerId = parseInt(req.params.sellerId);
            if (isNaN(sellerId)) {
                throw new app_error_1.AppError("Invalid seller ID", 400, {});
            }
            const seller = await this.userService.getSellerProfile(sellerId);
            // Get seller's rating summary
            const ratingService = new rating_service_1.RatingService();
            const ratingSummary = await ratingService.getSellerRatingSummary(sellerId);
            res.status(200).json({
                message: "Seller profile fetched successfully",
                data: {
                    ...seller,
                    rating: ratingSummary
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
    getSellerProducts = async (req, res, next) => {
        try {
            const sellerId = parseInt(req.params.sellerId);
            if (isNaN(sellerId)) {
                throw new app_error_1.AppError("Invalid seller ID", 400, {});
            }
            // Fetch all products (including sold) for stats
            const allProducts = await this.productService.getProductsByAnySellerId(sellerId, true);
            // Separate into available and sold
            const availableProducts = allProducts.filter(p => p.quantity > 0 && p.status === 'APPROVED');
            const soldProducts = allProducts.filter(p => p.quantity === 0);
            res.status(200).json({
                message: "Seller products fetched successfully",
                data: {
                    all: allProducts,
                    available: availableProducts,
                    sold: soldProducts
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map