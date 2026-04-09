import { Request, Response, NextFunction } from "express";
export declare const requirePhoneVerification: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const attachVerificationStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=phoneVerification.middleware.d.ts.map