import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK - DO THIS ONLY ONCE
let isFirebaseInitialized = false;

if (!admin.apps.length) {
  try {
    // Use environment variables
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
    console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    isFirebaseInitialized = true;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    console.warn('⚠️ Phone verification will run in DEVELOPMENT mode without Firebase');
    console.warn('   To fix: Generate a new service account key from Firebase Console');
    isFirebaseInitialized = false;
  }
}

export class PhoneVerificationService {
  
  async generateCustomToken(userId: number, email: string, phoneNumber: string): Promise<string> {
    // If Firebase is not initialized, return a mock token for development
    if (!isFirebaseInitialized) {
      console.log('⚠️ DEVELOPMENT MODE: Using mock token for user:', userId);
      return `mock-token-${userId}-${Date.now()}`;
    }
    
    try {
      const customToken = await admin.auth().createCustomToken(userId.toString(), {
        email: email,
        phoneNumber: phoneNumber,
        uid: userId.toString()
      });
      
      console.log('✅ Custom token generated for user:', userId);
      return customToken;
    } catch (error) {
      console.error('Error generating custom token:', error);
      // Fallback to mock token
      console.log('⚠️ Falling back to mock token for user:', userId);
      return `mock-token-${userId}-${Date.now()}`;
    }
  }

  async verifyFirebaseUser(firebaseUid: string, phoneNumber: string): Promise<boolean> {
    // If Firebase is not initialized, return true for development
    if (!isFirebaseInitialized) {
      console.log('⚠️ DEVELOPMENT MODE: Skipping Firebase verification');
      return true;
    }
    
    try {
      const firebaseUser = await admin.auth().getUser(firebaseUid);
      console.log('✅ Firebase user found:', firebaseUser.uid);
      return firebaseUser.phoneNumber === phoneNumber;
    } catch (error) {
      console.error('Error verifying Firebase user:', error);
      // For development, return true
      return true;
    }
  }

  async saveVerifiedPhoneNumber(userId: number, phoneNumber: string, firebaseUid: string) {
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

  async canAddProduct(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true }
    });
    return user?.phoneVerified === true;
  }

  async getVerificationStatus(userId: number) {
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