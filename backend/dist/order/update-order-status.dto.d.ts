import { OrderItemStatus } from '@prisma/client';
export declare class UpdateOrderItemStatusDto {
    status: OrderItemStatus;
    reason?: string;
    constructor(status: OrderItemStatus, reason?: string | undefined);
}
//# sourceMappingURL=update-order-status.dto.d.ts.map