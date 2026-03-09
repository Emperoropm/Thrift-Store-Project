export declare class AppError extends Error {
    statusCode?: number;
    errors?: Record<string, string>;
    constructor(message: string, statusCode: number, errors: Record<string, string>);
}
//# sourceMappingURL=app.error.d.ts.map