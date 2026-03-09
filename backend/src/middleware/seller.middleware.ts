import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sellerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow ADMIN to act as seller for testing
    if (user.role !== 'ADMIN') {
      // Check if user has any products (is a seller)
      const sellerProducts = await prisma.product.count({
        where: { sellerId: userId }
      });

      if (sellerProducts === 0) {
        return res.status(403).json({ 
          message: 'Access denied. You need to be a seller to perform this action.' 
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};