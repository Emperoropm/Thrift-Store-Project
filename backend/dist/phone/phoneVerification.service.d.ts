export declare class PhoneVerificationService {
    generateCustomToken(userId: number, email: string, phoneNumber: string): Promise<string>;
    verifyFirebaseUser(firebaseUid: string, phoneNumber: string): Promise<boolean>;
    saveVerifiedPhoneNumber(userId: number, phoneNumber: string, firebaseUid: string): Promise<{
        id: number;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        phoneVerified: boolean;
    }>;
    canAddProduct(userId: number): Promise<boolean>;
    getVerificationStatus(userId: number): Promise<{
        isVerified: boolean;
        hasPhoneNumber: boolean;
        phoneNumber: string | null;
    }>;
}
//# sourceMappingURL=phoneVerification.service.d.ts.map