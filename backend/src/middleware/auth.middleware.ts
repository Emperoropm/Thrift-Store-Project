import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { AppError } from "../error/app.error";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("JWT token not found", 401, { message: "JWT token not found" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token and get payload
    const decoded = verifyToken(token!) as any; // Use 'any' to handle both old and new tokens
    
    console.log('Decoded token payload:', decoded); // Debug log
    
    // Handle backward compatibility: check for both 'id' and 'sellerId'
    const userId = decoded.id || decoded.sellerId;
    
    if (!userId) {
      throw new AppError("Invalid token payload - missing user ID", 401, { 
        message: "Invalid token payload" 
      });
    }

    // Attach user info to request
    (req as any).user = {
      id: userId,                    // Always use 'id' in req.user
      sellerId: userId,              // Also set sellerId for backward compatibility
      role: decoded.role || 'USER',  // Default to 'USER' if not specified
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(new AppError("Invalid token", 401, { message: "Invalid token" }));
  }
};