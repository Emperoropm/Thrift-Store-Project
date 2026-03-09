"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const product_controller_1 = require("./product.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// ========== PUBLIC ROUTES ==========
router.get("/getAllProducts", productController.getProducts);
router.get("/getByCategory/:categoryId", productController.getProductsByCategory);
// ========== SELLER ROUTES ==========
router.post("/insertProducts", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER"), (request, response, next) => {
    productController.insertProduct(request, response, next);
});
router.patch("/updateProducts/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER", "ADMIN"), productController.updateProduct);
router.delete("/deleteProducts/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER", "ADMIN"), productController.deleteProduct);
router.get("/getBySeller", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER"), productController.getProductsBySellerId);
// ========== ADMIN ROUTES ==========
router.get("/admin/pending", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => {
    productController.getPendingProducts(req, res, next);
});
router.put("/admin/approve/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => {
    productController.approveProduct(req, res, next);
});
router.put("/admin/reject/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => {
    productController.rejectProduct(req, res, next);
});
router.put("/admin/status/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), (req, res, next) => {
    productController.updateProductStatus(req, res, next);
});
exports.default = router;
//# sourceMappingURL=product.route.js.map