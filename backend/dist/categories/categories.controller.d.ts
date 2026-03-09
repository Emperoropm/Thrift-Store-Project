import { Request, Response, NextFunction } from "express";
export declare class CategoryController {
    insertCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllCategoriesWithCount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCategoriesForDropdown: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=categories.controller.d.ts.map