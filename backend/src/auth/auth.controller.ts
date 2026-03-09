import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { AuthModel } from "./auth.model";
import { validate } from "class-validator";
import { AppError } from "../error/app.error";

export class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Register User
  insertQuery = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      let photoPath = null;

      if (request.file) {
        photoPath = `/uploads/users/${request.file.filename}`;
      }

      const auth = new AuthModel(
        request.body.name,
        request.body.email,
        request.body.password,
        request.body.role,
        photoPath!
      );

      const errors = await validate(auth);

      if (errors.length > 0) {
        const validationError: Record<string, string> = {};

        for (const err of errors) {
          if (err.constraints) {
            const message = Object.values(err.constraints);
            if (message.length > 0 && typeof message[0] === "string") {
              validationError[err.property] = message[0];
            }
          }
        }

        throw new AppError("Validation failed", 400, validationError);
      }

      const { user, token } = await this.authService.insertQuery(auth);

      response.status(201).json({
        message: "User registered successfully",
        data: {
          user,
          token
        }
      });

    } catch (error) {
      next(error);
    }
  };

  // Login
  loginQuery = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        throw new AppError("Email and password are required", 400, {});
      }

      const { user, token } = await this.authService.loginQuery(email, password);

      response.status(200).json({
        message: "Successfully logged in",
        data: {
          user,
          token
        }
      });

    } catch (error) {
      next(error);
    }
  };

  // Get All Users
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.authService.getAllUsers();

      res.json({
        message: "Users fetched successfully",
        data: users
      });

    } catch (error) {
      next(error);
    }
  };

  // Get User By ID
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      const user = await this.authService.getUserById(id);

      res.json({
        message: "User fetched successfully",
        data: user
      });

    } catch (error) {
      next(error);
    }
  };

  // Delete User
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      const deleted = await this.authService.deleteUser(id);

      res.json({
        message: "User deleted successfully",
        data: deleted
      });

    } catch (error) {
      next(error);
    }
  };

  // Update Profile
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.sellerId;

      if (!userId) {
        throw new AppError("Invalid user", 401, {});
      }

      let photoPath = undefined;

      if (req.file) {
        photoPath = `/uploads/users/${req.file.filename}`;

        const oldUser = await this.authService.getUserById(userId);

        if (oldUser.photo) {
          const fs = require("fs");
          const path = require("path");

          const oldPhotoPath = path.join(__dirname, "../../public", oldUser.photo);

          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
      }

      const updateData: any = {
        name: req.body.name,
        email: req.body.email,
        ...(photoPath && { photo: photoPath })
      };

      const updatedUser = await this.authService.updateUserProfile(userId, updateData);

      res.json({
        message: "Profile updated successfully",
        data: updatedUser
      });

    } catch (error) {
      next(error);
    }
  };
}