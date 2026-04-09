export declare class EsewaService {
    private generateTransactionId;
    createPaymentRequest(orderId: number, totalAmount: number): Promise<{
        paymentUrl: string;
        paymentData: {
            amount: string;
            tax_amount: string;
            total_amount: string;
            transaction_uuid: string;
            product_code: string;
            product_service_charge: string;
            product_delivery_charge: string;
            success_url: string;
            failure_url: string;
            signed_field_names: string;
            signature: string;
            customer_name: string;
            customer_email: string;
            customer_phone: string;
        };
        transactionId: string;
    }>;
    verifyPaymentFromCallback(data: any): Promise<{
        success: boolean;
        orderId: number;
        transactionId: any;
        transactionCode: any;
        message: string;
    } | {
        success: boolean;
        orderId: number;
        transactionId: any;
        message: string;
        transactionCode?: never;
    }>;
    handleCallback(data: any): Promise<{
        success: boolean;
        orderId: number;
        transactionId: any;
        transactionCode: any;
        message: string;
    } | {
        success: boolean;
        orderId: number;
        transactionId: any;
        message: string;
        transactionCode?: never;
    }>;
    verifyPaymentManually(transactionId: string, orderId: number): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getPaymentStatus(orderId: number): Promise<{
        status: import(".prisma/client").$Enums.PaymentStatus;
        transactionId: string;
        transactionCode: string | null;
        amount: number;
        paymentMethod: string;
        createdAt: Date;
        completedAt: Date | null;
    } | null>;
    cancelPayment(transactionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=esewa.service.d.ts.map