"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMessageAsRead = exports.markConversationAsRead = exports.sendMessage = exports.getConversationMessages = exports.createConversation = exports.getConversations = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../error/app.error");
const prisma = new client_1.PrismaClient();
// Get all conversations for current user
const getConversations = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new app_error_1.AppError('User not authenticated', 401, {});
        }
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photo: true
                    }
                },
                user2: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photo: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                photo: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                {
                    updatedAt: 'desc'
                },
                {
                    createdAt: 'desc'
                }
            ]
        });
        // Get unread counts for each conversation
        const conversationsWithDetails = await Promise.all(conversations.map(async (conv) => {
            // Count unread messages where:
            // 1. Message is not from current user
            // 2. Message is not read
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    read: false
                }
            });
            console.log(`Conversation ${conv.id} unread count: ${unreadCount}`); // Debug log
            // Get last message
            const lastMessage = conv.messages[0] || null;
            return {
                id: conv.id,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
                otherUser: conv.user1Id === userId ? conv.user2 : conv.user1,
                lastMessage,
                unreadCount: unreadCount // Make sure this is included
            };
        }));
        // Sort by last message time (most recent first)
        conversationsWithDetails.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
            const bTime = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        res.json({
            success: true,
            data: conversationsWithDetails
        });
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
};
exports.getConversations = getConversations;
// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { otherUserId } = req.body;
        if (!userId) {
            throw new app_error_1.AppError('User not authenticated', 401, {});
        }
        if (userId === otherUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create conversation with yourself'
            });
        }
        // Check if other user exists
        const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: { id: true, name: true, photo: true }
        });
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if conversation already exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: userId, user2Id: otherUserId },
                    { user1Id: otherUserId, user2Id: userId }
                ]
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        name: true,
                        photo: true
                    }
                },
                user2: {
                    select: {
                        id: true,
                        name: true,
                        photo: true
                    }
                }
            }
        });
        // If not, create new conversation
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: userId,
                    user2Id: otherUserId
                },
                include: {
                    user1: {
                        select: {
                            id: true,
                            name: true,
                            photo: true
                        }
                    },
                    user2: {
                        select: {
                            id: true,
                            name: true,
                            photo: true
                        }
                    }
                }
            });
        }
        res.json({
            success: true,
            data: {
                id: conversation.id,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
                otherUser: conversation.user1Id === userId ? conversation.user2 : conversation.user1
            }
        });
    }
    catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create conversation'
        });
    }
};
exports.createConversation = createConversation;
// Get messages for a conversation
const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;
        if (!userId) {
            throw new app_error_1.AppError('User not authenticated', 401, {});
        }
        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: parseInt(conversationId),
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            }
        });
        if (!conversation) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        const messages = await prisma.message.findMany({
            where: {
                conversationId: parseInt(conversationId)
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        photo: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        res.json({
            success: true,
            data: messages
        });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};
exports.getConversationMessages = getConversationMessages;
// Send a message
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user?.id;
        const { conversationId, content } = req.body;
        if (!senderId) {
            throw new app_error_1.AppError('User not authenticated', 401, {});
        }
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message content cannot be empty'
            });
        }
        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { user1Id: senderId },
                    { user2Id: senderId }
                ]
            }
        });
        if (!conversation) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        // Create the message
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
        // Update conversation's updatedAt to move it to the top of the list
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        // Emit socket event for real-time delivery
        // You'll need to access the io instance - you might want to export it from your socket file
        const io = req.app.get('io'); // Make sure to set io in app
        if (io) {
            // Emit to conversation room
            io.to(`chat-${conversationId}`).emit('newMessage', message);
            // Notify the other user
            const otherUserId = conversation.user1Id === senderId
                ? conversation.user2Id
                : conversation.user1Id;
            io.to(`user-${otherUserId}`).emit('newMessageNotification', {
                conversationId,
                message
            });
        }
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
};
exports.sendMessage = sendMessage;
// Mark conversation as read
const markConversationAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;
        if (!userId) {
            throw new app_error_1.AppError('User not authenticated', 401, {});
        }
        await prisma.message.updateMany({
            where: {
                conversationId: parseInt(conversationId),
                senderId: { not: userId },
                read: false
            },
            data: {
                read: true
            }
        });
        res.json({
            success: true,
            message: 'Conversation marked as read'
        });
    }
    catch (error) {
        console.error('Error marking conversation as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark conversation as read'
        });
    }
};
exports.markConversationAsRead = markConversationAsRead;
// Mark single message as read
const markMessageAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { messageId } = req.params;
        if (!userId) {
            throw new app_error_1.AppError('User not authenticated', 401, {});
        }
        await prisma.message.update({
            where: {
                id: parseInt(messageId)
            },
            data: {
                read: true
            }
        });
        res.json({
            success: true,
            message: 'Message marked as read'
        });
    }
    catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read'
        });
    }
};
exports.markMessageAsRead = markMessageAsRead;
//# sourceMappingURL=chat.controller.js.map