import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { sellerMiddleware } from "../middleware/seller.middleware";
import { OrderController } from "./order.controller";
import { validate } from "../middleware/validate.middleware";
import { UpdateOrderItemStatusDto } from "./update-order-status.dto";
import { CancelOrderItemDto } from "./cancel-order-item.dto";
import { CreateOrderDto } from "./create-order.dto";

const router = Router();
const orderController = new OrderController();

// ========== BUYER ROUTES ==========
// Create order
router.post(
  "/buy", 
  authMiddleware, 
  validate(CreateOrderDto),
  orderController.buyProducts
);

// Get buyer's orders
router.get("/my-orders", authMiddleware, orderController.getBuyerOrders);

// ========== SELLER ROUTES ==========
// Get seller's orders
router.get("/seller/orders", authMiddleware, orderController.getSellerOrders);

// ========== ORDER ITEM STATUS MANAGEMENT (SELLER ONLY) ==========
// Update order item status
router.put(
  "/item/:orderItemId/status",
  authMiddleware,
  sellerMiddleware,
  validate(UpdateOrderItemStatusDto),
  orderController.updateOrderItemStatus
);

// Cancel order item with reason
router.put(
  "/item/:orderItemId/cancel",
  authMiddleware,
  sellerMiddleware,
  validate(CancelOrderItemDto),
  orderController.cancelOrderItem
);

// Mark order item as delivered
router.put(
  "/item/:orderItemId/deliver",
  authMiddleware,
  sellerMiddleware,
  orderController.markAsDelivered
);

// Get order item details
router.get(
  "/item/:orderItemId",
  authMiddleware,
  sellerMiddleware,
  orderController.getOrderItemDetails
);


// In your order.routes.ts, add this new route:

// Mark order item as received (buyer only)
router.put(
  "/item/:orderItemId/receive",
  authMiddleware,
  orderController.markAsReceived
);
export default router;