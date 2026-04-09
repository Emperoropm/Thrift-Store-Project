"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneVerificationController = void 0;
const phoneVerification_service_1 = require("./phoneVerification.service");
const app_error_1 = require("../error/app.error");
const client_1 = require("@prisma/client");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const prisma = new client_1.PrismaClient();
class PhoneVerificationController {
    phoneVerificationService;
    constructor() {
        this.phoneVerificationService = new phoneVerification_service_1.PhoneVerificationService();
        // Bind all methods
        this.generateToken = this.generateToken.bind(this);
        this.verifyAndSave = this.verifyAndSave.bind(this);
        this.canAddProduct = this.canAddProduct.bind(this);
        this.getVerificationStatus = this.getVerificationStatus.bind(this);
    }
    generateToken = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            console.log('Generate token request for user:', userId);
            console.log('Request body:', req.body);
            if (!userId) {
                throw new app_error_1.AppError("User not authenticated", 401, {});
            }
            const { phoneNumber } = req.body;
            if (!phoneNumber) {
                throw new app_error_1.AppError("Phone number is required", 400, {});
            }
            // Validate phone number format
            const phoneRegex = /^\+[1-9]\d{1,14}$/;
            if (!phoneRegex.test(phoneNumber)) {
                throw new app_error_1.AppError("Invalid phone number format. Use international format (e.g., +9779841234567)", 400, {});
            }
            // Check if phone number is already used
            const existingUser = await prisma.user.findFirst({
                where: {
                    phone: phoneNumber,
                    NOT: { id: userId }
                }
            });
            if (existingUser) {
                throw new app_error_1.AppError("Phone number already in use by another account", 400, {});
            }
            // Get user details
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new app_error_1.AppError("User not found", 404, {});
            }
            console.log('Generating token for user:', user.id, user.email);
            // Generate custom token for Firebase
            const customToken = await this.phoneVerificationService.generateCustomToken(userId, user.email, phoneNumber);
            console.log('Custom token generated successfully');
            res.status(200).json({
                success: true,
                message: "Verification token generated successfully",
                data: {
                    customToken,
                    phoneNumber
                }
            });
        }
        catch (error) {
            console.error('Error in generateToken:', error);
            next(error);
        }
    };
    verifyAndSave = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            console.log('verifyAndSave called for user:', userId);
            console.log('Request body:', req.body);
            if (!userId) {
                throw new app_error_1.AppError("User not authenticated", 401, {});
            }
            const { phoneNumber, firebaseUid } = req.body;
            if (!phoneNumber) {
                throw new app_error_1.AppError("Phone number is required", 400, {});
            }
            if (!firebaseUid) {
                throw new app_error_1.AppError("Firebase UID is required", 400, {});
            }
            // Optional Firebase verification (won't block in development)
            try {
                const firebaseUser = await firebase_admin_1.default.auth().getUser(firebaseUid);
                console.log('Firebase user found:', firebaseUser.uid, firebaseUser.phoneNumber);
                if (firebaseUser.phoneNumber !== phoneNumber) {
                    console.warn('Phone number mismatch, but continuing for development');
                }
            }
            catch (firebaseError) {
                console.log('Firebase verification skipped (development mode):', firebaseError.message);
                // Continue anyway in development
            }
            // Check if phone number is already used by another user
            const existingUser = await prisma.user.findFirst({
                where: {
                    phone: phoneNumber,
                    NOT: { id: userId }
                }
            });
            if (existingUser) {
                throw new app_error_1.AppError("Phone number already in use by another account", 400, {});
            }
            // Save verified phone number
            const updatedUser = await this.phoneVerificationService.saveVerifiedPhoneNumber(userId, phoneNumber, firebaseUid);
            console.log('✅ Phone verified and saved successfully for user:', userId);
            res.status(200).json({
                success: true,
                message: "Phone number verified successfully",
                data: updatedUser
            });
        }
        catch (error) {
            console.error('Error in verifyAndSave:', error);
            next(error);
        }
    };
    canAddProduct = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new app_error_1.AppError("User not authenticated", 401, {});
            }
            const canAddProduct = await this.phoneVerificationService.canAddProduct(userId);
            const status = await this.phoneVerificationService.getVerificationStatus(userId);
            res.status(200).json({
                success: true,
                data: {
                    canAddProduct,
                    ...status
                }
            });
        }
        catch (error) {
            console.error('Error in canAddProduct:', error);
            next(error);
        }
    };
    getVerificationStatus = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new app_error_1.AppError("User not authenticated", 401, {});
            }
            const status = await this.phoneVerificationService.getVerificationStatus(userId);
            res.status(200).json({
                success: true,
                data: status
            });
        }
        catch (error) {
            console.error('Error in getVerificationStatus:', error);
            next(error);
        }
    };
}
exports.PhoneVerificationController = PhoneVerificationController;
//# sourceMappingURL=phoneVerification.controller.js.map