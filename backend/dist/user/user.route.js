"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Get current logged-in user info
router.get("/me", auth_middleware_1.authMiddleware, userController.getProfile);
exports.default = router;
//# sourceMappingURL=user.route.js.map