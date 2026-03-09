"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const product_model_1 = require("./product.model");
const class_validator_1 = require("class-validator");
const app_error_1 = require("../error/app.error");
const product_patch_model_1 = require("./product.patch.model");
class ProductController {
    productService;
    constructor() {
        this.productService = new product_service_1.ProductService();
        this.insertProduct = this.insertProduct.bind(this);
        this.getProducts = this.getProducts.bind(this);
    }
    async insertProduct(req, res, next) {
        try {
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!userId || !userRole) {
                throw new app_error_1.AppError("User information missing from token", 401, {});
            }
            const product = new product_model_1.ProductModel(req.body.title, req.body.price, req.body.quantity, userId, req.body.description, req.body.imageUrl, req.body.categoryId);
            const errors = await (0, class_validator_1.validate)(product);
            if (errors.length > 0) {
                const validationError = {};
                for (const err of errors) {
                    if (err.constraints) {
                        const message = Object.values(err.constraints);
                        if (message.length > 0 && typeof message[0] === "string") {
                            validationError[err.property] = message[0];
                        }
                    }
                }
                throw new app_error_1.AppError("Validation failed", 400, validationError);
            }
            const result = await this.productService.insertProduct({
                ...req.body
            }, userId);
            res.status(201).json({
                message: "Product submitted for admin approval",
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProducts(request, response, next) {
        try {
            const userId = request.user?.id;
            const userRole = request.user?.role;
            const result = await this.productService.getProducts(userId, userRole);
            response.status(200).json({
                message: "Products fetched successfully",
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
    getProductsByCategory = async (req, res, next) => {
        try {
            const categoryId = Number(req.params.categoryId);
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (isNaN(categoryId) || categoryId <= 0) {
                throw new app_error_1.AppError("Invalid categoryId", 400, { message: "Error" });
            }
            const result = await this.productService.getProductsByCategory(categoryId, userId, userRole);
            res.status(200).json({
                message: `Products in category ${categoryId} fetched successfully`,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateProduct = async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (isNaN(id) || id <= 0 || !userId) {
                throw new app_error_1.AppError("Invalid product ID or user ID", 400, {});
            }
            // Validate only provided fields
            const productData = Object.assign(new product_patch_model_1.ProductPatchModel(), req.body);
            const errors = await (0, class_validator_1.validate)(productData, { skipMissingProperties: true });
            if (errors.length > 0) {
                const validationError = {};
                for (const err of errors) {
                    if (err.constraints) {
                        const message = Object.values(err.constraints);
                        if (message.length > 0 && typeof message[0] === "string") {
                            validationError[err.property] = message[0];
                        }
                    }
                }
                throw new app_error_1.AppError("Validation failed", 400, validationError);
            }
            const result = await this.productService.updateProduct(id, userId, userRole, req.body);
            const message = result.status === 'PENDING'
                ? 'Product updated and sent for re-approval'
                : 'Product updated successfully';
            res.status(200).json({
                message,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    };
    deleteProduct = async (req, res, next) => {
        try {
            const productId = Number(req.params.id);
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!productId || isNaN(productId)) {
                throw new app_error_1.AppError("Invalid product ID", 400, {});
            }
            if (!userId) {
                throw new app_error_1.AppError("Invalid user ID", 401, {});
            }
            // Call service to delete
            const deletedProduct = await this.productService.deleteProduct(productId, userId, userRole);
            res.status(200).json({
                message: "Product deleted successfully",
                data: deletedProduct
            });
        }
        catch (error) {
            next(error);
        }
    };
    getProductsBySellerId = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { status } = req.query;
            if (!userId || userId <= 0) {
                throw new app_error_1.AppError("Invalid userId", 400, { message: "Error" });
            }
            const products = await this.productService.getProductsBySellerId(userId, status);
            res.status(200).json({
                message: `Products fetched successfully`,
                data: products,
            });
        }
        catch (error) {
            next(error);
        }
    };
    // ========== ADMIN CONTROLLER METHODS ==========
    getPendingProducts = async (req, res, next) => {
        try {
            const pendingProducts = await this.productService.getPendingProducts();
            res.status(200).json({
                message: "Pending products fetched successfully",
                data: pendingProducts
            });
        }
        catch (error) {
            next(error);
        }
    };
    approveProduct = async (req, res, next) => {
        try {
            const productId = Number(req.params.id);
            const adminId = req.user.id;
            if (!productId || isNaN(productId)) {
                throw new app_error_1.AppError("Invalid product ID", 400, {});
            }
            const result = await this.productService.approveProduct(productId, adminId);
            res.status(200).json({
                message: "Product approved successfully",
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    };
    rejectProduct = async (req, res, next) => {
        try {
            const productId = Number(req.params.id);
            const adminId = req.user.id;
            const { reason } = req.body;
            if (!productId || isNaN(productId)) {
                throw new app_error_1.AppError("Invalid product ID", 400, {});
            }
            const result = await this.productService.rejectProduct(productId, adminId, reason);
            res.status(200).json({
                message: "Product rejected successfully",
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateProductStatus = async (req, res, next) => {
        try {
            const productId = Number(req.params.id);
            const { status, reason } = req.body;
            if (!productId || isNaN(productId)) {
                throw new app_error_1.AppError("Invalid product ID", 400, {});
            }
            const result = await this.productService.updateProductStatus(productId, status, reason);
            res.status(200).json({
                message: "Product status updated successfully",
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map