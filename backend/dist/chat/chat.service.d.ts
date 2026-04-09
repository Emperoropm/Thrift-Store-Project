export declare const findOrCreateConversation: (user1Id: number, user2Id: number) => Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    user1Id: number;
    user2Id: number;
}>;
export declare const createMessage: (conversationId: number, senderId: number, content: string) => Promise<{
    id: number;
    createdAt: Date;
    read: boolean;
    conversationId: number;
    senderId: number;
    content: string;
}>;
//# sourceMappingURL=chat.service.d.ts.map