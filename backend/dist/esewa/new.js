"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_1 = __importDefault(require("express"));
const router = (0, express_1.default)();
// Add this endpoint to your existing routes
router.post('/generate-esewa-signature', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { total_amount, transaction_uuid, product_code } = req.body;
        if (!total_amount || !transaction_uuid || !product_code) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const secret = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const signature = crypto_1.default
            .createHmac('sha256', secret)
            .update(message)
            .digest('base64');
        res.json({ signature });
    }
    catch (error) {
        console.error('Error generating signature:', error);
        res.status(500).json({ error: 'Failed to generate signature' });
    }
});
//# sourceMappingURL=new.js.map