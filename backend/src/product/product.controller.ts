import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import { Product } from "@prisma/client";
import { ProductModel } from "./product.model";
import { validate } from "class-validator";
import { AppError } from "../error/app.error";
import { ProductPatchModel } from "./product.patch.model";

export class ProductController {
  productService: ProductService;

  constructor() {
    this.productService = new ProductService();
    this.insertProduct = this.insertProduct.bind(this);
    this.getProducts = this.getProducts.bind(this);
  }

  async insertProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      
      if (!userId || !userRole) {
        throw new AppError("User information missing from token", 401, {});
      }

      const product = new ProductModel(
        req.body.title,
        req.body.price,
        req.body.quantity,
        userId,
        req.body.description,
        req.body.imageUrl,
        req.body.categoryId
      );

      const errors = await validate(product);
      if (errors.length > 0) {
        const validationError: Record<string, string> = {};
        for (const err of errors) {
          if (err.constraints) {
            const message = Object.values(err.constraints);
            if (message.length > 0 && typeof message[0] === "string") {
              validationError[err.property] = message[0];
            }
          }
        }
        throw new AppError("Validation failed", 400, validationError);
      }

      const result = await this.productService.insertProduct({
        ...req.body
      }, userId);

      res.status(201).json({
        message: "Product submitted for admin approval",
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  async getProducts(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (request as any).user?.id;
      const userRole = (request as any).user?.role;

      const result = await this.productService.getProducts(userId, userRole);

      response.status(200).json({
        message: "Products fetched successfully",
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

async getProductById(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(request.params.id);

    const result = await this.productService.getProductById(id);

    if (!result) {
      response.status(404).json({
        message: "Product not found"
      });
      return;
    }

    response.status(200).json({
      message: "Product fetched successfully",
      data: result
    });

  } catch (error) {
    next(error);
  }
}

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = Number(req.params.categoryId);
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (isNaN(categoryId) || categoryId <= 0) {
        throw new AppError("Invalid categoryId", 400, { message: "Error" });
      }

      const result = await this.productService.getProductsByCategory(categoryId, userId, userRole);

      res.status(200).json({
        message: `Products in category ${categoryId} fetched successfully`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (isNaN(id) || id <= 0 || !userId) {
        throw new AppError("Invalid product ID or user ID", 400, {});
      }

      // Validate only provided fields
      const productData = Object.assign(new ProductPatchModel(), req.body);
      const errors = await validate(productData, { skipMissingProperties: true });
      if (errors.length > 0) {
        const validationError: Record<string, string> = {};
        for (const err of errors) {
          if (err.constraints) {
            const message = Object.values(err.constraints);
            if (message.length > 0 && typeof message[0] === "string") {
              validationError[err.property] = message[0];
            }
          }
        }
        throw new AppError("Validation failed", 400, validationError);
      }

      const result = await this.productService.updateProduct(id, userId, userRole, req.body);

      const message = result.status === 'PENDING' 
        ? 'Product updated and sent for re-approval'
        : 'Product updated successfully';

      res.status(200).json({
        message,
        data: result
      });

    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = Number(req.params.id);
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!productId || isNaN(productId)) {
        throw new AppError("Invalid product ID", 400, {});
      }

      if (!userId) {
        throw new AppError("Invalid user ID", 401, {});
      }

      // Call service to delete
      const deletedProduct = await this.productService.deleteProduct(productId, userId, userRole);

      res.status(200).json({
        message: "Product deleted successfully",
        data: deletedProduct
      });
    } catch (error) {
      next(error);
    }
  };

  getProductsBySellerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { status } = req.query;

      if (!userId || userId <= 0) {
        throw new AppError("Invalid userId", 400, { message: "Error" });
      }

      const products = await this.productService.getProductsBySellerId(
        userId, 
        status as any
      );

      res.status(200).json({
        message: `Products fetched successfully`,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  // ========== ADMIN CONTROLLER METHODS ==========

  getPendingProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pendingProducts = await this.productService.getPendingProducts();

      res.status(200).json({
        message: "Pending products fetched successfully",
        data: pendingProducts
      });
    } catch (error) {
      next(error);
    }
  };

  approveProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = Number(req.params.id);
      const adminId = (req as any).user.id;

      if (!productId || isNaN(productId)) {
        throw new AppError("Invalid product ID", 400, {});
      }

      const result = await this.productService.approveProduct(productId, adminId);

      res.status(200).json({
        message: "Product approved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  rejectProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = Number(req.params.id);
      const adminId = (req as any).user.id;
      const { reason } = req.body;

      if (!productId || isNaN(productId)) {
        throw new AppError("Invalid product ID", 400, {});
      }

      const result = await this.productService.rejectProduct(productId, adminId, reason);

      res.status(200).json({
        message: "Product rejected successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = Number(req.params.id);
      const { status, reason } = req.body;

      if (!productId || isNaN(productId)) {
        throw new AppError("Invalid product ID", 400, {});
      }

      const result = await this.productService.updateProductStatus(productId, status, reason);

      res.status(200).json({
        message: "Product status updated successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  
}