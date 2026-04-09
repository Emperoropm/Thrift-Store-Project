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
    // Helper method to transform product images (array to first image)
    transformProductImages(product) {
        if (!product)
            return product;
        return {
            ...product,
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : null
        };
    }
    transformOrderItems(items) {
        if (!items || !Array.isArray(items))
            return items;
        return items.map((item) => ({
            ...item,
            product: this.transformProductImages(item.product)
        }));
    }
    transformOrder(order) {
        if (!order)
            return order;
        return {
            ...order,
            items: this.transformOrderItems(order.items)
        };
    }
    transformOrders(orders) {
        if (!orders || !Array.isArray(orders))
            return orders;
        return orders.map(order => this.transformOrder(order));
    }
    parseId(id, fieldName) {
        if (!id) {
            throw new app_error_1.AppError(`${fieldName} is required`, 400, {});
        }
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            throw new app_error_1.AppError(`Invalid ${fieldName}`, 400, {});
        }
        return parsedId;
    }
    // Buy products
    buyProducts = async (req, res, next) => {
        try {
            const buyerId = req.user?.id;
            if (!buyerId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            const { products } = req.body;
            const orderItems = products.map((item) => ({
                productId: item.productId,
                quantity: item.quantity
            }));
            let order = await this.orderService.createOrder(buyerId, orderItems);
            // Transform order to include imageUrl
            order = this.transformOrder(order);
            res.status(201).json({
                message: "Order placed successfully",
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Get seller orders
    getSellerOrders = async (req, res, next) => {
        try {
            const sellerId = req.user?.id;
            if (!sellerId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            let orders = await this.orderService.getSellerOrders(sellerId);
            // Transform orders to include imageUrl for frontend compatibility
            orders = orders.map((order) => ({
                ...order,
                product: this.transformProductImages(order.product)
            }));
            res.status(200).json({
                message: "Orders for your products fetched successfully",
                data: orders
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Get buyer orders
    getBuyerOrders = async (req, res, next) => {
        try {
            const buyerId = req.user?.id;
            if (!buyerId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            let orders = await this.orderService.getBuyerOrders(buyerId);
            // Transform orders to include imageUrl for frontend compatibility
            orders = this.transformOrders(orders);
            res.status(200).json({
                message: "Your orders fetched successfully",
                data: orders
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Update order item status (seller only)
    updateOrderItemStatus = async (req, res, next) => {
        try {
            const sellerId = req.user.id;
            const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
            const dto = req.body;
            let updatedItem = await this.orderService.updateOrderItemStatus(orderItemId, sellerId, dto);
            // Transform product to include imageUrl
            updatedItem = {
                ...updatedItem,
                product: this.transformProductImages(updatedItem.product)
            };
            res.status(200).json({
                message: 'Order item status updated successfully',
                data: updatedItem
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Cancel order item with reason (seller only)
    cancelOrderItem = async (req, res, next) => {
        try {
            const sellerId = req.user.id;
            const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
            const dto = req.body;
            let updatedItem = await this.orderService.cancelOrderItem(orderItemId, sellerId, dto);
            // Transform product to include imageUrl
            updatedItem = {
                ...updatedItem,
                product: this.transformProductImages(updatedItem.product)
            };
            res.status(200).json({
                message: 'Order item cancelled successfully',
                data: updatedItem
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Mark as delivered (seller only)
    markAsDelivered = async (req, res, next) => {
        try {
            const sellerId = req.user.id;
            const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
            let updatedItem = await this.orderService.markAsDelivered(orderItemId, sellerId);
            // Transform product to include imageUrl
            updatedItem = {
                ...updatedItem,
                product: this.transformProductImages(updatedItem.product)
            };
            res.status(200).json({
                message: 'Order item marked as delivered',
                data: updatedItem
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Get order item details for status update
    getOrderItemDetails = async (req, res, next) => {
        try {
            const sellerId = req.user.id;
            const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
            let orderItem = await this.orderService.getOrderItemDetails(orderItemId, sellerId);
            // Transform product to include imageUrl
            orderItem = {
                ...orderItem,
                product: this.transformProductImages(orderItem.product)
            };
            res.status(200).json({
                message: 'Order item details fetched successfully',
                data: orderItem
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Mark as received (buyer only)
    markAsReceived = async (req, res, next) => {
        try {
            const buyerId = req.user.id;
            const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
            let updatedItem = await this.orderService.markAsReceived(orderItemId, buyerId);
            // Transform product to include imageUrl
            updatedItem = {
                ...updatedItem,
                product: this.transformProductImages(updatedItem.product)
            };
            res.status(200).json({
                message: 'Order item marked as received',
                data: updatedItem
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Get order by ID (buyer only)
    getOrderById = async (req, res, next) => {
        try {
            const buyerId = req.user?.id;
            if (!buyerId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            const orderId = this.parseId(req.params.orderId, 'Order ID');
            let order = await this.orderService.getOrderById(orderId, buyerId);
            if (!order) {
                throw new app_error_1.AppError("Order not found", 404, {});
            }
            // Transform order to include imageUrl
            order = this.transformOrder(order);
            res.status(200).json({
                message: "Order fetched successfully",
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map