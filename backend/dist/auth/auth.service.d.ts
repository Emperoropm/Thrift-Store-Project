import { AuthModel, UserResponse } from "./auth.model";
export declare class AuthService {
    findUserByEmail(email: string): Promise<AuthModel | null>;
    insertQuery(auth: Omit<AuthModel, "id">): Promise<{
        user: UserResponse;
        token: string;
    }>;
    loginQuery(email: string, password: string): Promise<{
        user: UserResponse;
        token: string;
    }>;
    getAllUsers(): Promise<UserResponse[]>;
    getUserById(id: number): Promise<UserResponse>;
    deleteUser(id: number): Promise<UserResponse>;
    updateUserProfile(id: number, data: Partial<AuthModel>): Promise<UserResponse>;
}
//# sourceMappingURL=auth.service.d.ts.map