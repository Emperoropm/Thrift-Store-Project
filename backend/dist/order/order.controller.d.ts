import { Request, Response, NextFunction } from "express";
export declare class OrderController {
    private orderService;
    constructor();
    buyProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSellerOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBuyerOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=order.controller.d.ts.map