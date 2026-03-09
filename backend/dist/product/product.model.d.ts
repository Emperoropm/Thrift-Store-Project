export declare class ProductModel {
    id?: number;
    title: string;
    description?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    categoryId?: number;
    sellerId: number;
    createdAt?: Date;
    status?: string;
    rejectionReason?: string;
    constructor(title: string, price: number, quantity: number, sellerId: number, description?: string, imageUrl?: string, categoryId?: number, id?: number, createdAt?: Date, status?: string, rejectionReason?: string);
}
//# sourceMappingURL=product.model.d.ts.map