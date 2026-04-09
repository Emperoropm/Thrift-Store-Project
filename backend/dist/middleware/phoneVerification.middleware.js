"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachVerificationStatus = exports.requirePhoneVerification = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const requirePhoneVerification = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                requiresVerification: false
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { phoneVerified: true }
        });
        if (!user || !user.phoneVerified) {
            return res.status(403).json({
                success: false,
                message: 'Phone number verification required to add products. Please verify your phone number first.',
                requiresVerification: true,
                code: 'PHONE_VERIFICATION_REQUIRED'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error in phone verification middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.requirePhoneVerification = requirePhoneVerification;
// Optional: Middleware to check but not block (just attach status to request)
const attachVerificationStatus = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { phoneVerified: true, phone: true }
            });
            req.verificationStatus = {
                isVerified: user?.phoneVerified || false,
                hasPhoneNumber: !!user?.phone
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.attachVerificationStatus = attachVerificationStatus;
//# sourceMappingURL=phoneVerification.middleware.js.map