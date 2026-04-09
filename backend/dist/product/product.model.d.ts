export declare class LocationModel {
    address: string;
    lat: number;
    lng: number;
}
export declare class ProductModel {
    id?: number;
    title: string;
    description?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    images?: string[];
    purchaseDate?: string;
    gender?: string;
    refundable?: boolean;
    location?: LocationModel;
    categoryId?: number;
    sellerId: number;
    createdAt?: Date;
    status?: string;
    rejectionReason?: string;
    constructor(title: string, price: number, quantity: number, sellerId: number, description?: string, imageUrl?: string, categoryId?: number, id?: number, createdAt?: Date, status?: string, rejectionReason?: string, images?: string[], purchaseDate?: string, gender?: string, refundable?: boolean, location?: LocationModel);
}
//# sourceMappingURL=product.model.d.ts.map