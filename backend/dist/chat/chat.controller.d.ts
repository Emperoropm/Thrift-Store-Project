import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
        email?: string;
        name?: string;
    };
}
export declare const getConversations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createConversation: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getConversationMessages: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markConversationAsRead: (req: AuthRequest, res: Response) => Promise<void>;
export declare const markMessageAsRead: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=chat.controller.d.ts.map