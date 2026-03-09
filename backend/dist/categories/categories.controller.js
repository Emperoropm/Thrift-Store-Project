"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const categories_service_1 = require("./categories.service");
const categoryService = new categories_service_1.CategoryService();
class CategoryController {
    async insertCategory(req, res, next) {
        try {
            const result = await categoryService.insertCategory(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllCategories(req, res, next) {
        try {
            const categories = await categoryService.getAllCategories();
            res.json(categories);
        }
        catch (error) {
            next(error);
        }
    }
    async getCategoryById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const category = await categoryService.getCategoryById(id);
            res.json(category);
        }
        catch (error) {
            next(error);
        }
    }
    async updateCategory(req, res, next) {
        try {
            const id = Number(req.params.id);
            const updated = await categoryService.updateCategory(id, req.body);
            res.json(updated);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCategory(req, res, next) {
        try {
            const id = Number(req.params.id);
            const deleted = await categoryService.deleteCategory(id);
            res.json({
                message: "Category deleted successfully",
                deleted
            });
        }
        catch (error) {
            next(error);
        }
    }
    // category.controller.ts
    // For category filtering
    getAllCategoriesWithCount = async (req, res, next) => {
        try {
            const categories = await categoryService.getAllCategoriesWithCount();
            res.json(categories);
        }
        catch (error) {
            next(error);
        }
    };
    // For dropdowns
    getAllCategoriesForDropdown = async (req, res, next) => {
        try {
            const categories = await categoryService.getAllCategoriesForDropdown();
            res.json(categories);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=categories.controller.js.map