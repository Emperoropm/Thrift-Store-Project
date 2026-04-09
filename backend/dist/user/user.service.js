"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../error/app.error");
const prisma = new client_1.PrismaClient();
class UserService {
    async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photo: true, // 👈 ADD THIS
                createdAt: true
            }
        });
        if (!user)
            throw new app_error_1.AppError("User not found", 404, {});
        return user;
    }
    // 👇 ADD THIS: Method to update user photo
    async updateUserPhoto(userId, photoPath) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { photo: photoPath },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photo: true,
                createdAt: true
            }
        });
        return user;
    }
    // 👇 ADD THIS: Method to remove user photo
    async removeUserPhoto(userId) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { photo: null },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photo: true,
                createdAt: true
            }
        });
        return user;
    }
    // Add to UserService class
    async getSellerPhoto(sellerId) {
        const user = await prisma.user.findUnique({
            where: { id: sellerId },
            select: {
                photo: true
            }
        });
        return user;
    }
    // Add to UserService class
    async getSellerProfile(sellerId) {
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: {
                id: true,
                name: true,
                email: true,
                photo: true,
                createdAt: true,
                role: true
            }
        });
        if (!seller) {
            throw new app_error_1.AppError("Seller not found", 404, {});
        }
        return seller;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map