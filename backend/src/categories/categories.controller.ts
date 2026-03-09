import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./categories.service";

const categoryService = new CategoryService();

export class CategoryController {

  async insertCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.insertCategory(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await categoryService.getCategoryById(id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const updated = await categoryService.updateCategory(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const deleted = await categoryService.deleteCategory(id);
      res.json({
        message: "Category deleted successfully",
        deleted
      });
    } catch (error) {
      next(error);
    }
  }

  // category.controller.ts

// For category filtering
getAllCategoriesWithCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await categoryService.getAllCategoriesWithCount();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// For dropdowns
getAllCategoriesForDropdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await categoryService.getAllCategoriesForDropdown();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};
}
