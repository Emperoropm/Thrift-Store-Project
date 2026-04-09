"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../error/app.error");
const mailer_1 = require("../utils/mailer"); // ← NEW
const email_templates_1 = require("../utils/email-templates"); // ← NEW
const prisma = new client_1.PrismaClient();
class OrderService {
    // products: array of { productId, quantity }
    async createOrder(buyerId, products) {
        let total = 0;
        // Fetch all products with seller info so we can email them
        const productRecords = await prisma.product.findMany({
            where: {
                id: { in: products.map(p => p.productId) },
                status: 'APPROVED'
            },
            include: {
                seller: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        if (productRecords.length !== products.length) {
            throw new app_error_1.AppError("One or more products not found or not approved", 404, {});
        }
        // Validate stock and calculate total
        for (const item of products) {
            const product = productRecords.find(p => p.id === item.productId);
            if (product.quantity < item.quantity) {
                throw new app_error_1.AppError(`Insufficient stock for product ${product.title}`, 400, {});
            }
            total += product.price * item.quantity;
        }
        // Create Order
        const order = await prisma.order.create({
            data: {
                buyerId,
                total,
                status: client_1.OrderStatus.PENDING
            }
        });
        // Create OrderItems
        const orderItemsData = products.map(item => {
            const product = productRecords.find(p => p.id === item.productId);
            return {
                orderId: order.id,
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
                status: client_1.OrderItemStatus.PENDING
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
        // Fetch buyer info for notification + email
        const buyer = await prisma.user.findUnique({
            where: { id: buyerId },
            select: { id: true, name: true, email: true, phone: true }
        });
        // ── In-app notifications + emails, grouped per seller ─────────────────────
        //
        // We group items by seller so each seller gets ONE email listing
        // all of their products in this order (not one email per product).
        //
        const sellerItemMap = new Map();
        for (const item of products) {
            const product = productRecords.find(p => p.id === item.productId);
            if (product.sellerId === buyerId)
                continue; // skip self-purchase
            // In-app notification (unchanged from your original code)
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
            // Group by seller for email
            if (!sellerItemMap.has(product.sellerId)) {
                sellerItemMap.set(product.sellerId, { seller: product.seller, items: [] });
            }
            // Push a copy of the product record augmented with the ordered quantity
            sellerItemMap.get(product.sellerId).items.push({ ...product, _orderedQty: item.quantity });
        }
        // ── Send one email per seller ──────────────────────────────────────────────
        // Retrieve shipping info stored by the frontend in pendingOrderData.
        // It is NOT in the DB, so we read it from the order's payment transaction
        // metadata if available — or fall back to null (email still shows buyer info).
        //
        // NOTE: shipping info is stored in localStorage on the frontend and NOT
        // persisted to the DB in your current setup. To make it available here you
        // can either (a) pass it as a parameter from the controller, or (b) store it
        // in the PaymentTransaction.paymentData field. For now we pass it as an
        // optional parameter so the controller can forward it from req.body.
        //
        for (const [, { seller, items }] of sellerItemMap) {
            const emailItems = items.map((p) => ({
                title: p.title,
                quantity: p._orderedQty,
                price: p.price
            }));
            const sellerTotal = emailItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
            const html = (0, email_templates_1.buildSellerOrderEmail)({
                sellerName: seller.name || 'Seller',
                buyer: {
                    name: buyer?.name || 'Customer',
                    email: buyer?.email || '',
                    phone: buyer?.phone ?? null
                },
                shippingInfo: null, // see NOTE above — pass from controller if available
                items: emailItems,
                orderId: order.id,
                orderTotal: sellerTotal
            });
            await (0, mailer_1.sendMail)({
                to: seller.email,
                subject: `🛍️ New Order #${order.id} — ThriftTreasure`,
                html
            });
        }
        // ──────────────────────────────────────────────────────────────────────────
        // Fetch full order details
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
                                images: true
                            }
                        }
                    }
                }
            }
        });
        return fullOrder;
    }
    async getSellerOrders(sellerId) {
        const soldItems = await prisma.orderItem.findMany({
            where: {
                product: { sellerId }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        images: true
                    }
                },
                order: {
                    select: {
                        id: true,
                        buyerId: true,
                        total: true,
                        createdAt: true,
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
                updatedAt: 'desc'
            }
        });
        return soldItems;
    }
    async getBuyerOrders(buyerId) {
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
                                images: true
                            }
                        }
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return orders;
    }
    // Update order item status (for sellers)
    async updateOrderItemStatus(orderItemId, sellerId, data) {
        const orderItem = await prisma.orderItem.findFirst({
            where: {
                id: orderItemId,
                product: { sellerId: sellerId }
            },
            include: {
                product: true,
                order: true
            }
        });
        if (!orderItem) {
            throw new app_error_1.AppError('Order item not found or unauthorized', 404, {});
        }
        const currentStatus = orderItem.status || client_1.OrderItemStatus.PENDING;
        if (currentStatus === client_1.OrderItemStatus.CANCELLED && data.status !== client_1.OrderItemStatus.CANCELLED) {
            throw new app_error_1.AppError('Cannot update status of a cancelled order item', 400, {});
        }
        if (currentStatus === client_1.OrderItemStatus.DELIVERED && data.status !== client_1.OrderItemStatus.DELIVERED) {
            throw new app_error_1.AppError('Cannot update status of a delivered order item', 400, {});
        }
        const updateData = {
            status: data.status,
            updatedAt: new Date()
        };
        if (data.status === client_1.OrderItemStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        if (data.status === client_1.OrderItemStatus.CANCELLED && data.reason) {
            updateData.cancelledReason = data.reason;
            await prisma.product.update({
                where: { id: orderItem.productId },
                data: {
                    quantity: { increment: orderItem.quantity },
                    updatedAt: new Date()
                }
            });
        }
        const updatedOrderItem = await prisma.orderItem.update({
            where: { id: orderItemId },
            data: updateData,
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
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
        await this.updateOrderStatus(orderItem.orderId);
        await this.createStatusChangeNotification(orderItem.order.buyerId, orderItemId, data.status, orderItem.product.title, data.reason);
        return updatedOrderItem;
    }
    async cancelOrderItem(orderItemId, sellerId, data) {
        return this.updateOrderItemStatus(orderItemId, sellerId, {
            status: client_1.OrderItemStatus.CANCELLED,
            reason: data.reason
        });
    }
    async markAsDelivered(orderItemId, sellerId) {
        return this.updateOrderItemStatus(orderItemId, sellerId, {
            status: client_1.OrderItemStatus.DELIVERED
        });
    }
    async updateOrderStatus(orderId) {
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId }
        });
        if (orderItems.length === 0)
            return;
        const statusCounts = {
            [client_1.OrderItemStatus.PENDING]: 0,
            [client_1.OrderItemStatus.PROCESSING]: 0,
            [client_1.OrderItemStatus.SHIPPED]: 0,
            [client_1.OrderItemStatus.DELIVERED]: 0,
            [client_1.OrderItemStatus.CANCELLED]: 0,
            RECEIVED: 0,
        };
        orderItems.forEach(item => {
            const itemStatus = item.status || client_1.OrderItemStatus.PENDING;
            statusCounts[itemStatus]++;
        });
        let orderStatus;
        if (statusCounts[client_1.OrderItemStatus.CANCELLED] === orderItems.length) {
            orderStatus = client_1.OrderStatus.CANCELLED;
        }
        else if (statusCounts[client_1.OrderItemStatus.DELIVERED] === orderItems.length) {
            orderStatus = client_1.OrderStatus.DELIVERED;
        }
        else if (statusCounts[client_1.OrderItemStatus.DELIVERED] > 0) {
            orderStatus = client_1.OrderStatus.PARTIALLY_DELIVERED;
        }
        else if (statusCounts[client_1.OrderItemStatus.PROCESSING] > 0 || statusCounts[client_1.OrderItemStatus.SHIPPED] > 0) {
            orderStatus = client_1.OrderStatus.PROCESSING;
        }
        else {
            orderStatus = client_1.OrderStatus.PENDING;
        }
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: orderStatus,
                updatedAt: new Date()
            }
        });
    }
    async createStatusChangeNotification(buyerId, orderItemId, status, productTitle, reason) {
        const itemStatus = status || client_1.OrderItemStatus.PENDING;
        const statusMessages = {
            [client_1.OrderItemStatus.PENDING]: `Your order item "${productTitle}" is pending`,
            [client_1.OrderItemStatus.PROCESSING]: `Your order item "${productTitle}" is now being processed`,
            [client_1.OrderItemStatus.SHIPPED]: `Your order item "${productTitle}" has been shipped`,
            [client_1.OrderItemStatus.DELIVERED]: `Your order item "${productTitle}" has been delivered`,
            [client_1.OrderItemStatus.CANCELLED]: `Your order item "${productTitle}" has been cancelled${reason ? `: ${reason}` : ''}`,
            RECEIVED: "Item received",
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
    async getOrderItemDetails(orderItemId, sellerId) {
        const orderItem = await prisma.orderItem.findFirst({
            where: {
                id: orderItemId,
                product: { sellerId: sellerId }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        images: true
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
            throw new app_error_1.AppError('Order item not found or unauthorized', 404, {});
        }
        return orderItem;
    }
    async getOrderById(orderId, buyerId) {
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
                                images: true,
                                sellerId: true
                            }
                        }
                    }
                }
            }
        });
        return order;
    }
    async markAsReceived(orderItemId, buyerId) {
        const orderItem = await prisma.orderItem.findFirst({
            where: {
                id: orderItemId,
                order: { buyerId: buyerId }
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
            throw new app_error_1.AppError('Order item not found or you do not have permission', 404, {});
        }
        if (orderItem.status !== 'DELIVERED') {
            throw new app_error_1.AppError(`Cannot mark as received. Item status is ${orderItem.status}`, 400, {});
        }
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
        const allItemsInOrder = await prisma.orderItem.findMany({
            where: { orderId: orderItem.orderId }
        });
        const allReceived = allItemsInOrder.every(item => item.status === 'RECEIVED' || item.status === 'CANCELLED');
        if (allReceived) {
            await prisma.order.update({
                where: { id: orderItem.orderId },
                data: {
                    status: 'DELIVERED',
                    updatedAt: new Date()
                }
            });
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
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map