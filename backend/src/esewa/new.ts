// In your payment.controller.ts or create a new endpoint
import { Request, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.middleware';
import Router from 'express';

const router=Router();

// Add this endpoint to your existing routes
router.post('/generate-esewa-signature', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { total_amount, transaction_uuid, product_code } = req.body;
        
        if (!total_amount || !transaction_uuid || !product_code) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const secret = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        
        const signature = crypto
            .createHmac('sha256', secret)
            .update(message)
            .digest('base64');

        res.json({ signature });
        
    } catch (error) {
        console.error('Error generating signature:', error);
        res.status(500).json({ error: 'Failed to generate signature' });
    }
});