import { Router } from "express";
import { PhoneVerificationController } from "./phoneVerification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const phoneVerificationController = new PhoneVerificationController();

// All routes require authentication
router.use(authMiddleware);

// Generate Firebase custom token for phone verification
router.post(
  "/generate-token",
  phoneVerificationController.generateToken.bind(phoneVerificationController)
);

// Verify and save phone number after successful OTP
router.post(
  "/verify-and-save",
  phoneVerificationController.verifyAndSave.bind(phoneVerificationController)
);

// Check if user can add products
router.get(
  "/can-add-product",
  phoneVerificationController.canAddProduct.bind(phoneVerificationController)
);

// Get verification status
router.get(
  "/status",
  phoneVerificationController.getVerificationStatus.bind(phoneVerificationController)
);

export default router;