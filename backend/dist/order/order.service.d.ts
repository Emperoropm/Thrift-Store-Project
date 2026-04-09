import { UpdateOrderItemStatusDto } from './update-order-status.dto';
import { CancelOrderItemDto } from './cancel-order-item.dto';
export declare class OrderService {
    createOrder(buyerId: number, products: {
        productId: number;
        quantity: number;
    }[]): Promise<({
        items: ({
            product: {
                id: number;
                title: string;
                images: string[];
                sellerId: number;
            };
        } & {
            id: number;
            updatedAt: Date;
            price: number;
            quantity: number;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            productId: number;
            orderId: number;
            cancelledReason: string | null;
            deliveredAt: Date | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        buyerId: number;
    }) | null>;
    getSellerOrders(sellerId: number): Promise<({
        product: {
            id: number;
            title: string;
            images: string[];
        };
        order: {
            id: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            buyer: {
                name: string | null;
                email: string;
            };
            total: number;
            buyerId: number;
        };
    } & {
        id: number;
        updatedAt: Date;
        price: number;
        quantity: number;
        status: import(".prisma/client").$Enums.OrderItemStatus;
        productId: number;
        orderId: number;
        cancelledReason: string | null;
        deliveredAt: Date | null;
    })[]>;
    getBuyerOrders(buyerId: number): Promise<({
        items: ({
            product: {
                id: number;
                title: string;
                images: string[];
                sellerId: number;
            };
        } & {
            id: number;
            updatedAt: Date;
            price: number;
            quantity: number;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            productId: number;
            orderId: number;
            cancelledReason: string | null;
            deliveredAt: Date | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        buyerId: number;
    })[]>;
    updateOrderItemStatus(orderItemId: number, sellerId: number, data: UpdateOrderItemStatusDto): Promise<{
        product: {
            id: number;
            title: string;
            images: string[];
            sellerId: number;
        };
        order: {
            buyer: {
                id: number;
                name: string | null;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            buyerId: number;
        };
    } & {
        id: number;
        updatedAt: Date;
        price: number;
        quantity: number;
        status: import(".prisma/client").$Enums.OrderItemStatus;
        productId: number;
        orderId: number;
        cancelledReason: string | null;
        deliveredAt: Date | null;
    }>;
    cancelOrderItem(orderItemId: number, sellerId: number, data: CancelOrderItemDto): Promise<{
        product: {
            id: number;
            title: string;
            images: string[];
            sellerId: number;
        };
        order: {
            buyer: {
                id: number;
                name: string | null;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            buyerId: number;
        };
    } & {
        id: number;
        updatedAt: Date;
        price: number;
        quantity: number;
        status: import(".prisma/client").$Enums.OrderItemStatus;
        productId: number;
        orderId: number;
        cancelledReason: string | null;
        deliveredAt: Date | null;
    }>;
    markAsDelivered(orderItemId: number, sellerId: number): Promise<{
        product: {
            id: number;
            title: string;
            images: string[];
            sellerId: number;
        };
        order: {
            buyer: {
                id: number;
                name: string | null;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            buyerId: number;
        };
    } & {
        id: number;
        updatedAt: Date;
        price: number;
        quantity: number;
        status: import(".prisma/client").$Enums.OrderItemStatus;
        productId: number;
        orderId: number;
        cancelledReason: string | null;
        deliveredAt: Date | null;
    }>;
    private updateOrderStatus;
    private createStatusChangeNotification;
    getOrderItemDetails(orderItemId: number, sellerId: number): Promise<{
        product: {
            id: number;
            title: string;
            images: string[];
        };
        order: {
            buyer: {
                id: number;
                name: string | null;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            buyerId: number;
        };
    } & {
        id: number;
        updatedAt: Date;
        price: number;
        quantity: number;
        status: import(".prisma/client").$Enums.OrderItemStatus;
        productId: number;
        orderId: number;
        cancelledReason: string | null;
        deliveredAt: Date | null;
    }>;
    getOrderById(orderId: number, buyerId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        items: {
            id: number;
            updatedAt: Date;
            price: number;
            quantity: number;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            product: {
                id: number;
                title: string;
                price: number;
                images: string[];
                sellerId: number;
            };
            cancelledReason: string | null;
            deliveredAt: Date | null;
        }[];
        total: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        buyerId: number;
    } | null>;
    markAsReceived(orderItemId: number, buyerId: number): Promise<{
        product: {
            seller: {
                id: number;
                name: string | null;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date | null;
            title: string;
            description: string | null;
            price: number;
            quantity: number;
            images: string[];
            status: import(".prisma/client").$Enums.ProductStatus;
            purchaseDate: Date | null;
            gender: string | null;
            refundable: boolean;
            location: import("@prisma/client/runtime/library").JsonValue | null;
            rejectionReason: string | null;
            categoryId: number | null;
            sellerId: number;
        };
        order: {
            buyer: {
                id: number;
                name: string | null;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            buyerId: number;
        };
    } & {
        id: number;
        updatedAt: Date;
        price: number;
        quantity: number;
        status: import(".prisma/client").$Enums.OrderItemStatus;
        productId: number;
        orderId: number;
        cancelledReason: string | null;
        deliveredAt: Date | null;
    }>;
}
//# sourceMappingURL=order.service.d.ts.map