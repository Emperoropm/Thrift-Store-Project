"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esewaConfig = void 0;
exports.esewaConfig = {
    // Test credentials (for development)
    merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
    // URLs
    baseUrl: process.env.ESEWA_BASE_URL || 'https://rc-epay.esewa.com.np',
    successUrl: process.env.ESEWA_SUCCESS_URL || 'http://localhost:3000/api/payment/esewa/success',
    failureUrl: process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/api/payment/esewa/failure',
    // For production, use:
    // baseUrl: 'https://epay.esewa.com.np'
};
//# sourceMappingURL=esewa.config.js.map