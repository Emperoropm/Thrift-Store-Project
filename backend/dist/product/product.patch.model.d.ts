declare class LocationPatchModel {
    address?: string;
    lat?: number;
    lng?: number;
}
export declare class ProductPatchModel {
    title?: string;
    description?: string;
    price?: number;
    quantity?: number;
    imageUrl?: string;
    images?: string[];
    imagesToDelete?: string[];
    newImages?: string[];
    purchaseDate?: string;
    gender?: string;
    refundable?: boolean;
    location?: LocationPatchModel;
    categoryId?: number;
    constructor(init?: Partial<ProductPatchModel>);
}
export {};
//# sourceMappingURL=product.patch.model.d.ts.map