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
                dailyProductCount: 0,
                lastProductDate: null
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                dailyProductCount: true,
                lastProductDate: true,
                createdAt: true,
                updatedAt: true
            }
        });
        // Generate token with 'id' instead of 'sellerId'
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
                dailyProductCount: true,
                lastProductDate: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            throw new app_error_1.AppError("User not found", 404, {});
        }
        // Generate token with 'id' instead of 'sellerId'
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
            // Check if user exists
            const userExists = await prisma.user.findUnique({
                where: { id }
            });
            if (!userExists) {
                throw new app_error_1.AppError("User not found", 404, {});
            }
            // Delete the user
            return await prisma.user.delete({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    dailyProductCount: true,
                    lastProductDate: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
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
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map