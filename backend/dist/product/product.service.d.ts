import { Product, ProductStatus } from '@prisma/client';
export declare class ProductService {
    insertProduct(product: any, sellerId: number): Promise<Product>;
    getProducts(userId?: number, userRole?: string): Promise<Product[]>;
    getProductById(id: number): Promise<Product | null>;
    getProductsByCategory: (categoryId: number, userId?: number, userRole?: string) => Promise<Product[]>;
    updateProduct: (id: number, sellerId: number, userRole: string, productData: any) => Promise<Product>;
    deleteProduct: (id: number, sellerId: number, userRole: string) => Promise<{
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
    }>;
    getProductsBySellerId: (sellerId: number, status?: ProductStatus) => Promise<Product[]>;
    getProductsByAnySellerId(sellerId: number, includeAll?: boolean): Promise<Product[]>;
    getPendingProducts(): Promise<Product[]>;
    approveProduct(id: number, adminId: number): Promise<Product>;
    rejectProduct(id: number, adminId: number, reason: string): Promise<Product>;
    updateProductStatus(id: number, status: ProductStatus, reason?: string): Promise<Product>;
    getNearbyProducts(userLat: number, userLng: number, radiusKm?: number, userId?: number, userRole?: string): Promise<any[]>;
    private haversine;
    private toRad;
}
//# sourceMappingURL=product.service.d.ts.map