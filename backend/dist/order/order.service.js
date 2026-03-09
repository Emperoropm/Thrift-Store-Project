"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../error/app.error");
const prisma = new client_1.PrismaClient();
class OrderService {
    // products: array of { productId, quantity }
    async createOrder(buyerId, products) {
        let total = 0;
        // Fetch all products
        const productRecords = await prisma.product.findMany({
            where: { id: { in: products.map(p => p.productId) } }
        });
        if (productRecords.length !== products.length) {
            throw new app_error_1.AppError("One or more products not found", 404, {});
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
                total
            }
        });
        // Create OrderItems
        const orderItemsData = products.map(item => {
            const product = productRecords.find(p => p.id === item.productId);
            return {
                orderId: order.id,
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            };
        });
        await prisma.orderItem.createMany({ data: orderItemsData });
        // Update product stock
        for (const item of products) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { quantity: { decrement: item.quantity } }
            });
        }
        // Fetch full order details including products and seller info
        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, title: true, sellerId: true } // show sellerId
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
                product: { sellerId } // only products that belong to this seller
            },
            include: {
                product: { select: { id: true, title: true } },
                order: { select: { id: true, buyerId: true, total: true, createdAt: true } }
            },
            orderBy: { id: "desc" }
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
                            select: { id: true, title: true, sellerId: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return orders;
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map