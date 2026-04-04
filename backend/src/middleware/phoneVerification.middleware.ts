import { Request, Response, NextFunction } from "express";
import { PrismaClient } from '@prisma/client';
import { AppError } from "../error/app.error";

const prisma = new PrismaClient();

export const requirePhoneVerification = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        requiresVerification: false 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true }
    });

    if (!user || !user.phoneVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Phone number verification required to add products. Please verify your phone number first.',
        requiresVerification: true,
        code: 'PHONE_VERIFICATION_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Error in phone verification middleware:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

// Optional: Middleware to check but not block (just attach status to request)
export const attachVerificationStatus = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneVerified: true, phone: true }
      });
      
      (req as any).verificationStatus = {
        isVerified: user?.phoneVerified || false,
        hasPhoneNumber: !!user?.phone
      };
    }
    
    next();
  } catch (error) {
    next();
  }
};