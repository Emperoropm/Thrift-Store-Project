"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../error/app.error");
const prisma = new client_1.PrismaClient();
class CategoryService {
    async insertCategory(category) {
        try {
            const result = await prisma.category.create({
                data: {
                    name: category.name
                }
            });
            return result;
        }
        catch (err) {
            throw new app_error_1.AppError("Failed to create category: " + err.message, 400, { message: "error while insertcategory" });
        }
    }
    async getAllCategories() {
        return await prisma.category.findMany({
            include: {
                products: true
            }
        });
    }
    async getCategoryById(id) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                products: true
            }
        });
        if (!category) {
            throw new app_error_1.AppError("Category not found", 404, { message: "error while insertcategory" });
        }
        return category;
    }
    async updateCategory(id, data) {
        try {
            const updated = await prisma.category.update({
                where: { id },
                data: {
                    name: data.name
                }
            });
            return updated;
        }
        catch (err) {
            throw new app_error_1.AppError("Update failed: " + err.message, 400, { message: "error while insertcategory" });
        }
    }
    async deleteCategory(id) {
        try {
            return await prisma.category.delete({
                where: { id }
            });
        }
        catch (err) {
            throw new app_error_1.AppError("Delete failed: " + err.message, 400, { message: "error while insertcategory" });
        }
    }
    // For category filtering (with product count but not full products)
    async getAllCategoriesWithCount() {
        return await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    // For dropdown selection (minimal data)
    async getAllCategoriesForDropdown() {
        return await prisma.category.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=categories.service.js.map