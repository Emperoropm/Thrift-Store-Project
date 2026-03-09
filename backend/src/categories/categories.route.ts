import { Router } from "express";
import { CategoryController } from "./categories.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

const router = Router();
const controller = new CategoryController();

// Only ADMIN can manage categories
router.post(
  "/insertCategory",
  authMiddleware,
  allowRoles("ADMIN"),
  (req, res, next) => controller.insertCategory(req, res, next)
);

router.get(
  "/getAllCategory",
  authMiddleware,
  (req, res, next) => controller.getAllCategories(req, res, next)
);

router.get(
  "/getCategoryById:id",
  authMiddleware,
  allowRoles("ADMIN"),
  (req, res, next) => controller.getCategoryById(req, res, next)
);

router.put(
  "/updateCategory:id",
  authMiddleware,
  allowRoles("ADMIN"),
  (req, res, next) => controller.updateCategory(req, res, next)
);

router.delete(
  "/deleteCategory:id",
  authMiddleware,
  allowRoles("ADMIN"),
  (req, res, next) => controller.deleteCategory(req, res, next)
);

router.get("/getAllCategoriesForDropdown", controller.getAllCategoriesForDropdown);

// For category filtering (with product count)
router.get("/with-count", controller.getAllCategoriesWithCount);

export default router;
