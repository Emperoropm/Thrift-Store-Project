/*
  Warnings:

  - Added the required column `updatedAt` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First, add the column as nullable (temporary)
ALTER TABLE "Conversation" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Set default value for existing rows (use current timestamp)
UPDATE "Conversation" SET "updatedAt" = CURRENT_TIMESTAMP;

-- Now make it required and set default for future rows
ALTER TABLE "Conversation" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "Conversation" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;