import { Prisma,PrismaClient } from "@prisma/client";

const prisma= new PrismaClient();


export const findOrCreateConversation = async (user1Id:number,user2Id:number)=>{

  let convo = await prisma.conversation.findFirst({
    where:{
      OR:[
        {user1Id,user2Id},
        {user1Id:user2Id,user2Id:user1Id}
      ]
    }
  });

  if(!convo){

    convo = await prisma.conversation.create({
      data:{
        user1Id,
        user2Id
      }
    });

  }

  return convo;

};

export const createMessage = async (
  conversationId:number,
  senderId:number,
  content:string
)=>{

  return prisma.message.create({
    data:{
      conversationId,
      senderId,
      content
    }
  });

};