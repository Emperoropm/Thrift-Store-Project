"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("./categories.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
const controller = new categories_controller_1.CategoryController();
// Only ADMIN can manage categories
router.post("/insertCategory", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => controller.insertCategory(req, res, next));
router.get("/getAllCategory", auth_middleware_1.authMiddleware, (req, res, next) => controller.getAllCategories(req, res, next));
router.get("/getCategoryById:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => controller.getCategoryById(req, res, next));
router.put("/updateCategory:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => controller.updateCategory(req, res, next));
router.delete("/deleteCategory:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => controller.deleteCategory(req, res, next));
router.get("/getAllCategoriesForDropdown", controller.getAllCategoriesForDropdown);
// For category filtering (with product count)
router.get("/with-count", controller.getAllCategoriesWithCount);
exports.default = router;
//# sourceMappingURL=categories.route.js.map