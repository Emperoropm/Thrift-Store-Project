import { authMiddleware } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";
import { ProductController } from "./product.controller";
import { Router, Request, Response, NextFunction } from "express";

const router = Router();
const productController = new ProductController();

// ========== PUBLIC ROUTES ==========
router.get("/getAllProducts", productController.getProducts);
router.get("/getByCategory/:categoryId", productController.getProductsByCategory);

// ========== SELLER ROUTES ==========
router.post(
  "/insertProducts",
  authMiddleware,
  allowRoles("USER"),
  (request: Request, response: Response, next: NextFunction) => {
    productController.insertProduct(request, response, next);
  }
);

router.patch(
  "/updateProducts/:id",
  authMiddleware,
  allowRoles("USER", "ADMIN"),
  productController.updateProduct
);

router.delete(
  "/deleteProducts/:id",
  authMiddleware,
  allowRoles("USER", "ADMIN"),
  productController.deleteProduct
);

router.get(
  "/getBySeller",
  authMiddleware,
  allowRoles("USER"),
  productController.getProductsBySellerId
);

// ========== ADMIN ROUTES ==========
router.get(
  "/admin/pending",
  authMiddleware,
  allowRoles("ADMIN"),
  (req: Request, res: Response, next: NextFunction) => {
    productController.getPendingProducts(req, res, next);
  }
);

router.get(
  "/getProductById/:id",
  (req: Request, res: Response, next: NextFunction) => {
    productController.getProductById(req, res, next);
  }
);

router.put(
  "/admin/approve/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  (req: Request, res: Response, next: NextFunction) => {
    productController.approveProduct(req, res, next);
  }
);

router.put(
  "/admin/reject/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  (req: Request, res: Response, next: NextFunction) => {
    productController.rejectProduct(req, res, next);
  }
);

router.put(
  "/admin/status/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  (req: Request, res: Response, next: NextFunction) => {
    productController.updateProductStatus(req, res, next);
  }
);


export default router;