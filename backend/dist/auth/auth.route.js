"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const auth_controller_1 = require("./auth.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
let authController = new auth_controller_1.AuthController();
// Registration
router.post("/register", (request, response, next) => {
    authController.insertQuery(request, response, next);
});
// Login
router.post("/login", (request, response, next) => {
    authController.loginQuery(request, response, next);
});
// Token refresh (optional)
router.post("/refresh-token", auth_middleware_1.authMiddleware, (request, response, next) => {
    // You can add a refresh token controller method or use the inline one above
});
// GET ALL USERS (ADMIN only)
router.get("/users", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (request, response, next) => {
    authController.getAllUsers(request, response, next);
});
// GET USER BY ID (ADMIN only)
router.get("/users/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (request, response, next) => {
    authController.getUserById(request, response, next);
});
// DELETE USER (ADMIN only)
router.delete("/users/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (request, response, next) => {
    authController.deleteUser(request, response, next);
});
exports.default = router;
//# sourceMappingURL=auth.route.js.map