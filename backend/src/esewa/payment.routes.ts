// routes/simple-payment.routes.ts
import { Router } from 'express';
import { SimplePaymentController } from './payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const paymentController = new SimplePaymentController();

// Generate eSewa payment data
router.post('/generate-esewa', authMiddleware, paymentController.generateEsewaPayment);

// Handle eSewa callback (no auth needed)
router.post('/esewa-callback', paymentController.handleEsewaCallback);
router.get('/esewa-callback', paymentController.handleEsewaCallback);


export default router;