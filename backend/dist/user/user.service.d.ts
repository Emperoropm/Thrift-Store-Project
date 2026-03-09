export declare class UserService {
    getUserById(userId: number): Promise<{
        id: number;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map