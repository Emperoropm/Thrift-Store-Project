import { Router } from "express";
import { RatingController } from "./rating.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

const router = Router();
const ratingController = new RatingController();

// Rate a seller
router.post(
  "/rate-seller",
  authMiddleware,
  allowRoles("USER","ADMIN"),
  ratingController.rateSeller
);

// Get seller ratings
router.get(
  "/seller/:sellerId",
  ratingController.getSellerRatings
);

export default router;