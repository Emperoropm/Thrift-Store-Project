"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
router.post("/buy", auth_middleware_1.authMiddleware, orderController.buyProducts);
router.get("/my-orders", auth_middleware_1.authMiddleware, orderController.getBuyerOrders);
router.get("/seller/orders", auth_middleware_1.authMiddleware, orderController.getSellerOrders);
exports.default = router;
//# sourceMappingURL=order.route.js.map