export declare class NotificationService {
    static notifyProductSubmitted(productId: number, sellerId: number): Promise<void>;
    static notifyProductApproved(productId: number, adminId: number): Promise<void>;
    static notifyProductRejected(productId: number, adminId: number, reason: string): Promise<void>;
    static getUserNotifications(userId: number): Promise<{
        message: string;
        id: number;
        createdAt: Date;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: number;
    }[]>;
    static markAsRead(notificationId: number): Promise<{
        message: string;
        id: number;
        createdAt: Date;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        userId: number;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map