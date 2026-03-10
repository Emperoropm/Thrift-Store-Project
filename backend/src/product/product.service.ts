import { Product, ProductStatus, Rating } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../error/app.error';
import { NotificationService } from './notification.service';

const prisma = new PrismaClient();

export class ProductService {
  async insertProduct(product: Omit<Product, "id" | "status" | "createdAt" | "updatedAt">, sellerId: number): Promise<Product> {
    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { dailyProductCount: true, lastProductDate: true }
    });

    if (!seller) {
      throw new AppError("User not found", 404, {});
    }

    // Check if it's a new day
    const lastDate = seller.lastProductDate;
    const isNewDay = !lastDate || new Date(lastDate) < today;

    if (isNewDay) {
      // Reset counter for new day
      await prisma.user.update({
        where: { id: sellerId },
        data: { dailyProductCount: 0, lastProductDate: today }
      });
    } else {
      // Check limit
      if (seller.dailyProductCount >= 2) {
        // Send notification
        await prisma.notification.create({
          data: {
            userId: sellerId,
            type: 'DAILY_LIMIT_REACHED',
            title: 'Daily Product Limit Reached',
            message: 'You have reached the maximum limit of 2 products per day.'
          }
        });
        
        throw new AppError('Daily limit reached', 400, {
          message: 'You can only add 2 products per day. Please try again tomorrow.'
        });
      }
    }

    // Create product
    const result = await prisma.product.create({
      data: {
        title: product.title,
        description: product.description ?? null,
        price: product.price,
        quantity: product.quantity,
        imageUrl: product.imageUrl ?? null,
        categoryId: product.categoryId ?? null,
        sellerId: sellerId,
        status: 'PENDING'
      }
    });

    // Update daily counter
    await prisma.user.update({
      where: { id: sellerId },
      data: {
        dailyProductCount: { increment: 1 },
        lastProductDate: new Date()
      }
    });

    // Send notification to admins
    await NotificationService.notifyProductSubmitted(result.id, sellerId);

    return result;
  }

  async getProducts(userId?: number, userRole?: string): Promise<Product[]> {
    let whereClause: any = {};

    if (userRole === 'ADMIN') {
      // Admin can see all products
      whereClause = {};
    } else if (userId && userRole === 'USER') {
      // Seller can see their own products + approved products from others
      whereClause = {
        OR: [
          { sellerId: userId },
          { status: 'APPROVED', quantity: { gt: 0 } }
        ]
      };
    } else {
      // Guest users only see approved products
      whereClause = { status: 'APPROVED', quantity: { gt: 0 } };
    }

    const result = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return result;
  }

  async getProductById(id: number): Promise<Product | null> {
    const result = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return result;
  }

  getProductsByCategory = async (categoryId: number, userId?: number, userRole?: string): Promise<Product[]> => {
    let whereClause: any = { categoryId };

    if (userRole !== 'ADMIN') {
      whereClause = {
        categoryId,
        OR: [
          ...(userId && userRole === 'USER' ? [{ sellerId: userId }] : []),
          { status: 'APPROVED', quantity: { gt: 0 } }
        ]
      };
    }

    return prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  updateProduct = async (
    id: number,
    sellerId: number,
    userRole: string,
    productData: Partial<Product>
  ): Promise<Product> => {
    const existingProduct = await prisma.product.findUnique({ 
      where: { id },
      include: { seller: true }
    });
    
    if (!existingProduct) throw new AppError("Product not found", 404, {});

    // Check authorization
    if (userRole !== 'ADMIN' && existingProduct.sellerId !== sellerId) {
      throw new AppError("You are not authorized to update this product", 403, {});
    }

    // If product is approved and seller is editing, change status to PENDING
    const updateData: any = {};
    if (productData.title !== undefined) updateData.title = productData.title;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.price !== undefined) updateData.price = productData.price;
    if (productData.quantity !== undefined) updateData.quantity = productData.quantity;
    if (productData.imageUrl !== undefined) updateData.imageUrl = productData.imageUrl;
    if (productData.categoryId !== undefined) updateData.categoryId = productData.categoryId;

    // Auto-change status for approved products edited by sellers
    if (existingProduct.status === 'APPROVED' && userRole === 'USER') {
      updateData.status = 'PENDING';
      // Notify admins about edit
      await NotificationService.notifyProductSubmitted(id, sellerId);
    }

    const result = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return result;
  }

  deleteProduct = async (id: number, sellerId: number, userRole: string) => {
    // First, check if the product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError("Product not found", 404, {});
    }

    // Check authorization
    if (userRole !== 'ADMIN' && product.sellerId !== sellerId) {
      throw new AppError("You are not authorized to delete this product", 403, {});
    }

    // Delete the product
    const deleted = await prisma.product.delete({
      where: { id }
    });

    return deleted;
  };

  getProductsBySellerId = async (sellerId: number, status?: ProductStatus): Promise<Product[]> => {
    const whereClause: any = { sellerId };
    if (status) {
      whereClause.status = status;
    }

    return prisma.product.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
  };

  // ========== ADMIN METHODS ==========
  
  async getPendingProducts(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { status: 'PENDING' },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async approveProduct(id: number, adminId: number): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedAt: new Date()
      },
      include: { seller: true }
    });

    // Send notification to seller
    await NotificationService.notifyProductApproved(id, adminId);

    return product;
  }

  async rejectProduct(id: number, adminId: number, reason: string): Promise<Product> {
    if (!reason || reason.trim().length === 0) {
      throw new AppError("Rejection reason is required", 400, {});
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        updatedAt: new Date()
      },
      include: { seller: true }
    });

    // Send notification to seller
    await NotificationService.notifyProductRejected(id, adminId, reason);

    return product;
  }

  async updateProductStatus(id: number, status: ProductStatus, reason?: string): Promise<Product> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'REJECTED' && reason) {
      updateData.rejectionReason = reason;
    }

    return prisma.product.update({
      where: { id },
      data: updateData
    });
  }

  // Add this method to ProductService class
async getProductsByAnySellerId(sellerId: number, includeAll: boolean = false): Promise<Product[]> {
  const whereClause: any = { sellerId };
  
  // If not including all, only show approved products with quantity > 0
  if (!includeAll) {
    whereClause.status = 'APPROVED';
    whereClause.quantity = { gt: 0 };
  }
  // If includeAll is true, show all products regardless of status or quantity
  
  return prisma.product.findMany({
    where: whereClause,
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' }
  });
}
}