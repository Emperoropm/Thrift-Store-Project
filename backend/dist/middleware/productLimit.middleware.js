"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDailyProductLimit = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const checkDailyProductLimit = async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Get seller data
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { dailyProductCount: true, lastProductDate: true }
        });
        if (!seller) {
            return res.status(404).json({ error: 'User not found' });
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
            next();
        }
        else {
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
                return res.status(400).json({
                    error: 'Daily limit reached',
                    message: 'You can only add 2 products per day. Please try again tomorrow.'
                });
            }
            next();
        }
    }
    catch (error) {
        next(error);
    }
};
exports.checkDailyProductLimit = checkDailyProductLimit;
//# sourceMappingURL=productLimit.middleware.js.map