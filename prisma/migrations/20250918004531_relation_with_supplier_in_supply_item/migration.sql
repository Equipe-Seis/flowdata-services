/*
  Warnings:

  - Added the required column `supplierId` to the `SupplyItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SupplyItem" ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."SupplyItem" ADD CONSTRAINT "SupplyItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
