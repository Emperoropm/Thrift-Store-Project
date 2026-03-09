import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { AppError } from "../error/app.error";
import fs from 'fs';
import path from 'path';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get userId from either id or sellerId
    const userId = (req as any).user?.id || (req as any).user?.sellerId;
    
    if (!userId) throw new AppError("Invalid user", 401, {});

    const user = await this.userService.getUserById(userId);

    res.status(200).json({
      message: "User info fetched successfully",
      data: user
    });

  } catch (error) {
    next(error);
  }
};

uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get userId from either id or sellerId
    const userId = (req as any).user?.id || (req as any).user?.sellerId;
    
    if (!userId) throw new AppError("Invalid user", 401, {});

    if (!req.file) {
      throw new AppError("No photo uploaded", 400, {});
    }

    console.log('Uploading photo for user:', userId);
    console.log('File:', req.file);

    // Get the current user to delete old photo if exists
    const currentUser = await this.userService.getUserById(userId);
    
    // Delete old photo file if exists
    if (currentUser.photo) {
      const oldPhotoPath = path.join(__dirname, '../../public', currentUser.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Save new photo path
    const photoPath = `/uploads/users/${req.file.filename}`;
    const updatedUser = await this.userService.updateUserPhoto(userId, photoPath);

    res.status(200).json({
      message: "Photo uploaded successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error('Upload photo error:', error);
    next(error);
  }
};

  // 👇 ADD THIS: Remove user photo
  removePhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.sellerId;
      if (!userId) throw new AppError("Invalid user", 401, {});

      // Get current user to delete photo file
      const currentUser = await this.userService.getUserById(userId);
      
      if (currentUser.photo) {
        const photoPath = path.join(__dirname, '../../public', currentUser.photo);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      // Remove photo from database
      const updatedUser = await this.userService.removeUserPhoto(userId);

      res.status(200).json({
        message: "Photo removed successfully",
        data: updatedUser
      });

    } catch (error) {
      next(error);
    }
  };

  // Add to UserController class
getSellerPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = parseInt(req.params.sellerId!);
        
        if (isNaN(sellerId)) {
            throw new AppError("Invalid seller ID", 400, {});
        }
        
        const user = await this.userService.getUserById(sellerId);
        
        res.status(200).json({
            message: "Seller photo fetched successfully",
            data: {
                photo: user.photo
            }
        });
        
    } catch (error) {
        next(error);
    }
};
}