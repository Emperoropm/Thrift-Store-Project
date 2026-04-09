import { Request, Response, NextFunction } from "express";
export declare class OrderController {
    private orderService;
    constructor();
    private transformProductImages;
    private transformOrderItems;
    private transformOrder;
    private transformOrders;
    private parseId;
    buyProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSellerOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBuyerOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateOrderItemStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelOrderItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsDelivered: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderItemDetails: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsReceived: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=order.controller.d.ts.map