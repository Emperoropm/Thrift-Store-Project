"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const app_error_1 = require("../error/app.error");
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class AuthService {
    async findUserByEmail(email) {
        const result = await prisma.user.findUnique({
            where: { email }
        });
        return result;
    }
    async insertQuery(auth) {
        // Check if user already exists
        const existingUser = await this.findUserByEmail(auth.email);
        if (existingUser) {
            throw new app_error_1.AppError("Email already registered", 409, {
                email: "The email is already used"
            });
        }
        const hashpassword = await bcrypt_1.default.hash(auth.password, 10);
        const result = await prisma.user.create({
            data: {
                name: auth.name,
                email: auth.email,
                password: hashpassword,
                role: auth.role,
                photo: auth.photo || null, // 👈 ADD THIS - handle photo
                dailyProductCount: 0,
                lastProductDate: null
            },
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
        // Generate token
        const token = (0, jwt_1.generateToken)({
            id: result.id,
            email: result.email,
            role: result.role,
            name: result.name
        });
        return {
            user: result,
            token
        };
    }
    async loginQuery(email, password) {
        // First get user with password for validation
        const userWithPassword = await prisma.user.findUnique({
            where: { email }
        });
        if (!userWithPassword) {
            throw new app_error_1.AppError("Email does not exist", 401, {
                email: "Email does not exist"
            });
        }
        const match = await bcrypt_1.default.compare(password, userWithPassword.password);
        if (!match) {
            throw new app_error_1.AppError("Invalid credentials", 401, {
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
            throw new app_error_1.AppError("User not found", 404, {});
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });
        return {
            user,
            token
        };
    }
    async getAllUsers() {
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
    async getUserById(id) {
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
            throw new app_error_1.AppError("User not found", 404, {
                id: "Invalid user id"
            });
        }
        return user;
    }
    async deleteUser(id) {
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
                throw new app_error_1.AppError("User not found", 404, {});
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
                }
                catch (fileErr) {
                    console.error("Error deleting user photo file:", fileErr);
                    // Don't throw error for file deletion failure
                }
            }
            return deletedUser;
        }
        catch (err) {
            if (err.code === 'P2003') {
                throw new app_error_1.AppError("Cannot delete user with related records", 400, {
                    message: "User has products or orders. Delete them first."
                });
            }
            throw new app_error_1.AppError("Failed to delete user", 400, {
                message: err.message
            });
        }
    }
    // 👇 ADD THIS: Method to update user profile (including photo)
    async updateUserProfile(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.photo !== undefined)
            updateData.photo = data.photo;
        if (data.role !== undefined)
            updateData.role = data.role;
        // If password is being updated, hash it
        if (data.password) {
            updateData.password = await bcrypt_1.default.hash(data.password, 10);
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map