import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";
import { AppError } from "../error/app.error";
import { UpdateOrderItemStatusDto } from "./update-order-status.dto";
import { CancelOrderItemDto } from "./cancel-order-item.dto";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }
  // Buy products - updated to use CreateOrderDto
  buyProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buyerId = (req as any).user?.id;
      if (!buyerId) throw new AppError("Invalid user", 401, {});

      const { products } = req.body;
      
      // Map the DTO to the format expected by the service
      const orderItems = products.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const order = await this.orderService.createOrder(buyerId, orderItems);

      res.status(201).json({
        message: "Order placed successfully",
        data: order
      });

    } catch (error) {
      next(error);
    }
  }
  getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = (req as any).user?.id;
      if (!sellerId) throw new AppError("Invalid user", 401, {});

      const orders = await this.orderService.getSellerOrders(sellerId);

      res.status(200).json({
        message: "Orders for your products fetched successfully",
        data: orders
      });
    } catch (error) {
      next(error);
    }
  };

  getBuyerOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buyerId = (req as any).user?.id;
      if (!buyerId) throw new AppError("Invalid user", 401, {});

      const orders = await this.orderService.getBuyerOrders(buyerId);

      res.status(200).json({
        message: "Your orders fetched successfully",
        data: orders
      });
    } catch (error) {
      next(error);
    }
  };

  private parseId(id: string | undefined, fieldName: string): number {
  if (!id) {
    throw new AppError(`${fieldName} is required`, 400, {});
  }
  
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new AppError(`Invalid ${fieldName}`, 400, {});
  }
  
  return parsedId;
}

  // Update order item status (seller only)
  updateOrderItemStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = (req as any).user.id;
       const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
      
      const dto: UpdateOrderItemStatusDto = req.body;
      
      const updatedItem = await this.orderService.updateOrderItemStatus(
        orderItemId,
        sellerId,
        dto
      );

      res.status(200).json({
        message: 'Order item status updated successfully',
        data: updatedItem
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel order item with reason (seller only)
  cancelOrderItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = (req as any).user.id;
      const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
      
      const dto: CancelOrderItemDto = req.body;
      
      const updatedItem = await this.orderService.cancelOrderItem(
        orderItemId,
        sellerId,
        dto
      );

      res.status(200).json({
        message: 'Order item cancelled successfully',
        data: updatedItem
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark as delivered (seller only)
  markAsDelivered = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = (req as any).user.id;
       const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
      
      const updatedItem = await this.orderService.markAsDelivered(
        orderItemId,
        sellerId
      );

      res.status(200).json({
        message: 'Order item marked as delivered',
        data: updatedItem
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order item details for status update
  getOrderItemDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = (req as any).user.id;
       const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
      
      const orderItem = await this.orderService.getOrderItemDetails(
        orderItemId,
        sellerId
      );

      res.status(200).json({
        message: 'Order item details fetched successfully',
        data: orderItem
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark as received (buyer only)
markAsReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = (req as any).user.id;
    const orderItemId = this.parseId(req.params.orderItemId, 'Order item ID');
    
    const updatedItem = await this.orderService.markAsReceived(
      orderItemId,
      buyerId
    );

    res.status(200).json({
      message: 'Order item marked as received',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
}

// Helper method to parse ID
private parseId(id: string, fieldName: string): number {
  const parsed = parseInt(id);
  if (isNaN(parsed)) {
    throw new AppError(`Invalid ${fieldName}`, 400, {});
  }
  return parsed;
}

}