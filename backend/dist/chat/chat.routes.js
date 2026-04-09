"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const chat_controller_1 = require("./chat.controller");
const router = (0, express_1.Router)();
// All chat routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Get all conversations for current user
router.get('/conversations', chat_controller_1.getConversations);
// Create a new conversation
router.post('/conversations', chat_controller_1.createConversation);
// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', chat_controller_1.getConversationMessages);
// Send a message
router.post('/messages', chat_controller_1.sendMessage);
// Mark conversation as read
router.post('/conversations/:conversationId/read', chat_controller_1.markConversationAsRead);
// Mark single message as read
router.post('/messages/:messageId/read', chat_controller_1.markMessageAsRead);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map