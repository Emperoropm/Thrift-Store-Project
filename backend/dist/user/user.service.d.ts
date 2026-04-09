export declare class UserService {
    getUserById(userId: number): Promise<{
        id: number;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        photo: string | null;
        createdAt: Date;
    }>;
    updateUserPhoto(userId: number, photoPath: string): Promise<{
        id: number;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        photo: string | null;
        createdAt: Date;
    }>;
    removeUserPhoto(userId: number): Promise<{
        id: number;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        photo: string | null;
        createdAt: Date;
    }>;
    getSellerPhoto(sellerId: number): Promise<{
        photo: string | null;
    } | null>;
    getSellerProfile(sellerId: number): Promise<{
        id: number;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        photo: string | null;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map