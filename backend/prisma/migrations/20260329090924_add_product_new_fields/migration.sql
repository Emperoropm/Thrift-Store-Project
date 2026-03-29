/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "location" JSONB,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "refundable" BOOLEAN NOT NULL DEFAULT true;
