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
                createdAt: true
            }
        });
        if (!user)
            throw new app_error_1.AppError("User not found", 404, {});
        return user;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map