"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.findOrCreateConversation = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const findOrCreateConversation = async (user1Id, user2Id) => {
    let convo = await prisma.conversation.findFirst({
        where: {
            OR: [
                { user1Id, user2Id },
                { user1Id: user2Id, user2Id: user1Id }
            ]
        }
    });
    if (!convo) {
        convo = await prisma.conversation.create({
            data: {
                user1Id,
                user2Id
            }
        });
    }
    return convo;
};
exports.findOrCreateConversation = findOrCreateConversation;
const createMessage = async (conversationId, senderId, content) => {
    return prisma.message.create({
        data: {
            conversationId,
            senderId,
            content
        }
    });
};
exports.createMessage = createMessage;
//# sourceMappingURL=chat.service.js.map