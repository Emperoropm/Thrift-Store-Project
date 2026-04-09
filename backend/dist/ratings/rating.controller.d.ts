import { Request, Response, NextFunction } from "express";
import { RatingService } from "./rating.service";
export declare class RatingController {
    ratingService: RatingService;
    rateSeller: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSellerRatings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=rating.controller.d.ts.map