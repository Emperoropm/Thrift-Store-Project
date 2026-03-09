"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const app_error_1 = require("../error/app.error");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new app_error_1.AppError("JWT token not found", 401, { message: "JWT token not found" });
        }
        const token = authHeader.split(" ")[1];
        // Verify token and get payload
        const decoded = (0, jwt_1.verifyToken)(token); // Use 'any' to handle both old and new tokens
        // Handle backward compatibility: check for both 'id' and 'sellerId'
        const userId = decoded.id || decoded.sellerId;
        if (!userId) {
            throw new app_error_1.AppError("Invalid token payload - missing user ID", 401, {
                message: "Invalid token payload"
            });
        }
        // Attach user info to request
        req.user = {
            id: userId, // Always use 'id' in req.user
            role: decoded.role || 'USER', // Default to 'USER' if not specified
            email: decoded.email,
            name: decoded.name
        };
        next();
    }
    catch (error) {
        next(new app_error_1.AppError("Invalid token", 401, { message: "Invalid token" }));
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map