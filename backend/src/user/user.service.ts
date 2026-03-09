import { PrismaClient } from '@prisma/client';
import { AppError } from "../error/app.error";
const prisma = new PrismaClient();

export class UserService {
  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true, // 👈 ADD THIS
        createdAt: true
      }
    });

    if (!user) throw new AppError("User not found", 404, {});

    return user;
  }

  // 👇 ADD THIS: Method to update user photo
  async updateUserPhoto(userId: number, photoPath: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { photo: photoPath },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        createdAt: true
      }
    });

    return user;
  }

  // 👇 ADD THIS: Method to remove user photo
  async removeUserPhoto(userId: number) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { photo: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        createdAt: true
      }
    });

    return user;
  }

  // Add to UserService class
async getSellerPhoto(sellerId: number) {
    const user = await prisma.user.findUnique({
        where: { id: sellerId },
        select: {
            photo: true
        }
    });
    
    return user;
}
}