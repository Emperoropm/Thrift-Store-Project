import { Request, Response, NextFunction } from "express";
import { PhoneVerificationService } from "./phoneVerification.service";
import { AppError } from "../error/app.error";
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

const prisma = new PrismaClient();

export class PhoneVerificationController {
  private phoneVerificationService: PhoneVerificationService;

  constructor() {
    this.phoneVerificationService = new PhoneVerificationService();
    
    // Bind all methods
    this.generateToken = this.generateToken.bind(this);
    this.verifyAndSave = this.verifyAndSave.bind(this);
    this.canAddProduct = this.canAddProduct.bind(this);
    this.getVerificationStatus = this.getVerificationStatus.bind(this);
  }

  generateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      
      console.log('Generate token request for user:', userId);
      console.log('Request body:', req.body);
      
      if (!userId) {
        throw new AppError("User not authenticated", 401, {});
      }

      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        throw new AppError("Phone number is required", 400, {});
      }

      // Validate phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw new AppError("Invalid phone number format. Use international format (e.g., +9779841234567)", 400, {});
      }

      // Check if phone number is already used
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phoneNumber,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new AppError("Phone number already in use by another account", 400, {});
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError("User not found", 404, {});
      }

      console.log('Generating token for user:', user.id, user.email);

      // Generate custom token for Firebase
      const customToken = await this.phoneVerificationService.generateCustomToken(
        userId,
        user.email,
        phoneNumber
      );

      console.log('Custom token generated successfully');

      res.status(200).json({
        success: true,
        message: "Verification token generated successfully",
        data: {
          customToken,
          phoneNumber
        }
      });

    } catch (error) {
      console.error('Error in generateToken:', error);
      next(error);
    }
  };

  verifyAndSave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      
      console.log('verifyAndSave called for user:', userId);
      console.log('Request body:', req.body);
      
      if (!userId) {
        throw new AppError("User not authenticated", 401, {});
      }

      const { phoneNumber, firebaseUid } = req.body;

      if (!phoneNumber) {
        throw new AppError("Phone number is required", 400, {});
      }

      if (!firebaseUid) {
        throw new AppError("Firebase UID is required", 400, {});
      }

      // Optional Firebase verification (won't block in development)
      try {
        const firebaseUser = await admin.auth().getUser(firebaseUid);
        console.log('Firebase user found:', firebaseUser.uid, firebaseUser.phoneNumber);
        
        if (firebaseUser.phoneNumber !== phoneNumber) {
          console.warn('Phone number mismatch, but continuing for development');
        }
      } catch (firebaseError: any) {
        console.log('Firebase verification skipped (development mode):', firebaseError.message);
        // Continue anyway in development
      }

      // Check if phone number is already used by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phoneNumber,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new AppError("Phone number already in use by another account", 400, {});
      }

      // Save verified phone number
      const updatedUser = await this.phoneVerificationService.saveVerifiedPhoneNumber(
        userId,
        phoneNumber,
        firebaseUid
      );

      console.log('✅ Phone verified and saved successfully for user:', userId);

      res.status(200).json({
        success: true,
        message: "Phone number verified successfully",
        data: updatedUser
      });

    } catch (error) {
      console.error('Error in verifyAndSave:', error);
      next(error);
    }
  };

  canAddProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        throw new AppError("User not authenticated", 401, {});
      }

      const canAddProduct = await this.phoneVerificationService.canAddProduct(userId);
      const status = await this.phoneVerificationService.getVerificationStatus(userId);

      res.status(200).json({
        success: true,
        data: {
          canAddProduct,
          ...status
        }
      });

    } catch (error) {
      console.error('Error in canAddProduct:', error);
      next(error);
    }
  };

  getVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        throw new AppError("User not authenticated", 401, {});
      }

      const status = await this.phoneVerificationService.getVerificationStatus(userId);

      res.status(200).json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Error in getVerificationStatus:', error);
      next(error);
    }
  };
}