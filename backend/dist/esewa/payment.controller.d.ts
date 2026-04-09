import { Request, Response } from 'express';
export declare class SimplePaymentController {
    private readonly ESEWA_CONFIG;
    generateEsewaPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    handleEsewaCallback(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=payment.controller.d.ts.map