import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  // Create notification for product submission
  static async notifyProductSubmitted(productId: number, sellerId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    });

    if (!product) return;

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'PRODUCT_SUBMITTED' as const,
      title: 'New Product Submitted',
      message: `${product.seller.name || product.seller.email} submitted "${product.title}" for approval.`,
      metadata: { productId, sellerId, sellerName: product.seller.name }
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'PRODUCT_SUBMITTED',
        title: 'Product Submitted for Review',
        message: `Your product "${product.title}" has been submitted for admin approval.`
      }
    });
  }

  // Notify product approval
  static async notifyProductApproved(productId: number, adminId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    });

    if (!product) return;

    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        type: 'PRODUCT_APPROVED',
        title: 'Product Approved!',
        message: `Your product "${product.title}" has been approved and is now live on the marketplace.`,
        metadata: { productId, adminId }
      }
    });
  }

  // Notify product rejection
  static async notifyProductRejected(productId: number, adminId: number, reason: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    });

    if (!product) return;

    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        type: 'PRODUCT_REJECTED',
        title: 'Product Rejected',
        message: `Your product "${product.title}" was rejected. Reason: ${reason}`,
        metadata: { productId, adminId, reason }
      }
    });
  }

  // Get notifications for a user
  static async getUserNotifications(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: number) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }
}