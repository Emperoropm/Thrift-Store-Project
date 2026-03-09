import { Product, ProductStatus } from '@prisma/client';
export declare class ProductService {
    insertProduct(product: Omit<Product, "id" | "status" | "createdAt" | "updatedAt">, sellerId: number): Promise<Product>;
    getProducts(userId?: number, userRole?: string): Promise<Product[]>;
    getProductById(id: number): Promise<Product | null>;
    getProductsByCategory: (categoryId: number, userId?: number, userRole?: string) => Promise<Product[]>;
    updateProduct: (id: number, sellerId: number, userRole: string, productData: Partial<Product>) => Promise<Product>;
    deleteProduct: (id: number, sellerId: number, userRole: string) => Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date | null;
        title: string;
        description: string | null;
        price: number;
        quantity: number;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        rejectionReason: string | null;
        categoryId: number | null;
        sellerId: number;
    }>;
    getProductsBySellerId: (sellerId: number, status?: ProductStatus) => Promise<Product[]>;
    getPendingProducts(): Promise<Product[]>;
    approveProduct(id: number, adminId: number): Promise<Product>;
    rejectProduct(id: number, adminId: number, reason: string): Promise<Product>;
    updateProductStatus(id: number, status: ProductStatus, reason?: string): Promise<Product>;
}
//# sourceMappingURL=product.service.d.ts.map