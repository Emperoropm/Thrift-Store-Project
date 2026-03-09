-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Update existing rows with current createdAt as updatedAt
UPDATE "Order" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Now make updatedAt required
ALTER TABLE "Order" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "cancelledReason" TEXT,
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Update existing rows with current timestamp
UPDATE "OrderItem" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;

-- Now make updatedAt required
ALTER TABLE "OrderItem" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterEnum (Add new notification types)
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_PLACED';
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_STATUS_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'ITEM_STATUS_CHANGED';

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");