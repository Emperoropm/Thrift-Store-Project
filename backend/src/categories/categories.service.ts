import { Category } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../error/app.error';

const prisma = new PrismaClient();

export class CategoryService {

  async insertCategory(category: Omit<Category, "id">): Promise<Category> {
    try {
      const result = await prisma.category.create({
        data: {
          name: category.name
        }
      });
      return result;
    } catch (err: any) {
      throw new AppError("Failed to create category: " + err.message, 400,{message:"error while insertcategory"});
    }
  }

  async getAllCategories(): Promise<Category[]> {
    return await prisma.category.findMany({
      include: {
        products: true
      }
    });
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true
      }
    });

    if (!category) {
      throw new AppError("Category not found", 404,{message:"error while insertcategory"});
    }

    return category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    try {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          name: data.name!
        }
      });

      return updated;
    } catch (err: any) {
      throw new AppError("Update failed: " + err.message, 400,{message:"error while insertcategory"});
    }
  }

  async deleteCategory(id: number): Promise<Category> {
    try {
      return await prisma.category.delete({
        where: { id }
      });
    } catch (err: any) {
      throw new AppError("Delete failed: " + err.message, 400,{message:"error while insertcategory"});
    }
  }

  // For category filtering (with product count but not full products)
async getAllCategoriesWithCount(): Promise<Category[]> {
    return await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
}

// For dropdown selection (minimal data)
async getAllCategoriesForDropdown(): Promise<Category[]> {
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
