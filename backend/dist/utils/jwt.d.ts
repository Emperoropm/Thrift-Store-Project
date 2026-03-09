export interface JwtPayload {
    id: number;
    email?: string;
    role?: string;
    name?: string;
}
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
//# sourceMappingURL=jwt.d.ts.map