import { Request, Response, NextFunction } from "express";
export declare class UserController {
    private userService;
    private productService;
    private ratingService;
    constructor();
    getProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadPhoto: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removePhoto: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSellerPhoto: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSellerProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSellerProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map