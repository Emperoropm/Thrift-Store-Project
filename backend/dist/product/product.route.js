"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const product_controller_1 = require("./product.controller");
const express_1 = require("express");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// ========== PUBLIC ROUTES (No authentication required) ==========
router.get("/getAllProducts", productController.getProducts);
router.get("/getByCategory/:categoryId", productController.getProductsByCategory);
router.get("/getProductById/:id", productController.getProductById);
router.get("/getBySeller/:sellerId", productController.getProductsBySellerIdPublic);
// ========== SELLER ROUTES (Authentication required) ==========
// Insert new product with image upload support
router.post("/insertProducts", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER", "ADMIN"), upload_middleware_1.uploadProductImages, // Use the named export for multiple images
(request, response, next) => {
    productController.insertProduct(request, response, next);
});
// Update product with image upload support
router.patch("/updateProducts/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER", "ADMIN"), upload_middleware_1.uploadProductImages, // Use the same for updates
productController.updateProduct);
// Delete product
router.delete("/deleteProducts/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER", "ADMIN"), productController.deleteProduct);
// Get seller's own products
router.get("/getBySeller", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("USER", "ADMIN"), productController.getProductsBySellerId);
// ========== ADMIN ROUTES ==========
router.get("/admin/pending", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), productController.getPendingProducts);
router.put("/admin/approve/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), productController.approveProduct);
router.put("/admin/reject/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), productController.rejectProduct);
router.put("/admin/status/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.allowRoles)("ADMIN"), productController.updateProductStatus);
// Add under public routes section
router.get("/nearby", productController.getNearbyProducts);
exports.default = router;
//# sourceMappingURL=product.route.js.map