"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const app_error_1 = require("../error/app.error");
class UserController {
    userService;
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    getProfile = async (req, res, next) => {
        try {
            const userId = req.user?.sellerId; // from JWT
            if (!userId)
                throw new app_error_1.AppError("Invalid user", 401, {});
            const user = await this.userService.getUserById(userId);
            res.status(200).json({
                message: "User info fetched successfully",
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map