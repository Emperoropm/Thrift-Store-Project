import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
    getConversations,
    getConversationMessages,
    createConversation,
    sendMessage,
    markConversationAsRead,
    markMessageAsRead
} from './chat.controller';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Create a new conversation
router.post('/conversations', createConversation);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getConversationMessages);

// Send a message
router.post('/messages', sendMessage);

// Mark conversation as read
router.post('/conversations/:conversationId/read', markConversationAsRead);

// Mark single message as read
router.post('/messages/:messageId/read', markMessageAsRead);

export default router;