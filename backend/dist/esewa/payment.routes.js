"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/simple-payment.routes.ts
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.SimplePaymentController();
// Generate eSewa payment data
router.post('/generate-esewa', auth_middleware_1.authMiddleware, paymentController.generateEsewaPayment);
// Handle eSewa callback (no auth needed)
router.post('/esewa-callback', paymentController.handleEsewaCallback);
router.get('/esewa-callback', paymentController.handleEsewaCallback);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map