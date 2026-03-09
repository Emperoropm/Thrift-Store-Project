import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
export declare class ProductController {
    productService: ProductService;
    constructor();
    insertProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProducts(request: Request, response: Response, next: NextFunction): Promise<void>;
    getProductsByCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProductsBySellerId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPendingProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    approveProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    rejectProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProductStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=product.controller.d.ts.map