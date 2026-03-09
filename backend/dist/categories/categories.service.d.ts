import { Category } from '@prisma/client';
export declare class CategoryService {
    insertCategory(category: Omit<Category, "id">): Promise<Category>;
    getAllCategories(): Promise<Category[]>;
    getCategoryById(id: number): Promise<Category>;
    updateCategory(id: number, data: Partial<Category>): Promise<Category>;
    deleteCategory(id: number): Promise<Category>;
    getAllCategoriesWithCount(): Promise<Category[]>;
    getAllCategoriesForDropdown(): Promise<Category[]>;
}
//# sourceMappingURL=categories.service.d.ts.map