interface OrderItem {
    title: string;
    quantity: number;
    price: number;
}
interface BuyerInfo {
    name: string;
    email: string;
    phone?: string | null;
}
interface ShippingInfo {
    fullName: string;
    phone: string;
    address: string;
    email: string;
}
interface SellerOrderEmailParams {
    sellerName: string;
    buyer: BuyerInfo;
    shippingInfo: ShippingInfo | null;
    items: OrderItem[];
    orderId: number;
    orderTotal: number;
}
export declare function buildSellerOrderEmail(params: SellerOrderEmailParams): string;
export {};
//# sourceMappingURL=email-templates.d.ts.map