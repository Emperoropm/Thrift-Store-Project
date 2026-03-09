import { PrismaClient, OrderItemStatus, OrderStatus } from '@prisma/client';
import { AppError } from '../error/app.error';
import { UpdateOrderItemStatusDto } from './update-order-status.dto';
import { CancelOrderItemDto } from './cancel-order-item.dto';

const prisma = new PrismaClient();

export class OrderService {
  // products: array of { productId, quantity }
  async createOrder(buyerId: number, products: { productId: number; quantity: number }[]) {
    let total = 0;

    // Fetch all products
    const productRecords = await prisma.product.findMany({
      where: { 
        id: { in: products.map(p => p.productId) },
        status: 'APPROVED' // Only approved products can be purchased
      }
    });

    if (productRecords.length !== products.length) {
      throw new AppError("One or more products not found or not approved", 404, {});
    }

    // Validate stock and calculate total
    for (const item of products) {
      const product = productRecords.find(p => p.id === item.productId)!;
      if (product.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for product ${product.title}`, 400, {});
      }
      total += product.price * item.quantity;
    }

    // Create Order
    const order = await prisma.order.create({
      data: {
        buyerId,
        total,
        status: OrderStatus.PENDING
      }
    });

    // Create OrderItems
    const orderItemsData = products.map(item => {
      const product = productRecords.find(p => p.id === item.productId)!;
      return {
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        status: OrderItemStatus.PENDING
      };
    });

    await prisma.orderItem.createMany({ data: orderItemsData });

    // Update product stock
    for (const item of products) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { 
          quantity: { decrement: item.quantity },
          updatedAt: new Date()
        }
      });
    }

    // Create notification for each seller
    for (const item of products) {
      const product = productRecords.find(p => p.id === item.productId)!;
      
      // Check if seller is different from buyer (to avoid self-notification)
      if (product.sellerId !== buyerId) {
        await prisma.notification.create({
          data: {
            userId: product.sellerId,
            type: 'ORDER_PLACED',
            title: 'New Order Received',
            message: `Your product "${product.title}" has been ordered (Quantity: ${item.quantity})`,
            metadata: {
              orderId: order.id,
              productId: product.id,
              quantity: item.quantity,
              buyerId: buyerId
            }
          }
        });
      }
    }

    // Fetch full order details including products and seller info
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: { 
                id: true, 
                title: true, 
                sellerId: true,
                imageUrl: true 
              }
            }
          }
        }
      }
    });

    return fullOrder;
  }

async getSellerOrders(sellerId: number) {
  const soldItems = await prisma.orderItem.findMany({
    where: {
      product: { sellerId }
    },
    include: {
      product: { 
        select: { 
          id: true, 
          title: true,
          imageUrl: true 
        } 
      },
      order: { 
        select: { 
          id: true, 
          buyerId: true, 
          total: true, 
          createdAt: true, // This is Order.createdAt
          status: true,
          buyer: {
            select: {
              name: true,
              email: true
            }
          }
        } 
      }
    },
    orderBy: { 
      // Use updatedAt instead of createdAt since OrderItem doesn't have createdAt
      updatedAt: 'desc' 
    }
  });

  return soldItems;
}

async getBuyerOrders(buyerId: number) {
  const orders = await prisma.order.findMany({
    where: { buyerId },
    include: {
      items: {
        include: {
          product: {
            select: { 
              id: true, 
              title: true, 
              sellerId: true,
              imageUrl: true 
            }
          }
        },
        // Order items by updatedAt
        orderBy: {
          updatedAt: 'desc'
        }
      }
    },
    // Orders ordered by createdAt
    orderBy: { createdAt: 'desc' }
  });

  return orders;
}

// Update order item status (for sellers)
async updateOrderItemStatus(
  orderItemId: number, 
  sellerId: number,
  data: UpdateOrderItemStatusDto
) {
  // Verify the order item belongs to seller's product
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      product: {
        sellerId: sellerId
      }
    },
    include: {
      product: true,
      order: true
    }
  });

  if (!orderItem) {
    throw new AppError('Order item not found or unauthorized', 404, {});
  }

  // Ensure current status is never undefined
  const currentStatus = orderItem.status || OrderItemStatus.PENDING;
  
  // Prevent updating cancelled or delivered items
  if (currentStatus === OrderItemStatus.CANCELLED && data.status !== OrderItemStatus.CANCELLED) {
    throw new AppError('Cannot update status of a cancelled order item', 400, {});
  }

  if (currentStatus === OrderItemStatus.DELIVERED && data.status !== OrderItemStatus.DELIVERED) {
    throw new AppError('Cannot update status of a delivered order item', 400, {});
  }

  // Prepare update data
  const updateData: any = {
    status: data.status,
    updatedAt: new Date()
  };

  // If marking as delivered, set deliveredAt timestamp
  if (data.status === OrderItemStatus.DELIVERED) {
    updateData.deliveredAt = new Date();
  }

  // If cancelled, save the reason
  if (data.status === OrderItemStatus.CANCELLED && data.reason) {
    updateData.cancelledReason = data.reason;
    
    // Restore product stock if cancelled
    await prisma.product.update({
      where: { id: orderItem.productId },
      data: { 
        quantity: { increment: orderItem.quantity },
        updatedAt: new Date()
      }
    });
  }

  // Update the order item
  const updatedOrderItem = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: updateData,
    include: {
      product: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          sellerId: true
        }
      },
      order: {
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  // Update overall order status
  await this.updateOrderStatus(orderItem.orderId);

  // Create notification for buyer
  await this.createStatusChangeNotification(
    orderItem.order.buyerId,
    orderItemId,
    data.status,
    orderItem.product.title,
    data.reason
  );

  return updatedOrderItem;
}

  // Cancel order item with reason
  async cancelOrderItem(
    orderItemId: number, 
    sellerId: number,
    data: CancelOrderItemDto
  ) {
    return this.updateOrderItemStatus(orderItemId, sellerId, {
      status: OrderItemStatus.CANCELLED,
      reason: data.reason
    });
  }

  // Mark order item as delivered
  async markAsDelivered(orderItemId: number, sellerId: number) {
    return this.updateOrderItemStatus(orderItemId, sellerId, {
      status: OrderItemStatus.DELIVERED
    });
  }

 // Update overall order status based on item statuses
// Update overall order status based on item statuses
private async updateOrderStatus(orderId: number) {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId }
  });

  if (orderItems.length === 0) return;

  // Count statuses - initialize with all possible statuses
  const statusCounts = {
    [OrderItemStatus.PENDING]: 0,
    [OrderItemStatus.PROCESSING]: 0,
    [OrderItemStatus.SHIPPED]: 0,
    [OrderItemStatus.DELIVERED]: 0,
    [OrderItemStatus.CANCELLED]: 0
  };

  orderItems.forEach(item => {
    // Use a fallback to ensure status is never undefined
    const itemStatus = item.status || OrderItemStatus.PENDING;
    statusCounts[itemStatus]++;
  });

  // Determine overall order status
  let orderStatus: OrderStatus;

  if (statusCounts[OrderItemStatus.CANCELLED] === orderItems.length) {
    orderStatus = OrderStatus.CANCELLED;
  } else if (statusCounts[OrderItemStatus.DELIVERED] === orderItems.length) {
    orderStatus = OrderStatus.DELIVERED;
  } else if (statusCounts[OrderItemStatus.DELIVERED] > 0) {
    orderStatus = OrderStatus.PARTIALLY_DELIVERED;
  } else if (statusCounts[OrderItemStatus.PROCESSING] > 0 || statusCounts[OrderItemStatus.SHIPPED] > 0) {
    orderStatus = OrderStatus.PROCESSING;
  } else {
    orderStatus = OrderStatus.PENDING;
  }

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: orderStatus,
      updatedAt: new Date()
    }
  });
}

// Create notification for status change
private async createStatusChangeNotification(
  buyerId: number,
  orderItemId: number,
  status: OrderItemStatus,
  productTitle: string,
  reason?: string
) {
  // Ensure status is never undefined
  const itemStatus = status || OrderItemStatus.PENDING;
  
  // Create a type-safe mapping
  const statusMessages: Record<OrderItemStatus, string> = {
    [OrderItemStatus.PENDING]: `Your order item "${productTitle}" is pending`,
    [OrderItemStatus.PROCESSING]: `Your order item "${productTitle}" is now being processed`,
    [OrderItemStatus.SHIPPED]: `Your order item "${productTitle}" has been shipped`,
    [OrderItemStatus.DELIVERED]: `Your order item "${productTitle}" has been delivered`,
    [OrderItemStatus.CANCELLED]: `Your order item "${productTitle}" has been cancelled${reason ? `: ${reason}` : ''}`
  };

  await prisma.notification.create({
    data: {
      userId: buyerId,
      type: 'ITEM_STATUS_CHANGED',
      title: 'Order Status Updated',
      message: statusMessages[itemStatus],
      metadata: {
        orderItemId,
        status: itemStatus,
        productTitle,
        ...(reason && { cancellationReason: reason })
      }
    }
  });
}

  // Get order item details for status update
  async getOrderItemDetails(orderItemId: number, sellerId: number) {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        product: {
          sellerId: sellerId
        }
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        },
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!orderItem) {
      throw new AppError('Order item not found or unauthorized', 404, {});
    }

    return orderItem;
  }
async getOrderById(orderId: number, buyerId: number) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      buyerId: buyerId
    },
    select: {
      id: true,
      buyerId: true,
      total: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          status: true,
          cancelledReason: true,
          deliveredAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              imageUrl: true,
              sellerId: true
            }
          }
        }
      }
    }
  });

  return order;
}

// Mark as received (buyer only)
async markAsReceived(orderItemId: number, buyerId: number) {
  // First, verify the order item exists and belongs to this buyer
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      order: {
        buyerId: buyerId
      }
    },
    include: {
      order: {
        include: {
          buyer: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      product: {
        include: {
          seller: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  if (!orderItem) {
    throw new AppError('Order item not found or you do not have permission', 404, {});
  }

  // Check if the item is in DELIVERED status (can only mark as received if delivered)
  if (orderItem.status !== 'DELIVERED') {
    throw new AppError(`Cannot mark as received. Item status is ${orderItem.status}`, 400, {});
  }

  // Update the status to RECEIVED
  const updatedItem = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      status: 'RECEIVED',
      updatedAt: new Date()
    },
    include: {
      order: {
        include: {
          buyer: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      product: {
        include: {
          seller: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  // Create notification for the seller
  await prisma.notification.create({
    data: {
      userId: orderItem.product.sellerId,
      type: 'ITEM_STATUS_CHANGED',
      title: 'Item Received',
      message: `Buyer has confirmed receipt of "${orderItem.product.title}"`,
      metadata: {
        orderItemId: orderItemId,
        orderId: orderItem.orderId,
        productId: orderItem.productId,
        buyerId: buyerId,
        buyerName: orderItem.order.buyer.name,
        status: 'RECEIVED'
      }
    }
  });

  // Check if all items in the order are RECEIVED
  const allItemsInOrder = await prisma.orderItem.findMany({
    where: { orderId: orderItem.orderId }
  });

  const allReceived = allItemsInOrder.every(item => 
    item.status === 'RECEIVED' || item.status === 'CANCELLED'
  );

  // If all items are received, update order status
  if (allReceived) {
    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: {
        status: 'DELIVERED', // or 'COMPLETED' based on your enum
        updatedAt: new Date()
      }
    });

    // Notify buyer that order is complete
    await prisma.notification.create({
      data: {
        userId: buyerId,
        type: 'ORDER_STATUS_CHANGED',
        title: 'Order Completed',
        message: 'All items in your order have been received. Thank you for shopping!',
        metadata: {
          orderId: orderItem.orderId
        }
      }
    });
  }

  return updatedItem;
}
}