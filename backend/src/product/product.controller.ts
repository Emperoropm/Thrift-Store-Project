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
    this.getProductById = this.getProductById.bind(this);
    this.getProductsByCategory = this.getProductsByCategory.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
    this.getProductsBySellerId = this.getProductsBySellerId.bind(this);
    this.getPendingProducts = this.getPendingProducts.bind(this);
    this.approveProduct = this.approveProduct.bind(this);
    this.rejectProduct = this.rejectProduct.bind(this);
    this.updateProductStatus = this.updateProductStatus.bind(this);
    this.getProductsBySellerIdPublic = this.getProductsBySellerIdPublic.bind(this);
    this.getNearbyProducts = this.getNearbyProducts.bind(this);
  }
async insertProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    if (!userId || !userRole) {
      throw new AppError("User information missing from token", 401, {});
    }

    // Handle uploaded files
    const files = req.files as Express.Multer.File[];
    let imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrls = files.map(file => `${baseUrl}/uploads/products/${file.filename}`);
    }

    // Parse location if it's a string
    let locationData = null;
    if (req.body.location) {
      try {
        locationData = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
      } catch (e) {
        console.error('Error parsing location:', e);
      }
    }

    // Prepare product data
    const productData = {
      title: req.body.title,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      description: req.body.description,
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
      images: imageUrls,
      purchaseDate: req.body.purchaseDate,
      gender: req.body.gender,
      refundable: req.body.refundable === 'true' || req.body.refundable === true,
      location: locationData
    };

    console.log('Product data to insert:', productData);

    const result = await this.productService.insertProduct(productData, userId);

    res.status(201).json({
      message: "Product submitted for admin approval",
      data: result
    });

  } catch (error) {
    next(error);
  }
}

async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (isNaN(id) || id <= 0 || !userId) {
      throw new AppError("Invalid product ID or user ID", 400, {});
    }

    // Handle uploaded new images
    const files = req.files as Express.Multer.File[];
    let newImageUrls: string[] = [];
    
    if (files && files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      newImageUrls = files.map(file => `${baseUrl}/uploads/products/${file.filename}`);
    }

    // Parse imagesToDelete if it's a string
    let imagesToDelete = req.body.imagesToDelete;
    if (imagesToDelete && typeof imagesToDelete === 'string') {
      try {
        imagesToDelete = JSON.parse(imagesToDelete);
      } catch (e) {
        imagesToDelete = imagesToDelete.split(',').filter((s: string) => s.trim());
      }
    }

    // Parse location if it's a string
    let locationData = null;
    if (req.body.location) {
      try {
        locationData = typeof req.body.location === 'string' 
          ? JSON.parse(req.body.location) 
          : req.body.location;
      } catch (e) {
        console.error('Error parsing location:', e);
      }
    }

    // Prepare update data
    const updateData: any = {
      title: req.body.title,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      quantity: req.body.quantity ? parseInt(req.body.quantity) : undefined,
      description: req.body.description,
      categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
      purchaseDate: req.body.purchaseDate,
      gender: req.body.gender,
      refundable: req.body.refundable !== undefined ? 
        (req.body.refundable === 'true' || req.body.refundable === true) : 
        undefined,
      location: locationData,
      newImages: newImageUrls,
      imagesToDelete: imagesToDelete
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('Update data:', updateData);

    const result = await this.productService.updateProduct(id, userId, userRole, updateData);

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

  // Public endpoint to get products by seller ID
  getProductsBySellerIdPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = parseInt(req.params.sellerId!);
      
      if (isNaN(sellerId)) {
        throw new AppError("Invalid seller ID", 400, {});
      }
      
      // Public endpoint - only show approved products with stock
      const products = await this.productService.getProductsByAnySellerId(sellerId, false);
      
      res.status(200).json({
        message: "Seller products fetched successfully",
        data: products
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

  async getNearbyProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10;

    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError("Valid lat and lng query params are required", 400, {});
    }

    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const products = await this.productService.getNearbyProducts(lat, lng, radius, userId, userRole);

    res.status(200).json({
      message: "Nearby products fetched successfully",
      data: products,
      count: products.length
    });

  } catch (error) {
    next(error);
  }
}
}