import { Role } from "@prisma/client";
export declare class AuthModel {
    id?: number;
    name?: string | null;
    email?: string;
    password?: string;
    role?: string;
    dailyProductCount?: number;
    lastProductDate?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(name?: string, email?: string, password?: string, role?: string);
}
export interface UserResponse {
    id: number;
    name: string | null;
    email: string;
    role: Role;
    dailyProductCount: number;
    lastProductDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=auth.model.d.ts.map