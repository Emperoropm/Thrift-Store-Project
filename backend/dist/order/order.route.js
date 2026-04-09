"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const seller_middleware_1 = require("../middleware/seller.middleware");
const order_controller_1 = require("./order.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const update_order_status_dto_1 = require("./update-order-status.dto");
const cancel_order_item_dto_1 = require("./cancel-order-item.dto");
const create_order_dto_1 = require("./create-order.dto");
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
// ========== BUYER ROUTES ==========
// Create order
router.post("/buy", auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(create_order_dto_1.CreateOrderDto), orderController.buyProducts);
// Get buyer's orders
router.get("/my-orders", auth_middleware_1.authMiddleware, orderController.getBuyerOrders);
// ========== SELLER ROUTES ==========
// Get seller's orders
router.get("/seller/orders", auth_middleware_1.authMiddleware, orderController.getSellerOrders);
// ========== ORDER ITEM STATUS MANAGEMENT (SELLER ONLY) ==========
// Update order item status
router.put("/item/:orderItemId/status", auth_middleware_1.authMiddleware, seller_middleware_1.sellerMiddleware, (0, validate_middleware_1.validate)(update_order_status_dto_1.UpdateOrderItemStatusDto), orderController.updateOrderItemStatus);
// Cancel order item with reason
router.put("/item/:orderItemId/cancel", auth_middleware_1.authMiddleware, seller_middleware_1.sellerMiddleware, (0, validate_middleware_1.validate)(cancel_order_item_dto_1.CancelOrderItemDto), orderController.cancelOrderItem);
// Mark order item as delivered
router.put("/item/:orderItemId/deliver", auth_middleware_1.authMiddleware, seller_middleware_1.sellerMiddleware, orderController.markAsDelivered);
// Get order item details
router.get("/item/:orderItemId", auth_middleware_1.authMiddleware, seller_middleware_1.sellerMiddleware, orderController.getOrderItemDetails);
// In your order.routes.ts, add this new route:
// Mark order item as received (buyer only)
router.put("/item/:orderItemId/receive", auth_middleware_1.authMiddleware, orderController.markAsReceived);
exports.default = router;
//# sourceMappingURL=order.route.js.map