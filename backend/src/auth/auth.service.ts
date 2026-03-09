import { AppError } from "../error/app.error";
import { generateToken } from "../utils/jwt";
import { AuthModel, UserResponse } from "./auth.model";
import { User, PrismaClient, Role } from '@prisma/client';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export class AuthService {
  async findUserByEmail(email: string): Promise<AuthModel | null> {
    const result = await prisma.user.findUnique({
      where: { email }
    });
    return result;
  }
  
  async insertQuery(auth: Omit<AuthModel, "id">): Promise<{ 
    user: UserResponse; 
    token: string 
  }> {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(auth.email!);
    if (existingUser) {
      throw new AppError("Email already registered", 409, { 
        email: "The email is already used" 
      });
    }

    const hashpassword = await bcrypt.hash(auth.password!, 10);
    
    const result = await prisma.user.create({
      data: {
        name: auth.name!,
        email: auth.email!,
        password: hashpassword,
        role: auth.role as Role,
        photo: auth.photo || null, // 👈 ADD THIS - handle photo
        dailyProductCount: 0,
        lastProductDate: null
      },
      select: { // Select to exclude password
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true, // 👈 ADD THIS
        dailyProductCount: true,
        lastProductDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate token
    const token = generateToken({
      id: result.id,
      email: result.email,
      role: result.role,
      name: result.name!
    });

    return {
      user: result,
      token
    };
  }
  
  async loginQuery(email: string, password: string): Promise<{ 
    user: UserResponse; 
    token: string 
  }> {
    // First get user with password for validation
    const userWithPassword = await prisma.user.findUnique({
      where: { email }
    });

    if (!userWithPassword) {
      throw new AppError("Email does not exist", 401, { 
        email: "Email does not exist" 
      });
    }

    const match = await bcrypt.compare(password, userWithPassword.password);
    if (!match) {
      throw new AppError("Invalid credentials", 401, { 
        password: "Invalid password" 
      });
    }

    // Get user without password for response
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true, // 👈 ADD THIS
        dailyProductCount: true,
        lastProductDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError("User not found", 404, {});
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name!
    });

    return {
      user,
      token
    };
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true, // 👈 ADD THIS
        dailyProductCount: true,
        lastProductDate: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return users;
  }

  async getUserById(id: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true, // 👈 ADD THIS
        dailyProductCount: true,
        lastProductDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError("User not found", 404, { 
        id: "Invalid user id" 
      });
    }

    return user;
  }

  async deleteUser(id: number): Promise<UserResponse> {
    try {
      // First get the user to get photo path
      const user = await prisma.user.findUnique({
        where: { id },
        select: { photo: true }
      });

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id }
      });

      if (!userExists) {
        throw new AppError("User not found", 404, {});
      }

      // Delete the user
      const deletedUser = await prisma.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          photo: true, // 👈 ADD THIS
          dailyProductCount: true,
          lastProductDate: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Optionally delete the photo file from local storage
      if (user?.photo) {
        try {
          const fs = require('fs');
          const path = require('path');
          const photoPath = path.join(__dirname, '../../public', user.photo);
          if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
          }
        } catch (fileErr) {
          console.error("Error deleting user photo file:", fileErr);
          // Don't throw error for file deletion failure
        }
      }

      return deletedUser;

    } catch (err: any) {
      if (err.code === 'P2003') {
        throw new AppError("Cannot delete user with related records", 400, {
          message: "User has products or orders. Delete them first."
        });
      }
      throw new AppError("Failed to delete user", 400, { 
        message: err.message 
      });
    }
  }

  // 👇 ADD THIS: Method to update user profile (including photo)
  async updateUserProfile(id: number, data: Partial<AuthModel>): Promise<UserResponse> {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.role !== undefined) updateData.role = data.role as Role;
    
    // If password is being updated, hash it
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        dailyProductCount: true,
        lastProductDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }
}