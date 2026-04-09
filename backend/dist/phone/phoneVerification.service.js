"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneVerificationService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Initialize Firebase Admin SDK - DO THIS ONLY ONCE
let isFirebaseInitialized = false;
if (!firebase_admin_1.default.apps.length) {
    try {
        // Use environment variables
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        };
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized successfully');
        console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
        console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
        isFirebaseInitialized = true;
    }
    catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
        console.warn('⚠️ Phone verification will run in DEVELOPMENT mode without Firebase');
        console.warn('   To fix: Generate a new service account key from Firebase Console');
        isFirebaseInitialized = false;
    }
}
class PhoneVerificationService {
    async generateCustomToken(userId, email, phoneNumber) {
        // If Firebase is not initialized, return a mock token for development
        if (!isFirebaseInitialized) {
            console.log('⚠️ DEVELOPMENT MODE: Using mock token for user:', userId);
            return `mock-token-${userId}-${Date.now()}`;
        }
        try {
            const customToken = await firebase_admin_1.default.auth().createCustomToken(userId.toString(), {
                email: email,
                phoneNumber: phoneNumber,
                uid: userId.toString()
            });
            console.log('✅ Custom token generated for user:', userId);
            return customToken;
        }
        catch (error) {
            console.error('Error generating custom token:', error);
            // Fallback to mock token
            console.log('⚠️ Falling back to mock token for user:', userId);
            return `mock-token-${userId}-${Date.now()}`;
        }
    }
    async verifyFirebaseUser(firebaseUid, phoneNumber) {
        // If Firebase is not initialized, return true for development
        if (!isFirebaseInitialized) {
            console.log('⚠️ DEVELOPMENT MODE: Skipping Firebase verification');
            return true;
        }
        try {
            const firebaseUser = await firebase_admin_1.default.auth().getUser(firebaseUid);
            console.log('✅ Firebase user found:', firebaseUser.uid);
            return firebaseUser.phoneNumber === phoneNumber;
        }
        catch (error) {
            console.error('Error verifying Firebase user:', error);
            // For development, return true
            return true;
        }
    }
    async saveVerifiedPhoneNumber(userId, phoneNumber, firebaseUid) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                phone: phoneNumber,
                phoneVerified: true,
                firebaseUid: firebaseUid
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                phoneVerified: true,
                role: true
            }
        });
    }
    async canAddProduct(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { phoneVerified: true }
        });
        return user?.phoneVerified === true;
    }
    async getVerificationStatus(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                phone: true,
                phoneVerified: true
            }
        });
        return {
            isVerified: user?.phoneVerified || false,
            hasPhoneNumber: !!user?.phone,
            phoneNumber: user?.phone || null
        };
    }
}
exports.PhoneVerificationService = PhoneVerificationService;
//# sourceMappingURL=phoneVerification.service.js.map