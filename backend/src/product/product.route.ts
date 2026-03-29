import { authMiddleware } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";
import { ProductController } from "./product.controller";
import { Router, Request, Response, NextFunction } from "express";
import upload, { uploadProductImages } from "../middleware/upload.middleware";

const router = Router();
const productController = new ProductController();

// ========== PUBLIC ROUTES (No authentication required) ==========
router.get("/getAllProducts", productController.getProducts);
router.get("/getByCategory/:categoryId", productController.getProductsByCategory);
router.get("/getProductById/:id", productController.getProductById);
router.get("/getBySeller/:sellerId", productController.getProductsBySellerIdPublic);

// ========== SELLER ROUTES (Authentication required) ==========
// Insert new product with image upload support
router.post(
  "/insertProducts",
  authMiddleware,
  allowRoles("USER", "ADMIN"),
  uploadProductImages, // Use the named export for multiple images
  (request: Request, response: Response, next: NextFunction) => {
    productController.insertProduct(request, response, next);
  }
);

// Update product with image upload support
router.patch(
  "/updateProducts/:id",
  authMiddleware,
  allowRoles("USER", "ADMIN"),
  uploadProductImages, // Use the same for updates
  productController.updateProduct
);

// Delete product
router.delete(
  "/deleteProducts/:id",
  authMiddleware,
  allowRoles("USER", "ADMIN"),
  productController.deleteProduct
);

// Get seller's own products
router.get(
  "/getBySeller",
  authMiddleware,
  allowRoles("USER", "ADMIN"),
  productController.getProductsBySellerId
);

// ========== ADMIN ROUTES ==========
router.get(
  "/admin/pending",
  authMiddleware,
  allowRoles("ADMIN"),
  productController.getPendingProducts
);

router.put(
  "/admin/approve/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  productController.approveProduct
);

router.put(
  "/admin/reject/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  productController.rejectProduct
);

router.put(
  "/admin/status/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  productController.updateProductStatus
);

export default router;