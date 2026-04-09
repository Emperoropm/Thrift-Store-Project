import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
export declare class AuthController {
    authService: AuthService;
    constructor();
    insertQuery: (request: Request, response: Response, next: NextFunction) => Promise<void>;
    loginQuery: (request: Request, response: Response, next: NextFunction) => Promise<void>;
    getAllUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map