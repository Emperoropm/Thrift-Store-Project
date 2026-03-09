import { OrderItemModel } from "./orderItem.model";
export declare class OrderModel {
    buyerId: number;
    total: number;
    items: OrderItemModel[];
    createdAt?: Date;
    constructor(buyerId: number, total: number, items: OrderItemModel[], createdAt?: Date);
}
//# sourceMappingURL=order.model.d.ts.map