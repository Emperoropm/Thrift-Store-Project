export declare class OrderService {
    createOrder(buyerId: number, products: {
        productId: number;
        quantity: number;
    }[]): Promise<({
        items: ({
            product: {
                id: number;
                title: string;
                sellerId: number;
            };
        } & {
            id: number;
            price: number;
            quantity: number;
            productId: number;
            orderId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        total: number;
        buyerId: number;
    }) | null>;
    getSellerOrders(sellerId: number): Promise<({
        product: {
            id: number;
            title: string;
        };
        order: {
            id: number;
            createdAt: Date;
            total: number;
            buyerId: number;
        };
    } & {
        id: number;
        price: number;
        quantity: number;
        productId: number;
        orderId: number;
    })[]>;
    getBuyerOrders(buyerId: number): Promise<({
        items: ({
            product: {
                id: number;
                title: string;
                sellerId: number;
            };
        } & {
            id: number;
            price: number;
            quantity: number;
            productId: number;
            orderId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        total: number;
        buyerId: number;
    })[]>;
}
//# sourceMappingURL=order.service.d.ts.map