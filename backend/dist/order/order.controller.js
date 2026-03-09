"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("./order.service");
const app_error_1 = require("../error/app.error");
class OrderController {
    orderService;
    constructor() {
        this.orderService = new order_service_1.OrderService();
    }
    // Buy products
    buyProducts = async (req, res, next) => {
        try {
            const buyerId = req.user?.sellerId; // buyer id from JWT
            if (!buyerId)
                throw new app_error_1.AppError("Invalid buyer", 401, {});
            const { products } = req.body; // array of { productId, quantity }
            if (!products || !Array.isArray(products) || products.length === 0) {
                throw new app_error_1.AppError("No products selected", 400, {});
            }
            const order = await this.orderService.createOrder(buyerId, products);
            res.status(201).json({
                message: "Order placed successfully",
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    };
    getSellerOrders = async (req, res, next) => {
        try {
            const sellerId = req.user?.sellerId; // seller id from JWT
            if (!sellerId)
                throw new app_error_1.AppError("Invalid seller", 401, {});
            const orders = await this.orderService.getSellerOrders(sellerId);
            res.status(200).json({
                message: "Orders for your products fetched successfully",
                data: orders
            });
        }
        catch (error) {
            next(error);
        }
    };
    getBuyerOrders = async (req, res, next) => {
        try {
            const buyerId = req.user?.sellerId; // buyer id from JWT
            if (!buyerId)
                throw new app_error_1.AppError("Invalid buyer", 401, {});
            const orders = await this.orderService.getBuyerOrders(buyerId);
            res.status(200).json({
                message: "Your orders fetched successfully",
                data: orders
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map