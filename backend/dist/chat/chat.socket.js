"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const chatSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            credentials: true
        }
    });
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
            if (!token) {
                return next(new Error("Authentication required"));
            }
            const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
            const decoded = (0, jwt_1.verifyToken)(actualToken);
            socket.userId = decoded.id;
            next();
        }
        catch (error) {
            console.error("Socket authentication error:", error);
            next(new Error("Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id, "User ID:", socket.userId);
        // Join user to their personal room for direct notifications
        if (socket.userId) {
            socket.join(`user-${socket.userId}`);
            console.log(`User ${socket.userId} joined their personal room`);
        }
        // Handle joining user room (called from client)
        socket.on("joinUserRoom", (userId) => {
            if (socket.userId === userId) {
                socket.join(`user-${userId}`);
                console.log(`User ${userId} joined room via event`);
            }
        });
        socket.on("joinChat", (conversationId) => {
            socket.join(`chat-${conversationId}`);
            console.log(`User ${socket.userId} joined chat ${conversationId}`);
        });
        socket.on("sendMessage", async (data) => {
            try {
                const { conversationId, content } = data;
                const senderId = socket.userId;
                if (!senderId) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                if (!content || !content.trim()) {
                    socket.emit("error", { message: "Message cannot be empty" });
                    return;
                }
                const conversation = await prisma.conversation.findFirst({
                    where: {
                        id: conversationId,
                        OR: [
                            { user1Id: senderId },
                            { user2Id: senderId }
                        ]
                    },
                    include: {
                        user1: true,
                        user2: true
                    }
                });
                if (!conversation) {
                    socket.emit("error", { message: "Access denied" });
                    return;
                }
                const message = await prisma.message.create({
                    data: {
                        conversationId,
                        senderId,
                        content: content.trim()
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                photo: true
                            }
                        }
                    }
                });
                await prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() }
                });
                // Emit to conversation room
                io.to(`chat-${conversationId}`).emit("newMessage", message);
                const otherUserId = conversation.user1Id === senderId
                    ? conversation.user2Id
                    : conversation.user1Id;
                console.log(`Sending notification to user ${otherUserId}`);
                // Emit to other user's personal room
                io.to(`user-${otherUserId}`).emit("newMessageNotification", {
                    conversationId,
                    message: {
                        ...message,
                        conversationId: conversationId
                    }
                });
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
        socket.on("typing", (data) => {
            const { conversationId, userName } = data;
            socket.to(`chat-${conversationId}`).emit("userTyping", {
                conversationId,
                userName
            });
        });
        socket.on("stopTyping", (data) => {
            const { conversationId } = data;
            socket.to(`chat-${conversationId}`).emit("userStoppedTyping", {
                conversationId
            });
        });
        socket.on("markAsRead", async (data) => {
            try {
                const { messageIds, conversationId } = data;
                const userId = socket.userId;
                if (!userId)
                    return;
                await prisma.message.updateMany({
                    where: {
                        id: { in: messageIds },
                        conversationId,
                        senderId: { not: userId },
                        read: false
                    },
                    data: {
                        read: true
                    }
                });
                io.to(`chat-${conversationId}`).emit("messageRead", {
                    messageIds,
                    conversationId,
                    readBy: userId
                });
            }
            catch (error) {
                console.error("Error marking messages as read:", error);
            }
        });
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id, "User ID:", socket.userId);
        });
    });
    return io;
};
exports.chatSocket = chatSocket;
//# sourceMappingURL=chat.socket.js.map