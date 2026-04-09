"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const phoneVerification_controller_1 = require("./phoneVerification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const phoneVerificationController = new phoneVerification_controller_1.PhoneVerificationController();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Generate Firebase custom token for phone verification
router.post("/generate-token", phoneVerificationController.generateToken.bind(phoneVerificationController));
// Verify and save phone number after successful OTP
router.post("/verify-and-save", phoneVerificationController.verifyAndSave.bind(phoneVerificationController));
// Check if user can add products
router.get("/can-add-product", phoneVerificationController.canAddProduct.bind(phoneVerificationController));
// Get verification status
router.get("/status", phoneVerificationController.getVerificationStatus.bind(phoneVerificationController));
exports.default = router;
//# sourceMappingURL=phoneRoutes.routes.js.map