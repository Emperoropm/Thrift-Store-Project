import { Request, Response, NextFunction } from "express";
export declare class PhoneVerificationController {
    private phoneVerificationService;
    constructor();
    generateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyAndSave: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    canAddProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getVerificationStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=phoneVerification.controller.d.ts.map