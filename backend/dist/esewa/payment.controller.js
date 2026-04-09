"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePaymentController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SimplePaymentController {
    // eSewa configuration
    ESEWA_CONFIG = {
        merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
        secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
        baseUrl: 'https://rc-epay.esewa.com.np',
        successUrl: process.env.FRONTEND_URL + '/payment-success.html',
        failureUrl: process.env.FRONTEND_URL + '/payment-failed.html'
    };
    // Generate payment form data
    async generateEsewaPayment(req, res) {
        try {
            const { orderId } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!orderId) {
                return res.status(400).json({ error: 'Order ID is required' });
            }
            // Get order details
            const order = await prisma.order.findUnique({
                where: { id: parseInt(orderId.toString()) },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    buyer: true
                }
            });
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            // Check if order belongs to user
            if (order.buyerId !== userId) {
                return res.status(403).json({ error: 'Access denied' });
            }
            // Calculate amounts
            const subtotal = order.total;
            const taxAmount = subtotal * 0.13; // 13% VAT
            const serviceCharge = 30;
            const deliveryCharge = 100;
            const totalAmount = subtotal + taxAmount + serviceCharge + deliveryCharge;
            // Generate transaction ID
            const transactionId = `TT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Generate signature
            const message = `total_amount=${totalAmount.toFixed(2)},transaction_uuid=${transactionId},product_code=${this.ESEWA_CONFIG.merchantId}`;
            const signature = crypto_1.default
                .createHmac('sha256', this.ESEWA_CONFIG.secretKey)
                .update(message)
                .digest('base64');
            // Create payment data (similar to your PHP)
            const paymentData = {
                amount: subtotal.toFixed(2),
                tax_amount: taxAmount.toFixed(2),
                total_amount: totalAmount.toFixed(2),
                transaction_uuid: transactionId,
                product_code: this.ESEWA_CONFIG.merchantId,
                product_service_charge: serviceCharge.toFixed(2),
                product_delivery_charge: deliveryCharge.toFixed(2),
                success_url: `${this.ESEWA_CONFIG.successUrl}?orderId=${orderId}`,
                failure_url: `${this.ESEWA_CONFIG.failureUrl}?orderId=${orderId}`,
                signed_field_names: 'total_amount,transaction_uuid,product_code',
                signature: signature
            };
            // Save minimal transaction record
            await prisma.paymentTransaction.create({
                data: {
                    orderId: order.id,
                    transactionId: transactionId,
                    amount: totalAmount,
                    status: 'PENDING',
                    paymentMethod: 'ESEWA',
                    paymentData: JSON.stringify(paymentData)
                }
            });
            // Return the payment data to frontend
            res.json({
                success: true,
                paymentData: paymentData,
                esewaUrl: `${this.ESEWA_CONFIG.baseUrl}/api/epay/main/v2/form`
            });
        }
        catch (error) {
            console.error('Error generating payment:', error);
            res.status(500).json({ error: 'Failed to generate payment' });
        }
    }
    // Handle eSewa callback (simplified)
    async handleEsewaCallback(req, res) {
        try {
            const data = req.body || req.query;
            console.log('eSewa callback received:', data);
            const { transaction_uuid, status, transaction_code } = data;
            if (!transaction_uuid) {
                return res.redirect('/payment-error.html');
            }
            // Find payment
            const payment = await prisma.paymentTransaction.findUnique({
                where: { transactionId: transaction_uuid },
                include: { order: true }
            });
            if (!payment) {
                return res.redirect('/payment-error.html');
            }
            if (status === 'COMPLETE' || transaction_code) {
                // Update payment
                await prisma.paymentTransaction.update({
                    where: { transactionId: transaction_uuid },
                    data: {
                        status: 'COMPLETED',
                        transactionCode: transaction_code,
                        paymentResponse: JSON.stringify(data),
                        completedAt: new Date()
                    }
                });
                // Update order
                await prisma.order.update({
                    where: { id: payment.orderId },
                    data: {
                        paymentStatus: 'COMPLETED',
                        status: 'PROCESSING',
                        updatedAt: new Date()
                    }
                });
                // Redirect to success page
                return res.redirect(`${process.env.FRONTEND_URL}/payment-success.html?orderId=${payment.orderId}`);
            }
            else {
                // Payment failed
                await prisma.paymentTransaction.update({
                    where: { transactionId: transaction_uuid },
                    data: {
                        status: 'FAILED',
                        paymentResponse: JSON.stringify(data),
                        completedAt: new Date()
                    }
                });
                await prisma.order.update({
                    where: { id: payment.orderId },
                    data: {
                        paymentStatus: 'FAILED',
                        status: 'CANCELLED'
                    }
                });
                return res.redirect(`${process.env.FRONTEND_URL}/payment-failed.html?orderId=${payment.orderId}`);
            }
        }
        catch (error) {
            console.error('Error handling callback:', error);
            res.redirect('/payment-error.html');
        }
    }
}
exports.SimplePaymentController = SimplePaymentController;
//# sourceMappingURL=payment.controller.js.map