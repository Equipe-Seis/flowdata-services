/*
  Warnings:

  - You are about to drop the column `supplierId` on the `SupplyItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SupplyItem" DROP CONSTRAINT "SupplyItem_supplierId_fkey";

-- AlterTable
ALTER TABLE "public"."SupplyItem" DROP COLUMN "supplierId";
